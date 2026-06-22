package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

import com.examflow.backend.dto.CashierRequest;
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

        List<Cashier> existingCashiers = cashierRepository.findByUserNameAndStatus(cashierRequest.getUsername(), 2);
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

}
