package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.CashierRequest;
import com.examflow.backend.dto.CashierResponse;
import com.examflow.backend.dto.GeneralResponse;

@Service
public interface CashierControllerManager {

    GeneralResponse createCashier(CashierRequest cashierRequest);

    String updateCashier(Integer CashierSeq, CashierRequest cashierRequest);

    String deleteCashier(Integer CashierSeq);

    List<CashierResponse> getAllCashiers();

}
