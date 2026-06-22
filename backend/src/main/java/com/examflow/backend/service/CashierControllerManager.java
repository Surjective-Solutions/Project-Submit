package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.CashierRequest;
import com.examflow.backend.dto.GeneralResponse;

@Service
public interface CashierControllerManager {

    GeneralResponse createCashier(CashierRequest cashierRequest);

}
