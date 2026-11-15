package com.examflow.backend.service.serviceImpl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.AdminClassTutorResponse;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.repository.ClassesRepository;
import com.examflow.backend.repository.StudentClassesRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.AdminClassControllerManager;

@Service
public class AdminClassControllerManagerImpl implements AdminClassControllerManager {

    // Tutors, classes and enrollments all use status 2 for "active".
    private static final Integer ACTIVE = 2;

    private final TutorRepository tutorRepository;

    private final ClassesRepository classesRepository;

    private final StudentClassesRepository studentClassesRepository;

    @Autowired
    public AdminClassControllerManagerImpl(TutorRepository tutorRepository, ClassesRepository classesRepository,
            StudentClassesRepository studentClassesRepository) {
        this.tutorRepository = tutorRepository;
        this.classesRepository = classesRepository;
        this.studentClassesRepository = studentClassesRepository;
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
