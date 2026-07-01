package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.ClassRequest;
import com.examflow.backend.dto.GeneralResponse;

@Service
public interface ClassControllerManager {

    GeneralResponse createClass(ClassRequest classRequest);
}
