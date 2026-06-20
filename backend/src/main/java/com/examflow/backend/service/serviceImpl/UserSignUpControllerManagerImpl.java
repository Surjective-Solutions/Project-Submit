package com.examflow.backend.service.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.UserSignUpRequest;
import com.examflow.backend.dto.UserSignUpRespond;
import com.examflow.backend.entity.Student;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.service.UserSignUpControllermanager;

@Service
public class UserSignUpControllerManagerImpl implements UserSignUpControllermanager {

    private final StudentRepository studentRepository;

    @Autowired
    public UserSignUpControllerManagerImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public UserSignUpRespond signUpStudent(UserSignUpRequest userSignUpRequest) {

        UserSignUpRespond response = new UserSignUpRespond();
        response.setStudentSeq(null);
        List<Student> existingStudentsByContactNumber = studentRepository
                .findByContactNumber(userSignUpRequest.getContactNumber());
        List<Student> existingStudentsByEmail = studentRepository.findByEmail(userSignUpRequest.getEmail());

        if (!existingStudentsByContactNumber.isEmpty()) {
            response.setMessage("Student with this contact number already exists");
            response.setStatus("error");
            return response;
        } else if (!existingStudentsByEmail.isEmpty()) {
            response.setMessage("Student with this email already exists");
            response.setStatus("error");
            return response;
        } else if (!userSignUpRequest.getPassword().equals(userSignUpRequest.getConfirmPassword())) {
            response.setMessage("Password and Confirm Password does not match");
            response.setStatus("error");
            return response;
        } else {
            System.out.println("impl reached");

            Student student = new Student();
            student.setFirstName(userSignUpRequest.getFirstName());
            student.setLastName(userSignUpRequest.getLastName());
            student.setEmail(userSignUpRequest.getEmail());
            student.setPassword(userSignUpRequest.getPassword());
            student.setAddress(userSignUpRequest.getAddress());
            student.setContactNumber(userSignUpRequest.getContactNumber());
            student.setGuardianContactNumber(userSignUpRequest.getGuardianContactNumber());
            student.setSubjectStream(userSignUpRequest.getSubjectStream());
            student.setDistrict(userSignUpRequest.getDistrict());
            student.setGrade(userSignUpRequest.getGrade());
            student.setConfirmPassword(userSignUpRequest.getConfirmPassword());
            student.setGender(userSignUpRequest.getGender());
            student.setGuardianName(userSignUpRequest.getGuardianName());
            student.setSchoolName(userSignUpRequest.getSchoolName());
            student.setWhatsappNumber(userSignUpRequest.getWhatsappNumber());
            student.setMarketingConsent(userSignUpRequest.getMarketingConsent());
            student.setTermsAccepted(userSignUpRequest.getTermsAccepted());
            student.setFinalPassword(userSignUpRequest.getConfirmPassword());
            student.setStatus(2);// set status to approved status

            studentRepository.save(student);
            System.out.println("Student saved successfully");

            response.setMessage("Student signed up successfully");
            response.setStatus("success");
            response.setStudentSeq(student.getStudentSeq());
            return response;
        }

    }

}
