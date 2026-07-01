package com.examflow.backend.service.serviceImpl;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;


import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.TutorRequest;
import com.examflow.backend.dto.TutorResponse;
import com.examflow.backend.entity.Cashier;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.TutorControllermanager;

@Service
public class TutorControllerManagerImpl implements TutorControllermanager {

    private final TutorRepository tutorRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public TutorControllerManagerImpl(TutorRepository tutorRepository,
            PasswordEncoder passwordEncoder) {
        this.tutorRepository = tutorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public GeneralResponse createTutor(TutorRequest tutorRequest) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        GeneralResponse response = new GeneralResponse();
        Tutor newTutor = new Tutor();

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
            newTutor.setConfirmPassword(passwordEncoder.encode(tutorRequest.getConfirmPassword()));
            newTutor.setFinalPassword(passwordEncoder.encode(tutorRequest.getConfirmPassword()));
            newTutor.setPassword(passwordEncoder.encode(tutorRequest.getPassword()));
            newTutor.setCreatedDateTime(LocalDateTime.now());
            newTutor.setLastModifiedDateTime(LocalDateTime.now());
            newTutor.setCreatedBy(username);
            newTutor.setLastModifiedBy(username);
            newTutor.setStatus(2);

            tutorRepository.save(newTutor);
            response.setIsSuccess(true);
            response.setMessage("Tutor Created Successfully");

            return response;
        }

    }

    @Override
    public List<TutorResponse> getAllTutors() {

        List<Tutor> tutorList = tutorRepository.findByStatus(2);

        List<TutorResponse> tutorResponses = new ArrayList<>();

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

            tutorResponses.add(tutorResponse);
        }

        return tutorResponses;
    }

    @Override
    public String updateTutor(Integer tutorSeq, TutorRequest tutorRequest) {

        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        tutor.setName(tutorRequest.getDisplayName());
        tutor.setEmail(tutorRequest.getEmail());
        tutor.setContactNumber(tutorRequest.getContactNumber());
        tutor.setSubject(tutorRequest.getSubject());
        tutor.setLastModifiedBy(username);
        tutor.setLastModifiedDateTime(LocalDateTime.now());

        String response = tutorRequest.getDisplayName() + "Updated SuccessFully";

        if (tutorRequest.getNewPassword().length() > 2) {
            tutor.setPassword(passwordEncoder.encode(tutorRequest.getNewPassword()));
            tutor.setConfirmPassword(passwordEncoder.encode(tutorRequest.getConfirmNewPassword()));
            tutor.setFinalPassword(passwordEncoder.encode(tutorRequest.getConfirmNewPassword()));
        }

        if (tutorRequest.getNewUsername().length() > 2) {
            tutor.setUserName(tutorRequest.getNewUsername());
        }

        tutorRepository.save(tutor);

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

}
