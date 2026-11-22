package com.examflow.backend.service.serviceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.examflow.backend.config.NoConfig;
import com.examflow.backend.dto.ClassRecordingRequest;
import com.examflow.backend.dto.ClassRecordingResponse;
import com.examflow.backend.dto.ClassRecordingSaveResponse;
import com.examflow.backend.entity.ClassRecording;
import com.examflow.backend.entity.NoConfiguration;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.repository.ClassRecordingRepository;
import com.examflow.backend.repository.NoConfigRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.ClassRecordingControllerManager;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class ClassRecordingControllerManagerImpl implements ClassRecordingControllerManager {

    // The no_config row that makes the recording codes: REC-1001, REC-1002, ...
    private static final String RECORDING_NUMBER_CONFIG = "recording";
    private static final String RECORDING_CODE_PREFIX = "REC-";
    private static final int RECORDING_FIRST_NUMBER = 1001;

    private static final int TITLE_MAX = 120;
    private static final int VIDEO_URL_MAX = 500;
    private static final int DURATION_MAX_MINS = 24 * 60;

    private final HttpServletRequest request;
    private final ClassRecordingRepository classRecordingRepository;
    private final TutorRepository tutorRepository;
    private final NoConfigRepository noConfigRepository;
    private final NoConfig noConfig;

    @Autowired
    public ClassRecordingControllerManagerImpl(HttpServletRequest request,
            ClassRecordingRepository classRecordingRepository, TutorRepository tutorRepository,
            NoConfigRepository noConfigRepository, NoConfig noConfig) {
        this.request = request;
        this.classRecordingRepository = classRecordingRepository;
        this.tutorRepository = tutorRepository;
        this.noConfigRepository = noConfigRepository;
        this.noConfig = noConfig;
    }

    @Override
    @Transactional
    public ClassRecordingSaveResponse saveRecording(ClassRecordingRequest recordingRequest) {

        ClassRecordingSaveResponse response = new ClassRecordingSaveResponse();

        boolean admin = isAdmin();
        if (!admin && !isTutor()) {
            return failed(response, "Only an admin or a teacher can save a recording.");
        }

        // A teacher's recording is always their own; the request can't name someone else.
        Integer tutorSeq = admin ? recordingRequest.getTutorId() : (Integer) request.getAttribute("userId");
        if (tutorSeq == null) {
            return failed(response, "Select a teacher.");
        }
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        if (tutor == null) {
            return failed(response, "That teacher could not be found.");
        }

        // Repeats every rule the page checks, because the page can be bypassed.
        String title = recordingRequest.getTitle() == null ? "" : recordingRequest.getTitle().trim().replaceAll("\\s+", " ");
        if (title.isEmpty()) {
            return failed(response, "Give the recording a title.");
        }
        if (title.length() > TITLE_MAX) {
            return failed(response, "The title can be up to " + TITLE_MAX + " characters.");
        }

        LocalDate classDate = null;
        if (recordingRequest.getClassDate() != null && !recordingRequest.getClassDate().isBlank()) {
            try {
                classDate = LocalDate.parse(recordingRequest.getClassDate().trim());
            } catch (DateTimeParseException e) {
                return failed(response, "The class date must be a date (YYYY-MM-DD).");
            }
        }

        Integer duration = recordingRequest.getDurationMins();
        if (duration != null && (duration < 0 || duration > DURATION_MAX_MINS)) {
            return failed(response, "The duration must be between 0 and " + DURATION_MAX_MINS + " minutes.");
        }

        String videoUrl = recordingRequest.getVideoUrl() == null ? "" : recordingRequest.getVideoUrl().trim();
        if (!videoUrl.isEmpty()
                && (videoUrl.length() > VIDEO_URL_MAX || !videoUrl.matches("^https?://\\S+$"))) {
            return failed(response, "The video link must start with http:// or https://.");
        }

        String code = nextRecordingCode();
        if (code == null) {
            return failed(response, "A recording code could not be made. Please try again.");
        }

        String username = currentUsername();
        LocalDateTime now = LocalDateTime.now();

        ClassRecording recording = new ClassRecording();
        recording.setRecordingCode(code);
        recording.setTitle(title);
        recording.setTutor(tutor);
        recording.setClassDate(classDate);
        recording.setDurationMins(duration);
        recording.setVideoUrl(videoUrl.isEmpty() ? null : videoUrl);
        recording.setStatus(ClassRecording.STATUS_ACTIVE);
        recording.setCreatedBy(username);
        recording.setLastModifiedBy(username);
        recording.setCreatedDateTime(now);
        recording.setLastModifiedDateTime(now);
        classRecordingRepository.save(recording);

        response.setIsSuccess(true);
        response.setMessage("Recording saved");
        response.setRecording(toResponse(recording));
        return response;
    }

    @Override
    public ClassRecordingResponse findRecordingByCode(String code) {

        boolean admin = isAdmin();
        if (!admin && !isTutor()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only an admin or a teacher can look up recordings.");
        }

        // Codes are kept upper case with no spaces, however they were typed.
        String wanted = code == null ? "" : code.replaceAll("\\s+", "").toUpperCase();
        if (wanted.isEmpty()) {
            return null;
        }
        ClassRecording recording = classRecordingRepository.findByRecordingCodeIgnoreCaseAndStatus(wanted,
                ClassRecording.STATUS_ACTIVE);
        if (recording == null) {
            return null;
        }
        // A teacher's lookup finds only their own recordings.
        if (!admin && !recording.getTutor().getTutorSeq().equals(request.getAttribute("userId"))) {
            return null;
        }
        return toResponse(recording);
    }

    @Override
    public List<ClassRecordingResponse> listRecordings(Integer tutorId) {

        boolean admin = isAdmin();
        if (!admin && !isTutor()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only an admin or a teacher can see recordings.");
        }

        List<ClassRecording> recordings;
        if (admin) {
            Tutor tutor = tutorId == null ? null : tutorRepository.findByTutorSeq(tutorId);
            recordings = tutorId == null
                    ? classRecordingRepository.findByStatusOrderByCreatedDateTimeDesc(ClassRecording.STATUS_ACTIVE)
                    : tutor == null ? new ArrayList<>()
                            : classRecordingRepository.findByTutorAndStatusOrderByCreatedDateTimeDesc(tutor,
                                    ClassRecording.STATUS_ACTIVE);
        } else {
            // A teacher only ever sees their own; any tutorId in the request is ignored.
            Tutor tutor = tutorRepository.findByTutorSeq((Integer) request.getAttribute("userId"));
            recordings = tutor == null ? new ArrayList<>()
                    : classRecordingRepository.findByTutorAndStatusOrderByCreatedDateTimeDesc(tutor,
                            ClassRecording.STATUS_ACTIVE);
        }

        List<ClassRecordingResponse> responses = new ArrayList<>();
        for (ClassRecording recording : recordings) {
            responses.add(toResponse(recording));
        }
        return responses;
    }

    // The next code from the "recording" no_config row (REC-1001, REC-1002, ...). The row is added the first time
    // it is needed, so nothing has to be inserted by hand. Null if the code could not be made.
    private String nextRecordingCode() {
        if (noConfigRepository.findByNoConfigName(RECORDING_NUMBER_CONFIG) == null) {
            NoConfiguration config = new NoConfiguration();
            config.setNoConfigName(RECORDING_NUMBER_CONFIG);
            config.setSuffix(RECORDING_CODE_PREFIX);
            config.setNextNumber(RECORDING_FIRST_NUMBER);
            config.setNoConfigValue(1);
            noConfigRepository.save(config);
        }
        String code = noConfig.NoConfigCreation(RECORDING_NUMBER_CONFIG);
        return code == null || code.isBlank() ? null : code;
    }

    private ClassRecordingResponse toResponse(ClassRecording recording) {
        ClassRecordingResponse response = new ClassRecordingResponse();
        response.setId(recording.getRecordingSeq());
        response.setCode(recording.getRecordingCode());
        response.setTitle(recording.getTitle());
        response.setTutorId(recording.getTutor().getTutorSeq());
        response.setTutorName(recording.getTutor().getName());
        response.setSubject(recording.getTutor().getSubject());
        response.setMedium(recording.getTutor().getMedium());
        response.setClassDate(recording.getClassDate() == null ? null : recording.getClassDate().toString());
        response.setDurationMins(recording.getDurationMins());
        response.setVideoUrl(recording.getVideoUrl());
        response.setCreatedAt(recording.getCreatedDateTime() == null ? null : recording.getCreatedDateTime().toString());
        return response;
    }

    private ClassRecordingSaveResponse failed(ClassRecordingSaveResponse response, String message) {
        response.setIsSuccess(false);
        response.setMessage(message);
        return response;
    }

    private boolean isAdmin() {
        return "admin".equals(request.getAttribute("role"));
    }

    private boolean isTutor() {
        return "tutor".equals(request.getAttribute("role"));
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "SYSTEM";
    }
}
