package com.examflow.backend.service.serviceImpl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.InstructorSignUpRequest;
import com.examflow.backend.dto.OtpRespond;
import com.examflow.backend.dto.UserSignUpRequest;
import com.examflow.backend.dto.UserSignUpRespond;
import com.examflow.backend.entity.Instructor;
import com.examflow.backend.entity.OtpConfiguration;
import com.examflow.backend.entity.Student;
import com.examflow.backend.repository.InstructorRepository;
import com.examflow.backend.repository.OtpConfigurationRepository;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.service.UserSignUpControllermanager;

@Service
public class UserSignUpControllerManagerImpl implements UserSignUpControllermanager {

    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final OtpConfigurationRepository otpConfigurationRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserSignUpControllerManagerImpl(StudentRepository studentRepository,
            InstructorRepository instructorRepository,
            OtpConfigurationRepository otpConfigurationRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.instructorRepository = instructorRepository;
        this.otpConfigurationRepository = otpConfigurationRepository;
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
            student.setPassword(passwordEncoder.encode(userSignUpRequest.getPassword()));
            student.setAddress(userSignUpRequest.getAddress());
            student.setContactNumber(userSignUpRequest.getContactNumber());
            student.setGuardianContactNumber(userSignUpRequest.getGuardianContactNumber());
            student.setSubjectStream(userSignUpRequest.getSubjectStream());
            student.setDistrict(userSignUpRequest.getDistrict());
            student.setGrade(userSignUpRequest.getGrade());
            student.setConfirmPassword(passwordEncoder.encode(userSignUpRequest.getConfirmPassword()));
            student.setGender(userSignUpRequest.getGender());
            student.setGuardianName(userSignUpRequest.getGuardianName());
            student.setSchoolName(userSignUpRequest.getSchoolName());
            student.setWhatsappNumber(userSignUpRequest.getWhatsappNumber());
            student.setMarketingConsent(userSignUpRequest.getMarketingConsent());
            student.setRegisterDateTime(LocalDateTime.now());
            student.setTermsAccepted(userSignUpRequest.getTermsAccepted());
            student.setFinalPassword(passwordEncoder.encode(userSignUpRequest.getConfirmPassword()));
            student.setStatus(2);// set status to approved status

            studentRepository.save(student);
            System.out.println("Student saved successfully");

            response.setMessage("Student signed up successfully");
            response.setStatus("success");
            response.setStudentSeq(student.getStudentSeq());
            return response;
        }

    }

    @Override
    public UserSignUpRespond instructorSignUpStudent(InstructorSignUpRequest instructorSignUpRequest) {
        UserSignUpRespond response = new UserSignUpRespond();

        response.setStudentSeq(null);

        List<Instructor> existingInstructorsByContactNumber = instructorRepository
                .findByContactNumber(instructorSignUpRequest.getContactNumber());
        List<Instructor> existingInstructorsByEmail = instructorRepository
                .findByEmail(instructorSignUpRequest.getEmail());

        if (!existingInstructorsByContactNumber.isEmpty()) {
            response.setMessage("Instructor with this contact number already exists");
            response.setStatus("error");
            return response;
        } else if (!existingInstructorsByEmail.isEmpty()) {
            response.setMessage("Instructor with this email already exists");
            response.setStatus("error");
            return response;
        } else if (!instructorSignUpRequest.getPassword().equals(instructorSignUpRequest.getConfirmPassword())) {
            response.setMessage("Password and Confirm Password does not match");
            response.setStatus("error");
            return response;
        } else {
            System.out.println("impl reached");

            Instructor instructor = new Instructor();

            instructor.setAddress(instructorSignUpRequest.getAddress());
            instructor.setConfirmPassword(instructorSignUpRequest.getConfirmPassword());
            instructor.setPassword(instructorSignUpRequest.getPassword());
            instructor.setEmail(instructorSignUpRequest.getEmail());
            instructor.setContactNumber(instructorSignUpRequest.getContactNumber());
            instructor.setNicNumber(instructorSignUpRequest.getNicNumber());
            instructor.setTermsAccepted(instructorSignUpRequest.getTermsAccepted());
            instructor.setFinalPassword(instructorSignUpRequest.getConfirmPassword());
            instructor.setStatus(2);
            instructor.setIsOtpVerified(false);
            instructor.setFullName(instructorSignUpRequest.getFullName());

            instructorRepository.save(instructor);
            System.out.println("Instructor saved successfully");
            generateOtpInstructor(instructorSignUpRequest.getContactNumber(), instructorSignUpRequest.getEmail(),
                    instructor);
            response.setMessage("Instructor signed up successfully");
            response.setStatus("success");
            response.setStudentSeq(instructor.getInstructorSeq());
            return response;
        }
    }

    @Override
    public String generateOtpInstructor(String contactNumber, String email, Instructor instructor) {

        OtpConfiguration existingotpConfiguration = otpConfigurationRepository
                .findByContactNumberAndStatus(contactNumber, 2);
        if (existingotpConfiguration != null) {
            existingotpConfiguration.setStatus(1); // Set status to inactive
            otpConfigurationRepository.save(existingotpConfiguration);
        }

        OtpConfiguration otpConfiguration = new OtpConfiguration();
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);

        otpConfiguration.setContactNumber(contactNumber);
        otpConfiguration.setEmail(email);
        otpConfiguration.setOtp(otp);
        otpConfiguration.setGeneratedTime(LocalDateTime.now());
        otpConfiguration.setInstructor(instructor);
        otpConfiguration.setOtpExpiryTime(System.currentTimeMillis() + 3 * 60 * 1000); // Set expiry time to 3 minutes
                                                                                       // from now
        otpConfiguration.setStatus(2); // Set status to active
        otpConfiguration.setSendStatus(1); // Set send status to notSend

        System.out.println("Generated OTP: " + otp);
        otpConfigurationRepository.save(otpConfiguration);

        return null;
    }

    @Override
    public OtpRespond verifyOtp(Integer identifier, Integer otp) {
        OtpRespond otpRespond = new OtpRespond();
        Instructor instructor = instructorRepository.findByInstructorSeq(identifier);

        if (instructor != null) {
            OtpConfiguration otpConfiguration = otpConfigurationRepository.findByContactNumberAndStatusAndInstructor(
                    instructor.getContactNumber(), 2, instructor);
            if (otpConfiguration != null) {

                if (otpConfiguration.getOtp().equals(otp)) {
                    if (otpConfiguration.getOtpExpiryTime() >= System.currentTimeMillis()) {
                        otpConfiguration.setStatus(1); // Set status to inactive
                        otpConfigurationRepository.save(otpConfiguration);
                        instructor.setIsOtpVerified(true);
                        instructorRepository.save(instructor);
                        otpRespond.setIsSuccess(true);
                        otpRespond.setMessage("OTP verified successfully");
                        return otpRespond;
                    } else {
                        otpRespond.setIsSuccess(false);
                        otpRespond.setMessage("OTP expired");
                        return otpRespond;
                    }
                } else {
                    otpRespond.setIsSuccess(false);
                    otpRespond.setMessage("Invalid OTP");
                    return otpRespond;
                }
            } else {
                otpRespond.setIsSuccess(false);
                otpRespond.setMessage("unexpected error occurred");
                return otpRespond;
            }

        }
        otpRespond.setIsSuccess(false);
        otpRespond.setMessage("Instructor not found");
        return otpRespond;

    }

}
