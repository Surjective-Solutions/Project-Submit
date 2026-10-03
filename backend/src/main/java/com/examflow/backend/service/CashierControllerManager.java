package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.CashierRequest;
import com.examflow.backend.dto.CashierResponse;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.AdminUpdateCashierRequest; 

@Service
public interface CashierControllerManager {

    GeneralResponse createCashier(CashierRequest cashierRequest);

    String updateCashier(Integer CashierSeq, CashierRequest cashierRequest);

    String deleteCashier(Integer CashierSeq);

    List<CashierResponse> getAllCashiers();

    GeneralResponse adminUpdateCashier(Integer cashierSeq, AdminUpdateCashierRequest request);

    GeneralResponse activateCashier(Integer cashierSeq);

    GeneralResponse deactivateCashier(Integer cashierSeq);

}

