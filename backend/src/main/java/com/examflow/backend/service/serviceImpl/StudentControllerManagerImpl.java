package com.examflow.backend.service.serviceImpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.StudentResponse;

import com.examflow.backend.entity.Student;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.service.StudentControllerManager;

@Service
public class StudentControllerManagerImpl implements StudentControllerManager {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentControllerManagerImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public List<StudentResponse> getAllStudents() {

        List<Student> studentList = studentRepository.findByStatus(2);

        List<StudentResponse> studentResponsesList = new ArrayList<>();

        for (Student student : studentList) {
            StudentResponse studentResponse = new StudentResponse();
            studentResponse.setId(student.getStudentSeq());
            studentResponse.setStudent_number(null);
            studentResponse.setFirst_name(student.getFirstName());
            studentResponse.setLast_name(student.getLastName());
            studentResponse.setDate_of_birth(student.getDob());
            studentResponse.setEmail(student.getEmail());
            studentResponse.setGender(student.getGender());
            studentResponse.setGrade(student.getGrade());
            studentResponse.setContact_number(student.getContactNumber());
            studentResponse.setWhatsapp_number(student.getWhatsappNumber());
            studentResponse.setSchool_name(student.getSchoolName());
            studentResponse.setSubject_stream(student.getSubjectStream());
            studentResponse.setSubject_stream(student.getSubjectStream());
            studentResponse.setGuardian_name(student.getGuardianName());
            studentResponse.setGuardian_contact(student.getGuardianContactNumber());
            studentResponse.setAddress(student.getAddress());
            studentResponse.setDistrict(student.getDistrict());
            studentResponse.setSubject_stream(student.getSubjectStream());
            if (student.getStatus() == 2) {
                studentResponse.setStatus("ACTIVE");

            } else {
                studentResponse.setStatus("INACTIVE");
            }
            studentResponsesList.add(studentResponse);
        }

        return studentResponsesList;
    }

}
