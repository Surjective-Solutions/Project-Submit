package com.examflow.backend.service.serviceImpl;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;

import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.TutorRequest;
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

        List<Tutor> existingTutors = tutorRepository.findByUserNameAndStatus(tutorRequest.getUsername(), 2);
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
            newTutor.setContactNumber(tutorRequest.getEmail());
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

}
