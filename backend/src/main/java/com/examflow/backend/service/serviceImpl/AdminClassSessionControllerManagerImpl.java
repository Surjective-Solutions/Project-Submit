package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.AdminSessionRequest;
import com.examflow.backend.dto.AdminSessionResponse;
import com.examflow.backend.dto.AdminSessionSaveResponse;
import com.examflow.backend.entity.ClassSession;
import com.examflow.backend.enums.SessionAccessLevel;
import com.examflow.backend.enums.SessionMode;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.repository.ClassSessionRepository;
import com.examflow.backend.repository.ClassesRepository;
import com.examflow.backend.service.AdminClassSessionControllerManager;

@Service
public class AdminClassSessionControllerManagerImpl implements AdminClassSessionControllerManager {

    // Class status: 2 = active.
    private static final Integer ACTIVE = 2;

    // Session status: 2 = approved, 1 = open, 0 = deleted. Deleted sessions are never shown or changed.
    private static final Integer APPROVED = 2;

    private static final Integer OPEN = 1;

    private static final Integer DELETED = 0;

    private static final List<Integer> LIVE_STATUSES = List.of(APPROVED, OPEN);

    private static final int NAME_MAX = 90;

    private static final DateTimeFormatter LOCAL_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private final ClassesRepository classesRepository;

    private final ClassSessionRepository classSessionRepository;

    @Autowired
    public AdminClassSessionControllerManagerImpl(ClassesRepository classesRepository,
            ClassSessionRepository classSessionRepository) {
        this.classesRepository = classesRepository;
        this.classSessionRepository = classSessionRepository;
    }

    @Override
    public List<AdminSessionResponse> getSessions(Integer classSeq) {
        List<AdminSessionResponse> result = new ArrayList<>();
        Classes cls = classesRepository.findByClassSeqAndStatus(classSeq, ACTIVE);
        if (cls == null) {
            return result;
        }
        for (ClassSession session : classSessionRepository.findByClassesAndStatusInOrderByStartsAtAsc(cls, LIVE_STATUSES)) {
            result.add(toResponse(session));
        }
        return result;
    }

    @Override
    public AdminSessionSaveResponse createSession(Integer classSeq, AdminSessionRequest request) {
        Classes cls = classesRepository.findByClassSeqAndStatus(classSeq, ACTIVE);
        if (cls == null) {
            return failure("Class not found.");
        }
        ClassSession session = new ClassSession();
        session.setClasses(cls);
        session.setStatus(APPROVED); // created by an admin, so it starts approved
        session.setCreatedDateTime(LocalDateTime.now());
        session.setCreatedBy(currentUser());
        String error = apply(session, request);
        if (error != null) {
            return failure(error);
        }
        return success(classSessionRepository.save(session), "Session created.");
    }

    @Override
    public AdminSessionSaveResponse updateSession(Integer classSeq, Integer sessionSeq, AdminSessionRequest request) {
        ClassSession session = findSession(classSeq, sessionSeq);
        if (session == null) {
            return failure("Session not found.");
        }
        String error = apply(session, request);
        if (error != null) {
            return failure(error);
        }
        return success(classSessionRepository.save(session), "Session saved.");
    }

    @Override
    public AdminSessionSaveResponse deleteSession(Integer classSeq, Integer sessionSeq) {
        ClassSession session = findSession(classSeq, sessionSeq);
        if (session == null) {
            return failure("Session not found.");
        }
        // Soft delete: the row stays (status 0) so attendance and payment history stay intact.
        session.setStatus(DELETED);
        session.setLastModifiedDateTime(LocalDateTime.now());
        session.setLastModifiedBy(currentUser());
        classSessionRepository.save(session);
        AdminSessionSaveResponse response = new AdminSessionSaveResponse();
        response.setIsSuccess(true);
        response.setMessage("Session deleted.");
        return response;
    }

    private ClassSession findSession(Integer classSeq, Integer sessionSeq) {
        Classes cls = classesRepository.findByClassSeqAndStatus(classSeq, ACTIVE);
        if (cls == null) {
            return null;
        }
        return classSessionRepository.findBySessionSeqAndClassesAndStatusIn(sessionSeq, cls, LIVE_STATUSES);
    }

    // Validates the form and copies it onto the session. Returns an error message, or null when it is fine.
    private String apply(ClassSession session, AdminSessionRequest request) {
        if (request == null) {
            return "Session details are missing.";
        }
        String name = request.getName() == null ? "" : request.getName().trim();
        if (name.isEmpty() || name.length() > NAME_MAX) {
            return "Give the session a name of up to " + NAME_MAX + " characters.";
        }
        SessionAccessLevel accessLevel = SessionAccessLevel.fromValue(request.getAccess());
        if (accessLevel == null) {
            return "Choose who can open the session.";
        }
        SessionMode mode = SessionMode.fromValue(request.getMode());
        if (mode == null) {
            return "Choose whether the session is online or physical.";
        }
        boolean physical = mode == SessionMode.PHYSICAL;
        String hall = request.getHall() == null ? "" : request.getHall().trim();
        if (physical && hall.isEmpty()) {
            return "Pick the hall.";
        }

        LocalDateTime startsAt;
        LocalDateTime expiresAt = null;
        try {
            startsAt = LocalDateTime.parse(request.getStartsAt(), LOCAL_FORMAT);
            if (request.getExpiresAt() != null && !request.getExpiresAt().isBlank()) {
                expiresAt = LocalDateTime.parse(request.getExpiresAt(), LOCAL_FORMAT);
            }
        } catch (DateTimeParseException | NullPointerException e) {
            return "Pick a valid start date and time.";
        }
        if (expiresAt != null && !expiresAt.isAfter(startsAt)) {
            return "The expiry must be after the start.";
        }

        AdminSessionRequest.Shares shares = request.getShares();
        if (shares == null || shares.getTeacher() == null || shares.getInstitute() == null
                || shares.getSystem() == null || shares.getTeacher() < 0 || shares.getInstitute() < 0
                || shares.getSystem() < 0
                || shares.getTeacher() + shares.getInstitute() + shares.getSystem() != 100) {
            return "The shares must add up to 100%.";
        }

        session.setName(name);
        session.setAccessLevel(accessLevel);
        session.setMode(mode);
        session.setStartsAt(startsAt);
        session.setExpiresAt(expiresAt);
        session.setHall(physical ? hall : null);
        String code = request.getRecordingCode() == null ? "" : request.getRecordingCode().trim();
        session.setRecordingCode(code.isEmpty() ? null : code);
        session.setTeacherShare(shares.getTeacher());
        session.setInstituteShare(shares.getInstitute());
        session.setSystemShare(shares.getSystem());
        session.setLastModifiedDateTime(LocalDateTime.now());
        session.setLastModifiedBy(currentUser());
        return null;
    }

    private AdminSessionResponse toResponse(ClassSession session) {
        AdminSessionResponse response = new AdminSessionResponse();
        response.setId(String.valueOf(session.getSessionSeq()));
        response.setName(session.getName());
        response.setAccess(session.getAccessLevel() == null ? null : session.getAccessLevel().getValue());
        response.setMode(session.getMode() == null ? null : session.getMode().getValue());
        response.setStartsAt(session.getStartsAt() == null ? null : session.getStartsAt().format(LOCAL_FORMAT));
        response.setExpiresAt(session.getExpiresAt() == null ? null : session.getExpiresAt().format(LOCAL_FORMAT));
        response.setHall(session.getHall());
        response.setRecordingCode(session.getRecordingCode());
        AdminSessionRequest.Shares shares = new AdminSessionRequest.Shares();
        shares.setTeacher(session.getTeacherShare());
        shares.setInstitute(session.getInstituteShare());
        shares.setSystem(session.getSystemShare());
        response.setShares(shares);
        // Session resources are not stored yet.
        response.setResourceCount(0);
        return response;
    }

    private AdminSessionSaveResponse success(ClassSession session, String message) {
        AdminSessionSaveResponse response = new AdminSessionSaveResponse();
        response.setIsSuccess(true);
        response.setMessage(message);
        response.setSession(toResponse(session));
        return response;
    }

    private AdminSessionSaveResponse failure(String message) {
        AdminSessionSaveResponse response = new AdminSessionSaveResponse();
        response.setIsSuccess(false);
        response.setMessage(message);
        return response;
    }

    private String currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? null : auth.getName();
    }
}
