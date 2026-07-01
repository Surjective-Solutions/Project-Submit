package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.CashierRequest;
import com.examflow.backend.dto.CashierResponse;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.TutorRequest;
import com.examflow.backend.repository.CashierRepository;
import com.examflow.backend.service.CashierControllerManager;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/cashier")
@CrossOrigin(origins = "http://localhost:3000")
public class CashierController {

    private final CashierControllerManager cashierControllerManager;

    private final CashierRepository cashierRepository;

    @Autowired
    public CashierController(CashierControllerManager cashierControllerManager,
            CashierRepository cashierRepository) {
        this.cashierControllerManager = cashierControllerManager;
        this.cashierRepository = cashierRepository;
    }

    @PostMapping("/create")
    public GeneralResponse createCashier(@RequestBody CashierRequest CashierRequest) {
        System.out.println("reached to controller");
        GeneralResponse response = new GeneralResponse();
        response = cashierControllerManager.createCashier(CashierRequest);
        return response;
    }

    @GetMapping("/get-all-cashiers")
    public List<CashierResponse> getCashiers() {
        return cashierControllerManager.getAllCashiers();
    }

    @PutMapping("update/{id}")
    public String updateCashier(@PathVariable String id, @RequestBody CashierRequest cashierRequest) {
        int cashierSeq = Integer.parseInt(id);
        String result = cashierControllerManager.updateCashier(cashierSeq, cashierRequest);

        return result;
    }

    @DeleteMapping("delete/{id}")
    public String deleteCashier(@PathVariable String id) {
        int cashierSeq = Integer.parseInt(id);
        String result = cashierControllerManager.deleteCashier(cashierSeq);
        return result;
    }

}
