package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.ClassRequest;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.repository.ClassesRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.ClassControllerManager;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class ClassControllerManagerImpl implements ClassControllerManager {

    private HttpServletRequest request;
    private final TutorRepository tutorRepository;
    private final ClassesRepository classesRepository;

    @Autowired
    public ClassControllerManagerImpl(HttpServletRequest request,
            TutorRepository tutorRepository, ClassesRepository classesRepository) {
        this.request = request;
        this.tutorRepository = tutorRepository;
        this.classesRepository = classesRepository;
    }

    @Override
    public GeneralResponse createClass(ClassRequest classRequest) {
        System.out.println("reached to impl");
        GeneralResponse response = new GeneralResponse();
        Classes newClass = new Classes();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);

        newClass.setDisplayName(classRequest.getDisplay_name());
        newClass.setDescription(classRequest.getDescription());
        newClass.setTutor(tutor);
        newClass.setMonthlyFee(classRequest.getMonthly_fee());
        newClass.setSubjectName(classRequest.getSubject_name());
        newClass.setLastModifiedBy(username);
        newClass.setCreatedBy(username);
        newClass.setLastModifiedDateTime(LocalDateTime.now());
        newClass.setCreatedDateTime(LocalDateTime.now());
        newClass.setStatus(2); // Set status to 2 for active

        classesRepository.save(newClass);
        response.setMessage("Class created successfully");
        response.setIsSuccess(true);
        System.out.println("Class created successfully");

        return response;
    }

}
