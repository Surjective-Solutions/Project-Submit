package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;


import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.TutorRequest;
import com.examflow.backend.dto.TutorResponse;

@Service
public interface TutorControllermanager {

    GeneralResponse createTutor(TutorRequest tutorRequest);

    List<TutorResponse> getAllTutors();

    String updateTutor(Integer tutorSeq, TutorRequest tutorRequest);

    String deleteTutor(Integer tutorSeq);

}
