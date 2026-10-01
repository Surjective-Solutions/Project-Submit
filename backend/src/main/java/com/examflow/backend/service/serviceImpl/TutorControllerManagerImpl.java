package com.examflow.backend.service.serviceImpl;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;

import com.examflow.backend.dto.ClassResponse;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.InstructorResponse;
import com.examflow.backend.dto.TutorRequest;
import com.examflow.backend.dto.TutorResponse;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.Instructor;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.entity.TutorInstructor;
import com.examflow.backend.repository.ClassesRepository;
import com.examflow.backend.repository.InstructorRepository;
import com.examflow.backend.repository.TutorInstructorRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.TutorControllermanager;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class TutorControllerManagerImpl implements TutorControllermanager {

    private final TutorRepository tutorRepository;
    private final PasswordEncoder passwordEncoder;
    private final InstructorRepository instructorRepository;
    private final TutorInstructorRepository tutorInstructorRepository;
    private final ClassesRepository classesRepository;
    private HttpServletRequest request;

    @Autowired
    public TutorControllerManagerImpl(TutorRepository tutorRepository,
            TutorInstructorRepository tutorInstructorRepository,
            HttpServletRequest request,
            ClassesRepository classesRepository,
            InstructorRepository instructorRepository,
            PasswordEncoder passwordEncoder) {
        this.tutorRepository = tutorRepository;
        this.passwordEncoder = passwordEncoder;
        this.request = request;
        this.classesRepository = classesRepository;
        this.instructorRepository = instructorRepository;
        this.tutorInstructorRepository = tutorInstructorRepository;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    @Override
    public GeneralResponse createTutor(TutorRequest tutorRequest) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        GeneralResponse response = new GeneralResponse();
        Tutor newTutor = new Tutor();

        if (isBlank(tutorRequest.getDisplayName())
                || isBlank(tutorRequest.getUsername())
                || isBlank(tutorRequest.getEmail())
                || isBlank(tutorRequest.getContactNumber())
                || isBlank(tutorRequest.getSubject())
                || isBlank(tutorRequest.getExamLevel())
                || isBlank(tutorRequest.getPassword())
                || isBlank(tutorRequest.getConfirmPassword())) {
            response.setIsSuccess(false);
            response.setMessage("Please fill all the fields.");
            return response;
        }

        if (!tutorRequest.getPassword().equals(tutorRequest.getConfirmPassword())) {
            response.setIsSuccess(false);
            response.setMessage("Passwords do not match.");
            return response;
        }

        List<Tutor> existingTutors = tutorRepository.findByUserName(tutorRequest.getUsername());
        if (existingTutors.size() != 0) {
            response.setIsSuccess(false);
            response.setMessage("userName Already exists");
            return response;
        } else {
            String username = auth.getName();

            System.out.println(username);

            newTutor.setName(tutorRequest.getDisplayName());
            newTutor.setUserName(tutorRequest.getUsername());
            newTutor.setEmail(tutorRequest.getEmail());
            newTutor.setContactNumber(tutorRequest.getContactNumber());
            newTutor.setSubject(tutorRequest.getSubject());
            newTutor.setExamLevel(tutorRequest.getExamLevel());
            newTutor.setConfirmPassword(passwordEncoder.encode(tutorRequest.getConfirmPassword()));
            newTutor.setFinalPassword(passwordEncoder.encode(tutorRequest.getConfirmPassword()));
            newTutor.setPassword(passwordEncoder.encode(tutorRequest.getPassword()));
            newTutor.setCreatedDateTime(LocalDateTime.now());
            newTutor.setLastModifiedDateTime(LocalDateTime.now());
            newTutor.setCreatedBy(username);
            newTutor.setLastModifiedBy(username);
            newTutor.setStatus(1); //1=inactive, 0=deleted, 2=active 

            tutorRepository.save(newTutor);
            response.setIsSuccess(true);
            response.setMessage("Tutor Created Successfully");

            return response;
        }

    }

    @Override
    public List<TutorResponse> getAllTutors() {

        List<Tutor> tutorList = tutorRepository.findByStatusIn(List.of(1, 2));

        List<TutorResponse> tutorResponses = new ArrayList<>();

        for (Tutor tutor : tutorList) {
            TutorResponse tutorResponse = new TutorResponse();

            tutorResponse.setId(tutor.getTutorSeq());
            tutorResponse.setDisplayName(tutor.getName());
            tutorResponse.setEmail(tutor.getEmail());
            tutorResponse.setContactNumber(tutor.getContactNumber());
            tutorResponse.setSubject(tutor.getSubject());
            tutorResponse.setUsername(tutor.getUserName());
            tutorResponse.setTeacher_name(tutor.getName());
            tutorResponse.setSubject_area(tutor.getSubject());
            tutorResponse.setBio(tutor.getSubject());
            tutorResponse.setStatus(tutor.getStatus());
            tutorResponse.setTutorCode(tutor.getTutorCode());
            tutorResponse.setExamLevel(tutor.getExamLevel());
            tutorResponse.setCreatedDateTime(tutor.getCreatedDateTime());

            tutorResponses.add(tutorResponse);
        }

        return tutorResponses;
    }

    @Override
    public String updateTutor(Integer tutorSeq, TutorRequest tutorRequest) {

        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        if (isBlank(tutorRequest.getPassword())) {
            return "Please enter your password to save changes.";
        }

        if (!passwordEncoder.matches(tutorRequest.getPassword(), tutor.getPassword())) {
            return "Incorrect password.";
        }

        if (!isBlank(tutorRequest.getDisplayName())) {
            tutor.setName(tutorRequest.getDisplayName());
        }
        if (!isBlank(tutorRequest.getEmail())) {
            tutor.setEmail(tutorRequest.getEmail());
        }
        if (!isBlank(tutorRequest.getContactNumber())) {
            tutor.setContactNumber(tutorRequest.getContactNumber());
        }
        if (!isBlank(tutorRequest.getSubject())) {
            tutor.setSubject(tutorRequest.getSubject());
        }
        if (!isBlank(tutorRequest.getExamLevel())) {
            tutor.setExamLevel(tutorRequest.getExamLevel());
        }
        
        tutor.setLastModifiedBy(username);
        tutor.setLastModifiedDateTime(LocalDateTime.now());

        if (!isBlank(tutorRequest.getNewPassword()) && tutorRequest.getNewPassword().length() > 2) {
            if (!tutorRequest.getNewPassword().equals(tutorRequest.getConfirmNewPassword())) {
                return "New passwords do not match.";
            }
            tutor.setPassword(passwordEncoder.encode(tutorRequest.getNewPassword()));
            tutor.setConfirmPassword(passwordEncoder.encode(tutorRequest.getConfirmNewPassword()));
            tutor.setFinalPassword(passwordEncoder.encode(tutorRequest.getConfirmNewPassword()));
        }

        if (!isBlank(tutorRequest.getNewUsername()) && tutorRequest.getNewUsername().length() > 2) {
            tutor.setUserName(tutorRequest.getNewUsername());
        }

        tutorRepository.save(tutor);

        return tutor.getName() + " Updated Successfully";
    }

    @Override
    public GeneralResponse adminUpdateTutor(Integer tutorSeq, TutorRequest tutorRequest) {
        GeneralResponse response = new GeneralResponse();
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        if (tutor == null) {
            response.setIsSuccess(false);
            response.setMessage("Tutor not found.");
            return response;
        }

        if (!isBlank(tutorRequest.getDisplayName())) {
            tutor.setName(tutorRequest.getDisplayName());
        }
        if (!isBlank(tutorRequest.getEmail())) {
            tutor.setEmail(tutorRequest.getEmail());
        }
        if (!isBlank(tutorRequest.getContactNumber())) {
            tutor.setContactNumber(tutorRequest.getContactNumber());
        }
        if (!isBlank(tutorRequest.getSubject())) {
            tutor.setSubject(tutorRequest.getSubject());
        }
        if (!isBlank(tutorRequest.getExamLevel())) {
            tutor.setExamLevel(tutorRequest.getExamLevel());
        }
        tutor.setLastModifiedBy(username);
        tutor.setLastModifiedDateTime(LocalDateTime.now());

        tutorRepository.save(tutor);

        response.setIsSuccess(true);
        response.setMessage(tutor.getName() + " updated successfully.");
        return response;
    }

    @Override
    public GeneralResponse adminResetPassword(Integer tutorSeq, TutorRequest tutorRequest) {
        GeneralResponse response = new GeneralResponse();
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        if (tutor == null) {
            response.setIsSuccess(false);
            response.setMessage("Tutor not found.");
            return response;
        }

        if (isBlank(tutorRequest.getNewPassword()) || isBlank(tutorRequest.getConfirmNewPassword())) {
            response.setIsSuccess(false);
            response.setMessage("Please fill all the fields.");
            return response;
        }

        if (!tutorRequest.getNewPassword().equals(tutorRequest.getConfirmNewPassword())) {
            response.setIsSuccess(false);
            response.setMessage("Passwords do not match.");
            return response;
        }

        tutor.setPassword(passwordEncoder.encode(tutorRequest.getNewPassword()));
        tutor.setConfirmPassword(passwordEncoder.encode(tutorRequest.getConfirmNewPassword()));
        tutor.setFinalPassword(passwordEncoder.encode(tutorRequest.getConfirmNewPassword()));
        tutor.setLastModifiedBy(username);
        tutor.setLastModifiedDateTime(LocalDateTime.now());

        tutorRepository.save(tutor);

        response.setIsSuccess(true);
        response.setMessage("Password reset successfully.");
        return response;
    }

    @Override
    public GeneralResponse activateTutor(Integer tutorSeq) {
        return setTutorStatus(tutorSeq, 2, "activated");
    }

    @Override
    public GeneralResponse deactivateTutor(Integer tutorSeq) {
        return setTutorStatus(tutorSeq, 1, "deactivated");
    }

    private GeneralResponse setTutorStatus(Integer tutorSeq, Integer status, String actionLabel) {
        GeneralResponse response = new GeneralResponse();
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        if (tutor == null) {
            response.setIsSuccess(false);
            response.setMessage("Tutor not found.");
            return response;
        }

        tutor.setStatus(status);
        tutor.setLastModifiedBy(username);
        tutor.setLastModifiedDateTime(LocalDateTime.now());
        tutorRepository.save(tutor);

        response.setIsSuccess(true);
        response.setMessage(tutor.getName() + " " + actionLabel + " successfully.");
        return response;
    }

    @Override
    public String deleteTutor(Integer tutorSeq) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        String response = "";
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        tutor.setStatus(0);
        tutor.setLastModifiedBy(username);
        tutor.setLastModifiedDateTime(LocalDateTime.now());

        response = tutor.getName() + " Deleted Successfully.";
        tutorRepository.save(tutor);

        return response;
    }

    @Override
    public GeneralResponse addInstructor(String employee_id) {
        System.out.println(employee_id);
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        System.out.println("Adding instructor with employee_id: " + employee_id + " for tutor: " + tutorSeq);

        Instructor instructor = instructorRepository.findByInstrutorNo(employee_id);

        if (instructor == null) {
            response.setIsSuccess(false);
            response.setMessage("Instructor with employee_id " + employee_id + " not found.");
            return response;
        } else {
            List<TutorInstructor> existingRelations = tutorInstructorRepository
                    .findByTutorAndInstructorAndIsEngaged(tutor, instructor, true);

            if (!existingRelations.isEmpty()) {
                response.setIsSuccess(false);
                response.setMessage(
                        "Instructor with employee_id " + employee_id + " is already engaged with this tutor.");
                return response;
            } else {
                TutorInstructor tutorInstructor = new TutorInstructor();
                tutorInstructor.setTutor(tutor);
                tutorInstructor.setInstructor(instructor);
                tutorInstructor.setTutorStatus(2);
                tutorInstructor.setInstructorStatus(2);
                tutorInstructor.setIsEngaged(true);
                tutorInstructor.setCreatedBy(username);
                tutorInstructor.setCreatedDateTime(LocalDateTime.now());
                tutorInstructor.setLastModifiedBy(username);
                tutorInstructor.setLastModifiedDateTime(LocalDateTime.now());
                tutorInstructorRepository.save(tutorInstructor);

                response.setIsSuccess(true);
                response.setMessage("Instructor with employee_id " + employee_id + " added successfully.");
                return response;
            }

        }

    }

    @Override
    public List<InstructorResponse> getEngagedInstructors() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        List<TutorInstructor> engagedRelations = tutorInstructorRepository.findByTutorAndIsEngaged(tutor, true);

        List<InstructorResponse> instructorResponses = new ArrayList<>();
        for (TutorInstructor ti : engagedRelations) {
            InstructorResponse response = new InstructorResponse();
            response.setId(ti.getInstructor().getInstructorSeq());
            String fullName = ti.getInstructor().getFullName();
            response.setName(fullName);
            response.setStatus("ACTIVE");
            response.setEmployee_id(ti.getInstructor().getInstrutorNo());
            instructorResponses.add(response);
        }

        return instructorResponses;
    }

    @Override
    public List<TutorResponse> getAllTutorsForStudent() {
        List<Tutor> tutorList = tutorRepository.findByStatus(2);
        List<TutorResponse> tutorResponses = new ArrayList<>();

        if (tutorList.size() != 0) {
            for (Tutor tutor : tutorList) {
                TutorResponse tutorResponse = new TutorResponse();

                tutorResponse.setId(tutor.getTutorSeq());
                tutorResponse.setDisplayName(tutor.getName());
                tutorResponse.setEmail(tutor.getEmail());
                tutorResponse.setContactNumber(tutor.getContactNumber());
                tutorResponse.setSubject(tutor.getSubject());
                tutorResponse.setTeacher_name(tutor.getName());
                tutorResponse.setSubject_area(tutor.getSubject());
                tutorResponse.setBio(tutor.getSubject());

                List<Classes> classesList = classesRepository.findByStatusAndTutor(2, tutor);
                List<ClassResponse> classResponses = new ArrayList<>();
                for (Classes classes : classesList) {
                    ClassResponse classResponse = new ClassResponse();
                    classResponse.setId(classes.getClassSeq());
                    classResponse.setDisplay_name(classes.getDisplayName());
                    classResponse.setDescription(classes.getDescription());
                    classResponse.setClass_name(classes.getDisplayName());
                    classResponse.setSubject(classes.getSubjectName());
                    classResponse.setMonthly_fee(classes.getMonthlyFee());
                    classResponses.add(classResponse);
                }
                tutorResponse.setClasses(classResponses);

                tutorResponses.add(tutorResponse);
            }
        } else {
            System.out.println("No tutors found.");
            return tutorResponses;
        }
        return tutorResponses;
    }

    @Override
    public TutorResponse getTutorById(Integer id) {
        Tutor tutor = tutorRepository.findByTutorSeq(id);
        if (tutor == null) return null;

        TutorResponse tutorResponse = new TutorResponse();
        tutorResponse.setId(tutor.getTutorSeq());
        tutorResponse.setDisplayName(tutor.getName());
        tutorResponse.setEmail(tutor.getEmail());
        tutorResponse.setContactNumber(tutor.getContactNumber());
        tutorResponse.setSubject(tutor.getSubject());
        tutorResponse.setUsername(tutor.getUserName());
        tutorResponse.setTeacher_name(tutor.getName());
        tutorResponse.setSubject_area(tutor.getSubject());
        tutorResponse.setBio(tutor.getSubject());
        tutorResponse.setStatus(tutor.getStatus());
        tutorResponse.setTutorCode(tutor.getTutorCode());
        tutorResponse.setExamLevel(tutor.getExamLevel());
        tutorResponse.setCreatedDateTime(tutor.getCreatedDateTime());

        return tutorResponse;
    }

}
