package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

import com.examflow.backend.dto.CashierRequest;
import com.examflow.backend.dto.CashierResponse;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.entity.Cashier;
import com.examflow.backend.repository.CashierRepository;
import com.examflow.backend.service.CashierControllerManager;

@Service
public class CashierControllerManagerImpl implements CashierControllerManager {

    private final CashierRepository cashierRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public CashierControllerManagerImpl(CashierRepository cashierRepository,
            PasswordEncoder passwordEncoder) {
        this.cashierRepository = cashierRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public GeneralResponse createCashier(CashierRequest cashierRequest) {
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Cashier newCashier = new Cashier();
        System.out.println(username);

        List<Cashier> existingCashiers = cashierRepository.findByUserName(cashierRequest.getUsername());
        if (existingCashiers.size() != 0) {
            response.setIsSuccess(false);
            response.setMessage("userName Already exists");
            return response;
        } else {

            newCashier.setUserName(cashierRequest.getUsername());
            newCashier.setFullName(cashierRequest.getFullName());
            newCashier.setEmail(cashierRequest.getEmail());
            newCashier.setStatus(2);// make cashier to approved status

            newCashier.setConfirmPassword(passwordEncoder.encode(cashierRequest.getConfirmPassword()));
            newCashier.setPassword(passwordEncoder.encode(cashierRequest.getPassword()));
            newCashier.setFinalPassword(passwordEncoder.encode(cashierRequest.getConfirmPassword()));

            newCashier.setCreatedDateTime(LocalDateTime.now());
            newCashier.setLastModifiedDateTime(LocalDateTime.now());
            newCashier.setCreatedBy(username);
            newCashier.setLastModifiedBy(username);

            cashierRepository.save(newCashier);
            response.setIsSuccess(true);
            response.setMessage("Cashier Created Successsfully");
            return response;
        }

    }

    @Override
    public List<CashierResponse> getAllCashiers() {
        List<Cashier> cashierList = cashierRepository.findByStatus(2);

        List<CashierResponse> cashierResponseList = new ArrayList<>();

        for (Cashier cashier : cashierList) {
            CashierResponse cashierResponse = new CashierResponse();
            cashierResponse.setFullName(cashier.getFullName());
            cashierResponse.setEmail(cashier.getEmail());
            cashierResponse.setUsername(cashier.getUserName());
            cashierResponse.setId(cashier.getCashierSeq());
            cashierResponseList.add(cashierResponse);
        }

        return cashierResponseList;
    }

    @Override
    public String updateCashier(Integer CashierSeq, CashierRequest cashierRequest) {

        Cashier cashier = cashierRepository.findByCashierSeq(CashierSeq);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        cashier.setFullName(cashierRequest.getFullName());
        cashier.setEmail(cashierRequest.getEmail());
        cashier.setLastModifiedBy(username);
        cashier.setLastModifiedDateTime(LocalDateTime.now());

        String response = cashierRequest.getFullName() + "Updated SuccessFully";

        if (cashierRequest.getNewPassword().length() > 2) {
            cashier.setPassword(passwordEncoder.encode(cashierRequest.getNewPassword()));
            cashier.setConfirmPassword(passwordEncoder.encode(cashierRequest.getConfirmNewPassword()));
            cashier.setFinalPassword(passwordEncoder.encode(cashierRequest.getConfirmNewPassword()));
        }

        if (cashierRequest.getNewUsername().length() > 2) {
            cashier.setUserName(cashierRequest.getNewUsername());
        }

        System.out.println(cashierRequest.getConfirmNewPassword());

        cashierRepository.save(cashier);

        return response;
    }

    @Override
    public String deleteCashier(Integer CashierSeq) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        String response = "";
        Cashier cashier = cashierRepository.findByCashierSeq(CashierSeq);
        cashier.setStatus(0);
        cashier.setLastModifiedBy(username);
        cashier.setLastModifiedDateTime(LocalDateTime.now());

        response = cashier.getFullName() + " Deleted Successfully.";
        cashierRepository.save(cashier);

        return response;
    }

}
