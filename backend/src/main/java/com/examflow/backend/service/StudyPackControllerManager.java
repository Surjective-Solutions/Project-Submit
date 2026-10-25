package com.examflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.StudyPackRequest;

@Service
public interface StudyPackControllerManager {

    GeneralResponse createStudyPack(StudyPackRequest studyPackRequest, MultipartFile cover);

}
