package com.examflow.backend.service.serviceImpl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.examflow.backend.dto.TeacherStudentClassResponse;
import com.examflow.backend.dto.TeacherStudentResponse;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.StudentClass;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.enums.StudentStatus;
import com.examflow.backend.repository.StudentClassesRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.TeacherStudentControllerManager;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class TeacherStudentControllerManagerImpl implements TeacherStudentControllerManager {

    private static final String TUTOR_ROLE = "tutor";

    // A student counts as registered in a class while the enrolment (and the class) has this status.
    private static final Integer ACTIVE_STATUS = 2;

    private final HttpServletRequest request;

    private final TutorRepository tutorRepository;

    private final StudentClassesRepository studentClassesRepository;

    @Autowired
    public TeacherStudentControllerManagerImpl(HttpServletRequest request, TutorRepository tutorRepository,
            StudentClassesRepository studentClassesRepository) {
        this.request = request;
        this.tutorRepository = tutorRepository;
        this.studentClassesRepository = studentClassesRepository;
    }

    @Override
    public List<TeacherStudentResponse> getMyStudents() {

        // Only a teacher's own token may use this; the teacher is never taken from the request itself.
        if (!TUTOR_ROLE.equals(request.getAttribute("role"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only a teacher can view these students.");
        }

        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorSeq == null ? null : tutorRepository.findByTutorSeq(tutorSeq);
        if (tutor == null) {
            return new ArrayList<>();
        }

        List<StudentClass> enrolments = studentClassesRepository.findEnrolmentsOfTutorsStudents(tutor,
                ACTIVE_STATUS, ACTIVE_STATUS, StudentStatus.DELETED.getSequence());

        // One entry per student, in the order the query returned them, holding only this teacher's classes.
        Map<Integer, TeacherStudentResponse> students = new LinkedHashMap<>();
        for (StudentClass enrolment : enrolments) {
            Student student = enrolment.getStudent();
            TeacherStudentResponse response = students.get(student.getStudentSeq());
            if (response == null) {
                response = toResponse(student);
                students.put(student.getStudentSeq(), response);
            }

            Classes classes = enrolment.getClasses();
            TeacherStudentClassResponse classResponse = new TeacherStudentClassResponse();
            classResponse.setId(classes.getClassSeq());
            classResponse.setTitle(classes.getDisplayName());
            response.getClasses().add(classResponse);
        }

        return new ArrayList<>(students.values());
    }

    private TeacherStudentResponse toResponse(Student student) {
        StudentStatus status = StudentStatus.fromSequence(student.getStatus());

        TeacherStudentResponse response = new TeacherStudentResponse();
        response.setStudent_number(student.getStudentNo());
        response.setFirst_name(student.getFirstName());
        response.setLast_name(student.getLastName());
        // An unknown number is shown as inactive instead of failing the whole list.
        response.setStatus(status != null ? status.name() : "INACTIVE");
        response.setStatus_description(status != null ? status.getStatusDescription() : null);
        response.setProfile_photo_url(student.getProfilePhoto());
        response.setGender(student.getGender());
        response.setDate_of_birth(student.getDob());
        response.setGrade(student.getGrade());
        response.setSubject_stream(student.getSubjectStream());
        response.setSchool_name(student.getSchoolName());
        response.setDistrict(student.getDistrict());
        response.setContact_number(student.getContactNumber());
        response.setWhatsapp_number(student.getWhatsappNumber());
        response.setEmail(student.getEmail());
        response.setGuardian_name(student.getGuardianName());
        response.setGuardian_contact(student.getGuardianContactNumber());
        response.setClasses(new ArrayList<>());
        return response;
    }
}
