package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.CashierRequest;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.TutorRequest;
import com.examflow.backend.service.CashierControllerManager;

@RestController
@RequestMapping("/api/cashier")
@CrossOrigin(origins = "http://localhost:3000")
public class CashierController {

    private final CashierControllerManager cashierControllerManager;

    @Autowired
    public CashierController(CashierControllerManager cashierControllerManager) {
        this.cashierControllerManager = cashierControllerManager;
    }

    @PostMapping("/create")
    public GeneralResponse hello(@RequestBody CashierRequest CashierRequest) {
        System.out.println("reached to controller");
        GeneralResponse response = new GeneralResponse();
        response = cashierControllerManager.createCashier(CashierRequest);
        return response;
    }
}
