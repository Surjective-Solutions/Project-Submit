package com.examflow.backend.service.serviceImpl;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.AdminClassDetailResponse;
import com.examflow.backend.dto.AdminClassTutorResponse;
import com.examflow.backend.dto.AdminTutorClassResponse;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.repository.ClassesRepository;
import com.examflow.backend.repository.StudentClassPaymentRecordsRepository;
import com.examflow.backend.repository.StudentClassesRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.AdminClassControllerManager;

@Service
public class AdminClassControllerManagerImpl implements AdminClassControllerManager {

    // Tutors, classes and enrollments all use status 2 for "active".
    private static final Integer ACTIVE = 2;

    // The academy runs on Sri Lanka time, so "this month" follows the Colombo calendar.
    private static final ZoneId ACADEMY_ZONE = ZoneId.of("Asia/Colombo");

    private final TutorRepository tutorRepository;

    private final ClassesRepository classesRepository;

    private final StudentClassesRepository studentClassesRepository;

    private final StudentClassPaymentRecordsRepository studentClassPaymentRecordsRepository;

    @Autowired
    public AdminClassControllerManagerImpl(TutorRepository tutorRepository, ClassesRepository classesRepository,
            StudentClassesRepository studentClassesRepository,
            StudentClassPaymentRecordsRepository studentClassPaymentRecordsRepository) {
        this.tutorRepository = tutorRepository;
        this.classesRepository = classesRepository;
        this.studentClassesRepository = studentClassesRepository;
        this.studentClassPaymentRecordsRepository = studentClassPaymentRecordsRepository;
    }

    @Override
    public List<AdminClassTutorResponse> getActiveTutors() {
        // Two grouped queries for all tutors instead of two count queries per tutor.
        Map<Integer, Integer> classCounts = toCountMap(classesRepository.countClassesGroupedByTutor(ACTIVE));
        Map<Integer, Integer> studentCounts = toCountMap(
                studentClassesRepository.countDistinctEnrolledStudentsGroupedByTutor(ACTIVE, ACTIVE));

        List<AdminClassTutorResponse> result = new ArrayList<>();
        for (Tutor tutor : tutorRepository.findByStatus(ACTIVE)) {
            AdminClassTutorResponse card = new AdminClassTutorResponse();
            card.setId(String.valueOf(tutor.getTutorSeq()));
            card.setName(tutor.getName());
            card.setSubject(tutor.getSubject());
            card.setLevel(toLevelCode(tutor.getExamLevel()));
            card.setMediums(toMediums(tutor.getMedium()));
            card.setPhone(tutor.getContactNumber());
            // Tutors have no photo or bio of their own yet; the page falls back to initials.
            card.setPhotoUrl(null);
            card.setDescription(null);
            card.setClassCount(classCounts.getOrDefault(tutor.getTutorSeq(), 0));
            card.setStudentCount(studentCounts.getOrDefault(tutor.getTutorSeq(), 0));
            result.add(card);
        }
        return result;
    }

    @Override
    public List<AdminTutorClassResponse> getTutorClasses(Integer tutorSeq) {
        List<AdminTutorClassResponse> result = new ArrayList<>();
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        if (tutor == null) {
            return result;
        }
        Map<Integer, Integer> enrolled = toCountMap(
                studentClassesRepository.countEnrolledStudentsGroupedByClass(tutor, ACTIVE));
        String level = toLevelCode(tutor.getExamLevel());
        List<String> mediums = toMediums(tutor.getMedium());

        for (Classes cls : classesRepository.findByStatusAndTutor(ACTIVE, tutor)) {
            AdminTutorClassResponse card = new AdminTutorClassResponse();
            card.setId(String.valueOf(cls.getClassSeq()));
            card.setTutorId(String.valueOf(tutorSeq));
            card.setTitle(cls.getDisplayName());
            card.setDescription(cls.getDescription());
            card.setLevel(level);
            card.setMedium(mediums.isEmpty() ? null : mediums.get(0));
            // A class does not store these yet: it is treated as a monthly Theory class, in the
            // batch of the year it was created.
            card.setType("Theory");
            card.setPaymentFormat("monthly");
            card.setBatchYear(cls.getCreatedDateTime() != null ? cls.getCreatedDateTime().getYear() : null);
            card.setPrice(cls.getMonthlyFee());
            card.setMonthlyFee(cls.getMonthlyFee());
            card.setEnrolledCount(enrolled.getOrDefault(cls.getClassSeq(), 0));
            result.add(card);
        }
        return result;
    }

    @Override
    public AdminClassDetailResponse getClassDetail(Integer classSeq) {
        Classes cls = classesRepository.findByClassSeqAndStatus(classSeq, ACTIVE);
        if (cls == null || cls.getTutor() == null) {
            return null;
        }
        Tutor tutor = cls.getTutor();
        List<String> mediums = toMediums(tutor.getMedium());

        AdminClassDetailResponse detail = new AdminClassDetailResponse();
        detail.setId(String.valueOf(cls.getClassSeq()));
        detail.setTutorId(String.valueOf(tutor.getTutorSeq()));
        detail.setTitle(cls.getDisplayName());
        detail.setSubject(cls.getSubjectName() != null ? cls.getSubjectName() : tutor.getSubject());
        detail.setDescription(cls.getDescription());
        detail.setLevel(toLevelCode(tutor.getExamLevel()));
        detail.setMedium(mediums.isEmpty() ? null : mediums.get(0));
        // Same placeholders as the tutor's class list until classes store these.
        detail.setType("Theory");
        detail.setPaymentFormat("monthly");
        detail.setBatchYear(cls.getCreatedDateTime() != null ? cls.getCreatedDateTime().getYear() : null);
        detail.setPrice(cls.getMonthlyFee());
        detail.setMonthlyFee(cls.getMonthlyFee());

        int total = orZero(studentClassesRepository.countEnrolledStudentsInClass(cls, ACTIVE));
        LocalDate today = LocalDate.now(ACADEMY_ZONE);
        int paid = orZero(studentClassPaymentRecordsRepository.countPaidStudentsForMonth(cls,
                today.getMonthValue(), today.getYear()));
        detail.setEnrolledCount(total);

        AdminClassDetailResponse.Enrollments enrollments = new AdminClassDetailResponse.Enrollments();
        enrollments.setTotal(total);
        enrollments.setPaidThisMonth(paid);
        // Free enrollments are not recorded yet.
        enrollments.setFree(0);
        detail.setEnrollments(enrollments);

        AdminClassDetailResponse.Tutor tutorInfo = new AdminClassDetailResponse.Tutor();
        tutorInfo.setId(String.valueOf(tutor.getTutorSeq()));
        tutorInfo.setName(tutor.getName());
        tutorInfo.setSubject(tutor.getSubject());
        tutorInfo.setMediums(mediums);
        detail.setTutor(tutorInfo);
        return detail;
    }

    private int orZero(Integer value) {
        return value == null ? 0 : value;
    }

    private Map<Integer, Integer> toCountMap(List<Object[]> rows) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (Object[] row : rows) {
            counts.put((Integer) row[0], ((Number) row[1]).intValue());
        }
        return counts;
    }

    // "G.C.E. Advanced Level" -> "A/L", "G.C.E. Ordinary Level" -> "O/L".
    private String toLevelCode(String examLevel) {
        if (examLevel == null) {
            return null;
        }
        String value = examLevel.toLowerCase();
        if (value.contains("advanced") || value.equals("a/l")) {
            return "A/L";
        }
        if (value.contains("ordinary") || value.equals("o/l")) {
            return "O/L";
        }
        return examLevel;
    }

    // "Sinhala & English" -> ["Sinhala", "English"].
    private List<String> toMediums(String medium) {
        List<String> mediums = new ArrayList<>();
        if (medium == null) {
            return mediums;
        }
        Arrays.stream(medium.split("&|,|/")).map(String::trim).filter(m -> !m.isEmpty()).forEach(mediums::add);
        return mediums;
    }
}
