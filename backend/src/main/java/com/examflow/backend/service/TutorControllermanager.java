package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.TutorRequest;

@Service
public interface TutorControllermanager {

    GeneralResponse createTutor(TutorRequest tutorRequest);

}
