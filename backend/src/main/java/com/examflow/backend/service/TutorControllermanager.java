package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;


import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.InstructorResponse;
import com.examflow.backend.dto.TutorRequest;
import com.examflow.backend.dto.TutorResponse;

@Service
public interface TutorControllermanager {

    GeneralResponse createTutor(TutorRequest tutorRequest);

    List<TutorResponse> getAllTutors();
    TutorResponse getTutorById(Integer id);

    List<InstructorResponse> getEngagedInstructors();

    String updateTutor(Integer tutorSeq, TutorRequest tutorRequest);

    String deleteTutor(Integer tutorSeq);

    GeneralResponse addInstructor(String employee_id);

    List<TutorResponse> getAllTutorsForStudent();

    GeneralResponse adminUpdateTutor(Integer tutorSeq, TutorRequest tutorRequest);

    GeneralResponse adminResetPassword(Integer tutorSeq, TutorRequest tutorRequest);

    GeneralResponse activateTutor(Integer tutorSeq);

    GeneralResponse deactivateTutor(Integer tutorSeq);

}
