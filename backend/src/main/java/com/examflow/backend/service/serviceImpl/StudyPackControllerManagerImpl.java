package com.examflow.backend.service.serviceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.StudyPackItemRequest;
import com.examflow.backend.dto.StudyPackRequest;
import com.examflow.backend.entity.StudyPack;
import com.examflow.backend.entity.StudyPackItem;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.repository.StudyPackItemRepository;
import com.examflow.backend.repository.StudyPackRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.FileStorageService;
import com.examflow.backend.service.StudyPackControllerManager;

import jakarta.servlet.http.HttpServletRequest;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class StudyPackControllerManagerImpl implements StudyPackControllerManager {

    private static final List<String> VALIDITY_TYPES = List.of("1m", "3m", "6m", "exam", "custom");

    // Used when a draft is saved before the revenue-share step has been touched.
    private static final Integer DEFAULT_TEACHER_SHARE = 70;
    private static final Integer DEFAULT_INSTITUTE_SHARE = 25;
    private static final Integer DEFAULT_SYSTEM_SHARE = 5;

    private static final Integer MAX_SESSIONS = 100;

    private final HttpServletRequest request;
    private final StudyPackRepository studyPackRepository;
    private final StudyPackItemRepository studyPackItemRepository;
    private final TutorRepository tutorRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public StudyPackControllerManagerImpl(HttpServletRequest request,
            StudyPackRepository studyPackRepository,
            StudyPackItemRepository studyPackItemRepository,
            TutorRepository tutorRepository,
            FileStorageService fileStorageService) {
        this.request = request;
        this.studyPackRepository = studyPackRepository;
        this.studyPackItemRepository = studyPackItemRepository;
        this.tutorRepository = tutorRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional
    public GeneralResponse createStudyPack(StudyPackRequest studyPackRequest, MultipartFile cover) {

        System.out.println("reached to impl");
        GeneralResponse response = new GeneralResponse();

        if (!isAdmin()) {
            return failed(response, "Only an admin can create study packs.");
        }

        List<StudyPackItemRequest> items;
        try {
            items = readItems(studyPackRequest.getItems());
        } catch (Exception e) {
            return failed(response, "The sessions of this pack could not be read. Please try again.");
        }

        boolean publish = Boolean.TRUE.equals(studyPackRequest.getPublish());

        String problem = validate(studyPackRequest, items, cover, publish);
        if (problem != null) {
            return failed(response, problem);
        }

        Tutor tutor = null;
        if (studyPackRequest.getTeacher_id() != null) {
            tutor = tutorRepository.findByTutorSeq(studyPackRequest.getTeacher_id());
            if (tutor == null) {
                return failed(response, "That teacher could not be found.");
            }
        }

        String username = currentUsername();
        LocalDateTime now = LocalDateTime.now();

        StudyPack studyPack = new StudyPack();
        studyPack.setStudyPackName(trim(studyPackRequest.getName()));
        studyPack.setStudyPackDescription(trim(studyPackRequest.getDescription()));
        studyPack.setTutor(tutor);
        studyPack.setGrade(trim(studyPackRequest.getGrade()));
        studyPack.setSubject(trim(studyPackRequest.getSubject()));
        studyPack.setStudyPackPrice(studyPackRequest.getPrice() != null ? studyPackRequest.getPrice() : 0.0);

        String validity = normalizeValidity(studyPackRequest.getValidity());
        studyPack.setValidityType(validity);
        studyPack.setValidityDays(
                StudyPack.VALIDITY_CUSTOM.equals(validity) ? studyPackRequest.getCustom_days() : null);

        studyPack.setTeacherSharePercentage(share(studyPackRequest.getTeacher_share(), DEFAULT_TEACHER_SHARE));
        studyPack.setInstituteSharePercentage(share(studyPackRequest.getInstitute_share(), DEFAULT_INSTITUTE_SHARE));
        studyPack.setSystemSharePercentage(share(studyPackRequest.getSystem_share(), DEFAULT_SYSTEM_SHARE));

        studyPack.setIsPublished(publish);
        studyPack.setSoldCount(0);
        studyPack.setStatus(StudyPack.STATUS_ACTIVE);
        studyPack.setCreatedBy(username);
        studyPack.setLastModifiedBy(username);
        studyPack.setCreatedDateTime(now);
        studyPack.setLastModifiedDateTime(now);

        if (cover != null && !cover.isEmpty()) {
            studyPack.setStudyPackImage(fileStorageService.saveStudyPackCover(cover));
        }

        studyPackRepository.save(studyPack);

        insertStudyPackItems(studyPack, items, username, now);

        response.setMessage("Study pack created successfully");
        response.setIsSuccess(true);
        System.out.println("Study pack created successfully");

        return response;
    }

    // Validation ---------------------------------------------------------

    // Repeats every rule the admin page checks, because the page can be bypassed.
    // Returns the message to show, or null when the pack can be saved.
    private String validate(StudyPackRequest studyPackRequest, List<StudyPackItemRequest> items,
            MultipartFile cover, boolean publish) {

        if (isBlank(studyPackRequest.getName())) {
            return "Give the pack a name.";
        }

        String coverProblem = fileStorageService.validateStudyPackCover(cover);
        if (coverProblem != null) {
            return coverProblem;
        }

        if (items.size() > MAX_SESSIONS) {
            return "A study pack can hold at most " + MAX_SESSIONS + " sessions.";
        }

        Set<String> codes = new HashSet<>();
        for (StudyPackItemRequest item : items) {
            if (isBlank(item.getRecordingCode())) {
                return "One of the sessions has no recording. Remove it and add it again.";
            }
            if (isBlank(item.getTitle())) {
                return "Every session needs a lesson title so students know which topic it covers.";
            }
            if (!codes.add(normalizeCode(item.getRecordingCode()))) {
                return "A recording can only be added to a pack once.";
            }
        }

        // A draft only needs a name; everything below is what going on sale requires.
        if (!publish) {
            return null;
        }

        if (studyPackRequest.getTeacher_id() == null) {
            return "Select a teacher.";
        }
        if (isBlank(studyPackRequest.getGrade())) {
            return "Select a grade.";
        }
        if (isBlank(studyPackRequest.getSubject())) {
            return "Select a subject.";
        }
        if (studyPackRequest.getPrice() == null || studyPackRequest.getPrice() <= 0) {
            return "Enter a price above zero.";
        }

        String validity = normalizeValidity(studyPackRequest.getValidity());
        if (StudyPack.VALIDITY_CUSTOM.equals(validity)
                && (studyPackRequest.getCustom_days() == null || studyPackRequest.getCustom_days() <= 0)) {
            return "Enter the number of days.";
        }

        int total = share(studyPackRequest.getTeacher_share(), DEFAULT_TEACHER_SHARE)
                + share(studyPackRequest.getInstitute_share(), DEFAULT_INSTITUTE_SHARE)
                + share(studyPackRequest.getSystem_share(), DEFAULT_SYSTEM_SHARE);
        if (total != 100) {
            return "Revenue shares add up to " + total + "%, but they must total exactly 100%.";
        }

        if (items.isEmpty()) {
            return "A pack needs at least one session before it can be published.";
        }

        return null;
    }

    // Sessions -----------------------------------------------------------

    private List<StudyPackItemRequest> readItems(String itemsJson) {
        if (itemsJson == null || itemsJson.isBlank()) {
            return new ArrayList<>();
        }
        ObjectMapper mapper = new ObjectMapper();
        List<StudyPackItemRequest> items = mapper.readValue(itemsJson,
                new TypeReference<List<StudyPackItemRequest>>() {
                });
        return items != null ? items : new ArrayList<>();
    }

    // One row per session, numbered by the order they arrive in. The position sent by the
    // page is ignored, so students always watch them in the order the admin arranged.
    private void insertStudyPackItems(StudyPack studyPack, List<StudyPackItemRequest> items, String username,
            LocalDateTime now) {

        int order = 1;
        for (StudyPackItemRequest item : items) {
            StudyPackItem studyPackItem = new StudyPackItem();
            studyPackItem.setStudyPack(studyPack);
            studyPackItem.setRecordingCode(normalizeCode(item.getRecordingCode()));
            studyPackItem.setLessonTitle(trim(item.getTitle()));
            studyPackItem.setDisplayOrder(order++);
            studyPackItem.setRecordingTitle(trim(item.getRecordingTitle()));
            studyPackItem.setRecordingClassDate(parseClassDate(item.getClassDate()));
            studyPackItem.setRecordingDurationMins(item.getDurationMins() != null ? item.getDurationMins() : 0);
            studyPackItem.setRecordingMedium(trim(item.getMedium()));
            studyPackItem.setStatus(StudyPackItem.STATUS_ACTIVE);
            studyPackItem.setCreatedBy(username);
            studyPackItem.setCreatedDateTime(now);
            studyPackItem.setLastModifiedBy(username);
            studyPackItem.setLastModifiedDateTime(now);
            studyPackItemRepository.save(studyPackItem);
        }
    }

    // The page sends a plain "yyyy-MM-dd" class date. An unreadable one is not worth failing
    // the save over: the pack simply shows no date for that session.
    private LocalDate parseClassDate(String classDate) {
        if (classDate == null || classDate.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(classDate.trim());
        } catch (Exception e) {
            return null;
        }
    }

    // Small helpers ------------------------------------------------------

    private boolean isAdmin() {
        return "admin".equals(request.getAttribute("role"));
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "SYSTEM";
    }

    private GeneralResponse failed(GeneralResponse response, String message) {
        response.setMessage(message);
        response.setIsSuccess(false);
        return response;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String trim(String value) {
        return value != null ? value.trim() : null;
    }

    private String normalizeCode(String code) {
        return code != null ? code.replaceAll("\\s+", "").toUpperCase() : null;
    }

    // An unknown validity falls back to the form's own default rather than failing the save.
    private String normalizeValidity(String validity) {
        return VALIDITY_TYPES.contains(validity) ? validity : "6m";
    }

    private int share(Integer value, Integer fallback) {
        if (value == null) {
            return fallback;
        }
        return Math.max(0, Math.min(100, value));
    }

}
