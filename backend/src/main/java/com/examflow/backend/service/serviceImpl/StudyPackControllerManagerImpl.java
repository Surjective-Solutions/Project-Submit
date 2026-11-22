package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.examflow.backend.dto.StudyPackClassResponse;
import com.examflow.backend.dto.StudyPackItemRequest;
import com.examflow.backend.dto.StudyPackItemResponse;
import com.examflow.backend.dto.StudyPackRequest;
import com.examflow.backend.dto.StudyPackResponse;
import com.examflow.backend.dto.StudyPackSaveResponse;
import com.examflow.backend.entity.ClassRecording;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.StudyPack;
import com.examflow.backend.entity.StudyPackItem;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.enums.StudyPackStatus;
import com.examflow.backend.repository.ClassRecordingRepository;
import com.examflow.backend.repository.ClassesRepository;
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

    // Used when a draft is saved before the revenue-share step has been touched, and for every teacher save.
    private static final Integer DEFAULT_TEACHER_SHARE = 70;
    private static final Integer DEFAULT_INSTITUTE_SHARE = 25;
    private static final Integer DEFAULT_SYSTEM_SHARE = 5;

    private static final Integer MAX_SESSIONS = 100;

    // classes.status of a class that is running
    private static final Integer CLASS_ACTIVE = 2;

    private static final String COVER_ADDRESS = "/uploads/study_pack_covers/";

    // The packs a list shows: everything except deleted ones.
    private static final EnumSet<StudyPackStatus> LISTED = EnumSet.of(StudyPackStatus.DRAFT,
            StudyPackStatus.PUBLISHED, StudyPackStatus.EXPIRED);

    private final HttpServletRequest request;
    private final StudyPackRepository studyPackRepository;
    private final StudyPackItemRepository studyPackItemRepository;
    private final TutorRepository tutorRepository;
    private final ClassesRepository classesRepository;
    private final ClassRecordingRepository classRecordingRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public StudyPackControllerManagerImpl(HttpServletRequest request,
            StudyPackRepository studyPackRepository,
            StudyPackItemRepository studyPackItemRepository,
            TutorRepository tutorRepository,
            ClassesRepository classesRepository,
            ClassRecordingRepository classRecordingRepository,
            FileStorageService fileStorageService) {
        this.request = request;
        this.studyPackRepository = studyPackRepository;
        this.studyPackItemRepository = studyPackItemRepository;
        this.tutorRepository = tutorRepository;
        this.classesRepository = classesRepository;
        this.classRecordingRepository = classRecordingRepository;
        this.fileStorageService = fileStorageService;
    }

    // Create and update ---------------------------------------------------

    @Override
    @Transactional
    public StudyPackSaveResponse createStudyPack(StudyPackRequest studyPackRequest, MultipartFile cover) {
        if (!isAdmin()) {
            return failed("Only an admin can create study packs.");
        }
        return savePack(null, studyPackRequest, cover, null);
    }

    @Override
    @Transactional
    public StudyPackSaveResponse createMyStudyPack(StudyPackRequest studyPackRequest, MultipartFile cover) {
        Integer tutorSeq = currentTutorSeq();
        if (tutorSeq == null) {
            return failed("Only a teacher can save a pack here.");
        }
        return savePack(null, studyPackRequest, cover, tutorSeq);
    }

    @Override
    @Transactional
    public StudyPackSaveResponse updateStudyPack(Integer id, StudyPackRequest studyPackRequest, MultipartFile cover) {
        if (!isAdmin()) {
            return failed("Only an admin can edit any study pack.");
        }
        StudyPack existing = id == null ? null : studyPackRepository.findById(id).orElse(null);
        if (existing == null || existing.getStatus() == StudyPackStatus.DELETED) {
            return failed("This study pack no longer exists.");
        }
        return savePack(existing, studyPackRequest, cover, null);
    }

    @Override
    @Transactional
    public StudyPackSaveResponse updateMyStudyPack(Integer id, StudyPackRequest studyPackRequest, MultipartFile cover) {
        Integer tutorSeq = currentTutorSeq();
        if (tutorSeq == null) {
            return failed("Only a teacher can edit a pack here.");
        }
        StudyPack existing = id == null ? null : studyPackRepository.findById(id).orElse(null);
        // Someone else's pack looks exactly like one that does not exist.
        if (existing == null || existing.getStatus() == StudyPackStatus.DELETED || existing.getTutor() == null
                || !tutorSeq.equals(existing.getTutor().getTutorSeq())) {
            return failed("This study pack no longer exists.");
        }
        return savePack(existing, studyPackRequest, cover, tutorSeq);
    }

    // Saves a new pack (existing == null) or changes one. `ownTutorSeq` is set for a teacher's own save: the pack is then
    // theirs whatever the request says, a new one is always a draft, an existing one keeps its status, the revenue split
    // is the institute's standard one, and only their own recordings and classes are accepted. For an admin it is null:
    // the request names the teacher, and "Save & publish" puts the pack on sale.
    private StudyPackSaveResponse savePack(StudyPack existing, StudyPackRequest req, MultipartFile cover,
            Integer ownTutorSeq) {

        boolean teacherSave = ownTutorSeq != null;

        List<StudyPackItemRequest> items;
        try {
            items = readItems(req.getItems());
        } catch (Exception e) {
            return failed("The sessions of this pack could not be read. Please try again.");
        }

        // The status the pack will have once saved.
        boolean publishRequested = !teacherSave && Boolean.TRUE.equals(req.getPublish());
        StudyPackStatus status;
        if (existing == null) {
            status = publishRequested ? StudyPackStatus.PUBLISHED : StudyPackStatus.DRAFT;
        } else {
            status = publishRequested ? StudyPackStatus.PUBLISHED : existing.getStatus();
        }
        // A pack that is on sale must always stay complete.
        boolean complete = status == StudyPackStatus.PUBLISHED;

        Integer tutorSeq = teacherSave ? ownTutorSeq : req.getTeacher_id();

        String problem = validate(req, items, cover, complete, tutorSeq, teacherSave);
        if (problem != null) {
            return failed(problem);
        }

        Tutor tutor = null;
        if (tutorSeq != null) {
            tutor = tutorRepository.findByTutorSeq(tutorSeq);
            if (tutor == null) {
                return failed("That teacher could not be found.");
            }
        }

        // The class must be an active class of the chosen teacher, so a pack can never point at someone else's class.
        Classes studyClass = null;
        if (req.getClass_id() != null) {
            if (tutor == null) {
                return failed("Select the teacher before choosing a class.");
            }
            studyClass = classesRepository.findByClassSeqAndStatus(req.getClass_id(), CLASS_ACTIVE);
            if (studyClass == null || studyClass.getTutor() == null
                    || !tutor.getTutorSeq().equals(studyClass.getTutor().getTutorSeq())) {
                return failed("That class does not belong to the selected teacher.");
            }
        }

        // Every session must point at a real recording of this teacher, and what the pack shows about it (title,
        // date, length) is taken from the saved record, not from what the page sent.
        Map<String, ClassRecording> recordings = new HashMap<>();
        for (StudyPackItemRequest item : items) {
            String code = normalizeCode(item.getRecordingCode());
            ClassRecording recording = classRecordingRepository.findByRecordingCodeIgnoreCaseAndStatus(code,
                    ClassRecording.STATUS_ACTIVE);
            boolean notTheirs = recording != null && tutor != null
                    && !tutor.getTutorSeq().equals(recording.getTutor().getTutorSeq());
            if (recording == null || notTheirs) {
                // The same answer for a code that is someone else's and one that does not exist.
                return failed(teacherSave
                        ? "Recording " + code + " isn't one of your recordings. Remove it and try again."
                        : "Recording " + code + " was not found for this teacher. Remove it and try again.");
            }
            recordings.put(code, recording);
        }

        String username = currentUsername();
        LocalDateTime now = LocalDateTime.now();

        StudyPack studyPack = existing != null ? existing : new StudyPack();
        studyPack.setStudyPackName(trim(req.getName()));
        studyPack.setStudyPackDescription(trim(req.getDescription()));
        studyPack.setTutor(tutor);
        studyPack.setClasses(studyClass);
        studyPack.setGrade(trim(req.getGrade()));
        // The subject defaults to the class's own when the form did not send one.
        String subject = trim(req.getSubject());
        if (isBlank(subject) && studyClass != null) {
            subject = trim(studyClass.getSubjectName());
        }
        studyPack.setSubject(subject);
        studyPack.setStudyPackPrice(req.getPrice() != null ? req.getPrice() : 0.0);

        String validity = normalizeValidity(req.getValidity());
        studyPack.setValidityType(validity);
        studyPack.setValidityDays(StudyPack.VALIDITY_CUSTOM.equals(validity) ? req.getCustom_days() : null);

        // A teacher can't set the revenue split: a new pack gets the standard one, an existing pack keeps its own.
        if (!teacherSave) {
            studyPack.setTeacherSharePercentage(share(req.getTeacher_share(), DEFAULT_TEACHER_SHARE));
            studyPack.setInstituteSharePercentage(share(req.getInstitute_share(), DEFAULT_INSTITUTE_SHARE));
            studyPack.setSystemSharePercentage(share(req.getSystem_share(), DEFAULT_SYSTEM_SHARE));
        } else if (existing == null) {
            studyPack.setTeacherSharePercentage(DEFAULT_TEACHER_SHARE);
            studyPack.setInstituteSharePercentage(DEFAULT_INSTITUTE_SHARE);
            studyPack.setSystemSharePercentage(DEFAULT_SYSTEM_SHARE);
        }

        studyPack.setStatus(status);
        studyPack.setIsPublished(status == StudyPackStatus.PUBLISHED); // kept in step with the status
        studyPack.setLastModifiedBy(username);
        studyPack.setLastModifiedDateTime(now);
        if (existing == null) {
            studyPack.setSoldCount(0);
            studyPack.setCreatedBy(username);
            studyPack.setCreatedDateTime(now);
        }

        // A new cover replaces the old one; "remove cover" clears it. The old file is deleted once the pack is saved.
        String oldCover = studyPack.getStudyPackImage();
        if (cover != null && !cover.isEmpty()) {
            studyPack.setStudyPackImage(fileStorageService.saveStudyPackCover(cover));
        } else if (Boolean.TRUE.equals(req.getRemove_cover())) {
            studyPack.setStudyPackImage(null);
        }

        studyPackRepository.save(studyPack);

        // The sessions are replaced as a whole: the old ones are marked deleted and the ones sent are inserted in order.
        if (existing != null) {
            List<StudyPackItem> old = studyPackItemRepository.findByStudyPackAndStatusOrderByDisplayOrderAsc(studyPack,
                    StudyPackItem.STATUS_ACTIVE);
            for (StudyPackItem item : old) {
                item.setStatus(StudyPackItem.STATUS_DELETED);
                item.setLastModifiedBy(username);
                item.setLastModifiedDateTime(now);
            }
            studyPackItemRepository.saveAll(old);
        }
        List<StudyPackItem> saved = insertStudyPackItems(studyPack, items, recordings, username, now);

        if (oldCover != null && !oldCover.equals(studyPack.getStudyPackImage())) {
            fileStorageService.deleteStudyPackCover(oldCover);
        }

        StudyPackSaveResponse response = new StudyPackSaveResponse();
        response.setIsSuccess(true);
        response.setMessage(status == StudyPackStatus.PUBLISHED
                ? "Study pack published successfully"
                : existing == null ? "Study pack saved as a draft" : "Study pack saved");
        response.setPack(toResponse(studyPack, saved));
        return response;
    }

    // List ----------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<StudyPackResponse> getStudyPacks() {

        List<StudyPack> packs;
        if (isAdmin()) {
            packs = studyPackRepository.findByStatusInOrderByLastModifiedDateTimeDesc(LISTED);
        } else {
            Integer tutorSeq = currentTutorSeq();
            if (tutorSeq == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only an admin or a teacher can see study packs.");
            }
            // A teacher only ever gets their own packs.
            Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
            packs = tutor == null ? new ArrayList<>()
                    : studyPackRepository.findByTutorAndStatusInOrderByLastModifiedDateTimeDesc(tutor, LISTED);
        }

        List<StudyPackResponse> responses = new ArrayList<>();
        if (packs.isEmpty()) {
            return responses;
        }

        // One query for the sessions of all the packs, then handed out by pack.
        Map<Integer, List<StudyPackItem>> itemsByPack = new HashMap<>();
        for (StudyPackItem item : studyPackItemRepository.findByStudyPackInAndStatusOrderByDisplayOrderAsc(packs,
                StudyPackItem.STATUS_ACTIVE)) {
            itemsByPack.computeIfAbsent(item.getStudyPack().getStudyPackSeq(), key -> new ArrayList<>()).add(item);
        }
        for (StudyPack pack : packs) {
            responses.add(toResponse(pack, itemsByPack.getOrDefault(pack.getStudyPackSeq(), new ArrayList<>())));
        }
        return responses;
    }

    @Override
    public List<StudyPackClassResponse> getTutorClasses(Integer tutorId) {

        Integer tutorSeq;
        if (isAdmin()) {
            tutorSeq = tutorId;
        } else if (currentTutorSeq() != null) {
            tutorSeq = currentTutorSeq(); // a teacher only ever gets their own
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only an admin or a teacher can list classes.");
        }

        List<StudyPackClassResponse> classes = new ArrayList<>();
        Tutor tutor = tutorSeq == null ? null : tutorRepository.findByTutorSeq(tutorSeq);
        if (tutor == null) {
            return classes;
        }
        for (Classes cls : classesRepository.findByStatusAndTutor(CLASS_ACTIVE, tutor)) {
            StudyPackClassResponse item = new StudyPackClassResponse();
            item.setId(cls.getClassSeq());
            item.setName(cls.getDisplayName());
            item.setSubject(cls.getSubjectName());
            classes.add(item);
        }
        classes.sort((a, b) -> String.valueOf(a.getName()).compareToIgnoreCase(String.valueOf(b.getName())));
        return classes;
    }

    // Validation ---------------------------------------------------------

    // Repeats every rule the admin page checks, because the page can be bypassed.
    // Returns the message to show, or null when the pack can be saved. `complete` is true for a pack that is, or is about
    // to be, on sale: everything is then required.
    private String validate(StudyPackRequest req, List<StudyPackItemRequest> items, MultipartFile cover,
            boolean complete, Integer tutorSeq, boolean teacherSave) {

        if (isBlank(req.getName())) {
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
        if (!complete) {
            return null;
        }

        if (tutorSeq == null) {
            return "Select a teacher.";
        }
        if (req.getClass_id() == null) {
            return "Select a class.";
        }
        if (isBlank(req.getGrade())) {
            return "Select a grade.";
        }
        if (isBlank(req.getSubject())) {
            return "Select a subject.";
        }
        if (req.getPrice() == null || req.getPrice() <= 0) {
            return "Enter a price above zero.";
        }

        String validity = normalizeValidity(req.getValidity());
        if (StudyPack.VALIDITY_CUSTOM.equals(validity) && (req.getCustom_days() == null || req.getCustom_days() <= 0)) {
            return "Enter the number of days.";
        }

        // A teacher's split is the standard one, so there is nothing of theirs to add up.
        if (!teacherSave) {
            int total = share(req.getTeacher_share(), DEFAULT_TEACHER_SHARE)
                    + share(req.getInstitute_share(), DEFAULT_INSTITUTE_SHARE)
                    + share(req.getSystem_share(), DEFAULT_SYSTEM_SHARE);
            if (total != 100) {
                return "Revenue shares add up to " + total + "%, but they must total exactly 100%.";
            }
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
    private List<StudyPackItem> insertStudyPackItems(StudyPack studyPack, List<StudyPackItemRequest> items,
            Map<String, ClassRecording> recordings, String username, LocalDateTime now) {

        List<StudyPackItem> saved = new ArrayList<>();
        int order = 1;
        for (StudyPackItemRequest item : items) {
            String code = normalizeCode(item.getRecordingCode());
            ClassRecording recording = recordings.get(code);

            StudyPackItem studyPackItem = new StudyPackItem();
            studyPackItem.setStudyPack(studyPack);
            studyPackItem.setClassRecording(recording);
            studyPackItem.setRecordingCode(code);
            studyPackItem.setLessonTitle(trim(item.getTitle()));
            studyPackItem.setDisplayOrder(order++);
            // a copy of the saved record as it is now
            studyPackItem.setRecordingTitle(recording.getTitle());
            studyPackItem.setRecordingClassDate(recording.getClassDate());
            studyPackItem.setRecordingDurationMins(
                    recording.getDurationMins() != null ? recording.getDurationMins() : 0);
            // the teacher's medium, unless the page named one
            studyPackItem.setRecordingMedium(!isBlank(item.getMedium()) ? trim(item.getMedium())
                    : recording.getTutor().getMedium());
            studyPackItem.setStatus(StudyPackItem.STATUS_ACTIVE);
            studyPackItem.setCreatedBy(username);
            studyPackItem.setCreatedDateTime(now);
            studyPackItem.setLastModifiedBy(username);
            studyPackItem.setLastModifiedDateTime(now);
            saved.add(studyPackItemRepository.save(studyPackItem));
        }
        return saved;
    }

    // Response -----------------------------------------------------------

    private StudyPackResponse toResponse(StudyPack pack, List<StudyPackItem> items) {
        StudyPackResponse response = new StudyPackResponse();
        response.setId(pack.getStudyPackSeq());
        response.setName(pack.getStudyPackName());
        response.setDescription(pack.getStudyPackDescription() == null ? "" : pack.getStudyPackDescription());
        Tutor tutor = pack.getTutor();
        response.setTeacherId(tutor == null ? null : tutor.getTutorSeq());
        if (pack.getClasses() != null) {
            response.setClassId(pack.getClasses().getClassSeq());
            response.setClassName(pack.getClasses().getDisplayName());
        }
        response.setGrade(pack.getGrade() == null ? "" : pack.getGrade());
        response.setSubject(pack.getSubject() == null ? "" : pack.getSubject());
        response.setPrice(pack.getStudyPackPrice());
        response.setValidity(pack.getValidityType());
        response.setCustomDays(pack.getValidityDays());

        StudyPackResponse.Shares shares = new StudyPackResponse.Shares();
        shares.setTeacher(pack.getTeacherSharePercentage());
        shares.setInstitute(pack.getInstituteSharePercentage());
        shares.setSystem(pack.getSystemSharePercentage());
        response.setShares(shares);

        response.setCoverUrl(isBlank(pack.getStudyPackImage()) ? null : COVER_ADDRESS + pack.getStudyPackImage());
        response.setStatus(pack.getStatus() == null ? StudyPackStatus.DRAFT.getValue() : pack.getStatus().getValue());
        response.setSold(pack.getSoldCount() == null ? 0 : pack.getSoldCount());
        response.setUpdatedAt(pack.getLastModifiedDateTime() == null ? null : pack.getLastModifiedDateTime().toString());

        List<StudyPackItemResponse> itemResponses = new ArrayList<>();
        int totalDuration = 0;
        for (StudyPackItem item : items) {
            StudyPackItemResponse itemResponse = new StudyPackItemResponse();
            itemResponse.setRecordingCode(item.getRecordingCode());
            itemResponse.setTitle(item.getLessonTitle());
            itemResponse.setOrder(item.getDisplayOrder());

            int minutes = item.getRecordingDurationMins() == null ? 0 : item.getRecordingDurationMins();
            totalDuration += minutes;
            StudyPackItemResponse.Recording recording = new StudyPackItemResponse.Recording();
            recording.setCode(item.getRecordingCode());
            recording.setTitle(item.getRecordingTitle());
            recording.setSubject(pack.getSubject() == null ? "" : pack.getSubject());
            recording.setMedium(item.getRecordingMedium() == null ? "" : item.getRecordingMedium());
            recording.setClassDate(item.getRecordingClassDate() == null ? null : item.getRecordingClassDate().toString());
            recording.setDurationMins(minutes);
            recording.setTeacherId(tutor == null ? null : String.valueOf(tutor.getTutorSeq()));
            itemResponse.setRecording(recording);
            itemResponses.add(itemResponse);
        }
        response.setItems(itemResponses);
        response.setSessions(itemResponses.size());
        response.setTotalDuration(totalDuration);
        return response;
    }

    // Small helpers ------------------------------------------------------

    private boolean isAdmin() {
        return "admin".equals(request.getAttribute("role"));
    }

    // The signed-in teacher's id, or null when the caller is not a teacher.
    private Integer currentTutorSeq() {
        return "tutor".equals(request.getAttribute("role")) ? (Integer) request.getAttribute("userId") : null;
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "SYSTEM";
    }

    private StudyPackSaveResponse failed(String message) {
        StudyPackSaveResponse response = new StudyPackSaveResponse();
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
