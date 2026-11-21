package com.examflow.backend.service.serviceImpl;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.examflow.backend.dto.TeacherAttendanceClassResponse;
import com.examflow.backend.dto.TeacherAttendanceRecordResponse;
import com.examflow.backend.dto.TeacherAttendanceStudentResponse;
import com.examflow.backend.entity.ClassSession;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.StudentClass;
import com.examflow.backend.entity.StudentClassSessionAttendance;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.enums.AttendanceStatus;
import com.examflow.backend.enums.StudentStatus;
import com.examflow.backend.repository.ClassSessionRepository;
import com.examflow.backend.repository.StudentClassSessionAttendanceRepository;
import com.examflow.backend.repository.StudentClassesRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.TeacherAttendanceControllerManager;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class TeacherAttendanceControllerManagerImpl implements TeacherAttendanceControllerManager {

    private static final String TUTOR_ROLE = "tutor";

    // An enrolment, a class and an attendance record count while they have this status.
    private static final Integer ACTIVE_STATUS = 2;

    // Sessions an admin approved (2) or that are still open (1) are held; a deleted one (0) never was.
    private static final List<Integer> LIVE_SESSION_STATUSES = List.of(2, 1);

    // The academy runs on Sri Lanka time, so "has the session started yet" is judged on that clock.
    private static final ZoneId ACADEMY_ZONE = ZoneId.of("Asia/Colombo");

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final HttpServletRequest request;

    private final TutorRepository tutorRepository;

    private final StudentClassesRepository studentClassesRepository;

    private final ClassSessionRepository classSessionRepository;

    private final StudentClassSessionAttendanceRepository attendanceRepository;

    @Autowired
    public TeacherAttendanceControllerManagerImpl(HttpServletRequest request, TutorRepository tutorRepository,
            StudentClassesRepository studentClassesRepository, ClassSessionRepository classSessionRepository,
            StudentClassSessionAttendanceRepository attendanceRepository) {
        this.request = request;
        this.tutorRepository = tutorRepository;
        this.studentClassesRepository = studentClassesRepository;
        this.classSessionRepository = classSessionRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    public TeacherAttendanceStudentResponse findStudentByBarcode(String code) {
        String wanted = normalizeBarcode(code);
        if (wanted.isEmpty()) {
            return null;
        }
        List<StudentClass> enrolments = findEnrolmentsByStudentNo(wanted);
        return enrolments.isEmpty() ? null : toStudentResponse(enrolments);
    }

    @Override
    public TeacherAttendanceStudentResponse findStudentByPhone(String number) {
        String wanted = normalizePhone(number);
        if (wanted.isEmpty()) {
            return null;
        }
        List<StudentClass> enrolments = findEnrolmentsByPhone(wanted);
        return enrolments.isEmpty() ? null : toStudentResponse(enrolments);
    }

    @Override
    public List<TeacherAttendanceRecordResponse> getRecords(String studentId, String from, String to) {

        LocalDate fromDate;
        LocalDate toDate;
        try {
            fromDate = LocalDate.parse(from);
            toDate = LocalDate.parse(to);
        } catch (DateTimeParseException | NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from and to must be dates (YYYY-MM-DD).");
        }
        if (toDate.isBefore(fromDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from must not be after to.");
        }

        String wanted = normalizeBarcode(studentId);
        List<StudentClass> enrolments = findEnrolmentsByStudentNo(wanted);
        List<TeacherAttendanceRecordResponse> rows = new ArrayList<>();
        if (enrolments.isEmpty()) {
            return rows;
        }

        Set<Classes> classes = new LinkedHashSet<>();
        Map<Integer, StudentClass> enrolmentByClass = new HashMap<>();
        for (StudentClass enrolment : enrolments) {
            classes.add(enrolment.getClasses());
            enrolmentByClass.putIfAbsent(enrolment.getClasses().getClassSeq(), enrolment);
        }

        LocalDateTime now = LocalDateTime.now(ACADEMY_ZONE);
        List<ClassSession> sessions = new ArrayList<>();
        for (ClassSession session : classSessionRepository
                .findByClassesInAndStatusInAndStartsAtGreaterThanEqualAndStartsAtLessThanOrderByStartsAtAsc(classes,
                        LIVE_SESSION_STATUSES, fromDate.atStartOfDay(), toDate.plusDays(1).atStartOfDay())) {
            if (session.getStartsAt() == null || session.getStartsAt().isAfter(now)) {
                continue; // not started yet
            }
            LocalDateTime joined = enrolmentByClass.get(session.getClasses().getClassSeq()).getCreatedDateTime();
            if (joined != null && session.getStartsAt().isBefore(joined.toLocalDate().atStartOfDay())) {
                continue; // before the student joined the class, so they could not have attended
            }
            sessions.add(session);
        }
        if (sessions.isEmpty()) {
            return rows;
        }

        // The earliest active scan of each session decides present or late.
        List<Integer> sessionSeqs = new ArrayList<>();
        for (ClassSession session : sessions) {
            sessionSeqs.add(session.getSessionSeq());
        }
        Map<Integer, LocalDateTime> firstScan = new HashMap<>();
        for (StudentClassSessionAttendance attendance : attendanceRepository.findActiveByEnrolmentsAndSessions(
                enrolments, sessionSeqs, ACTIVE_STATUS, ACTIVE_STATUS)) {
            Integer sessionSeq = attendance.getStudentClassSession().getClassSession().getSessionSeq();
            LocalDateTime scannedAt = attendance.getScannedAt();
            LocalDateTime known = firstScan.get(sessionSeq);
            if (known == null || scannedAt.isBefore(known)) {
                firstScan.put(sessionSeq, scannedAt);
            }
        }

        for (ClassSession session : sessions) {
            LocalDateTime scannedAt = firstScan.get(session.getSessionSeq());
            TeacherAttendanceRecordResponse row = new TeacherAttendanceRecordResponse();
            row.setDate(session.getStartsAt().toLocalDate().toString());
            row.setClassName(session.getClasses().getDisplayName());
            row.setTutor(tutorName(session.getClasses()));
            row.setStartTime(session.getStartsAt().format(TIME_FORMAT));
            row.setStatus(statusOf(session.getStartsAt(), scannedAt).getValue());
            row.setScannedAt(scannedAt == null ? null : scannedAt.toString());
            rows.add(row);
        }
        return rows;
    }

    // Present when scanned in at or before ON_TIME_MINUTES after the start, late when later, absent with no scan.
    private AttendanceStatus statusOf(LocalDateTime startsAt, LocalDateTime scannedAt) {
        if (scannedAt == null) {
            return AttendanceStatus.ABSENT;
        }
        double minutesAfterStart = Duration.between(startsAt, scannedAt).toSeconds() / 60.0;
        return minutesAfterStart <= AttendanceStatus.ON_TIME_MINUTES ? AttendanceStatus.PRESENT : AttendanceStatus.LATE;
    }

    // The signed-in teacher. Every public method goes through here first, so it refuses anyone but a teacher; the
    // teacher comes from the token and never from the request. Null when the teacher no longer exists.
    private Tutor requireTutor() {
        if (!TUTOR_ROLE.equals(request.getAttribute("role"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only a teacher can view attendance.");
        }
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        return tutorSeq == null ? null : tutorRepository.findByTutorSeq(tutorSeq);
    }

    // The enrolments, in this teacher's classes only, of the student with this student number (already normalised).
    // Empty when the teacher has no such student.
    private List<StudentClass> findEnrolmentsByStudentNo(String code) {
        Tutor tutor = requireTutor();
        if (tutor == null || code.isEmpty()) {
            return new ArrayList<>();
        }
        return studentClassesRepository.findEnrolmentsOfTutorsStudentByStudentNo(tutor, code, ACTIVE_STATUS,
                ACTIVE_STATUS, StudentStatus.DELETED.getSequence());
    }

    // Same, by contact number. Numbers are stored as typed ("0771234567" or "+94771234567"), so the lookup tries the
    // usual spellings of the 9 digits the page works with.
    private List<StudentClass> findEnrolmentsByPhone(String nineDigits) {
        Tutor tutor = requireTutor();
        if (tutor == null || nineDigits.isEmpty()) {
            return new ArrayList<>();
        }
        List<String> spellings = List.of("0" + nineDigits, "+94" + nineDigits, "94" + nineDigits, nineDigits);
        return studentClassesRepository.findEnrolmentsOfTutorsStudentByContactNumber(tutor, spellings, ACTIVE_STATUS,
                ACTIVE_STATUS, StudentStatus.DELETED.getSequence());
    }

    private TeacherAttendanceStudentResponse toStudentResponse(List<StudentClass> enrolments) {
        Student student = enrolments.get(0).getStudent();

        Set<Classes> classes = new LinkedHashSet<>();
        LocalDateTime joinedFirst = null;
        for (StudentClass enrolment : enrolments) {
            classes.add(enrolment.getClasses());
            LocalDateTime joined = enrolment.getCreatedDateTime();
            if (joined != null && (joinedFirst == null || joined.isBefore(joinedFirst))) {
                joinedFirst = joined;
            }
        }

        // A class's usual weekday and time are those of its latest session.
        Map<Integer, ClassSession> latestSession = new HashMap<>();
        for (ClassSession session : classSessionRepository.findByClassesInAndStatusInOrderByStartsAtAsc(classes,
                LIVE_SESSION_STATUSES)) {
            latestSession.put(session.getClasses().getClassSeq(), session); // oldest first, so the last one wins
        }

        List<TeacherAttendanceClassResponse> classResponses = new ArrayList<>();
        for (Classes cls : classes) {
            TeacherAttendanceClassResponse classResponse = new TeacherAttendanceClassResponse();
            classResponse.setName(cls.getDisplayName());
            classResponse.setTutor(tutorName(cls));
            ClassSession latest = latestSession.get(cls.getClassSeq());
            if (latest != null && latest.getStartsAt() != null) {
                classResponse.setWeekday(latest.getStartsAt().getDayOfWeek().getValue() % 7); // Sunday = 0
                classResponse.setStartTime(latest.getStartsAt().format(TIME_FORMAT));
            }
            classResponses.add(classResponse);
        }

        TeacherAttendanceStudentResponse response = new TeacherAttendanceStudentResponse();
        response.setId(student.getStudentNo());
        response.setName(joinNonBlank(" ", student.getFirstName(), student.getLastName()));
        response.setInitials(initialsOf(student.getFirstName(), student.getLastName()));
        response.setPhone(student.getContactNumber());
        response.setGrade(gradeText(student));
        response.setEnrolledSince(joinedFirst == null ? null : joinedFirst.toLocalDate().toString());
        response.setEnrolledClasses(classResponses);
        return response;
    }

    private String tutorName(Classes cls) {
        return cls.getTutor() == null ? null : cls.getTutor().getName();
    }

    // "Grade 13 · Commerce"
    private String gradeText(Student student) {
        String grade = student.getGrade();
        if (grade != null && !grade.isBlank() && !grade.trim().toLowerCase().startsWith("grade")) {
            grade = "Grade " + grade.trim();
        }
        return joinNonBlank(" · ", grade, student.getSubjectStream());
    }

    private String initialsOf(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String initials = (first.isEmpty() ? "" : first.substring(0, 1)) + (last.isEmpty() ? "" : last.substring(0, 1));
        return initials.toUpperCase();
    }

    private String joinNonBlank(String separator, String... parts) {
        StringBuilder text = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.isBlank()) {
                continue;
            }
            if (text.length() > 0) {
                text.append(separator);
            }
            text.append(part.trim());
        }
        return text.toString();
    }

    // Lower case with no spaces or dashes, the way the page sends a scanned code.
    private String normalizeBarcode(String value) {
        return value == null ? "" : value.toLowerCase().replaceAll("[\\s-]", "");
    }

    // Digits only, without the leading country code (94) or trunk zero (0), so "0771234567", "+94 77 123 4567" and
    // "771234567" are the same number.
    private String normalizePhone(String value) {
        String digits = value == null ? "" : value.replaceAll("\\D", "");
        if (digits.startsWith("94")) {
            return digits.substring(2);
        }
        if (digits.startsWith("0")) {
            return digits.substring(1);
        }
        return digits;
    }
}
