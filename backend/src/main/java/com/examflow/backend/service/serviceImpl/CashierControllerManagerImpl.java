package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

import com.examflow.backend.dto.AdminUpdateCashierRequest;
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

    private static final java.util.regex.Pattern USERNAME_PATTERN = java.util.regex.Pattern.compile("^[a-zA-Z0-9_]+$");
    private static final java.util.regex.Pattern EMAIL_PATTERN = java.util.regex.Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final java.util.regex.Pattern CONTACT_NUMBER_PATTERN = java.util.regex.Pattern.compile("^\\d{10}$");
    private static final java.util.regex.Pattern STRONG_PASSWORD_PATTERN = java.util.regex.Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$");

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

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

        if (isBlank(cashierRequest.getFullName())
                || isBlank(cashierRequest.getUsername())
                || isBlank(cashierRequest.getEmail())
                || isBlank(cashierRequest.getContactNumber())
                || isBlank(cashierRequest.getNicNumber())
                || isBlank(cashierRequest.getPassword())
                || isBlank(cashierRequest.getConfirmPassword())) {
            response.setIsSuccess(false);
            response.setMessage("Please fill all the fields.");
            return response;
        }

        if (!USERNAME_PATTERN.matcher(cashierRequest.getUsername()).matches()) {
            response.setIsSuccess(false);
            response.setMessage("Username can only contain letters, numbers, and underscores.");
            return response;
        }

        if (!EMAIL_PATTERN.matcher(cashierRequest.getEmail()).matches()) {
            response.setIsSuccess(false);
            response.setMessage("Please enter a valid email address.");
            return response;
        }

        if (!CONTACT_NUMBER_PATTERN.matcher(cashierRequest.getContactNumber()).matches()) {
            response.setIsSuccess(false);
            response.setMessage("Contact number must be exactly 10 digits.");
            return response;
        }

        if (!STRONG_PASSWORD_PATTERN.matcher(cashierRequest.getPassword()).matches()) {
            response.setIsSuccess(false);
            response.setMessage("Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.");
            return response;
        }

        if (!cashierRequest.getPassword().equals(cashierRequest.getConfirmPassword())) {
            response.setIsSuccess(false);
            response.setMessage("Passwords do not match.");
            return response;
        }

        List<Cashier> existingByUsername = cashierRepository.findByUserName(cashierRequest.getUsername());
        if (!existingByUsername.isEmpty()) {
            response.setIsSuccess(false);
            response.setMessage("Username already exists.");
            return response;
        }

        List<Cashier> existingByEmail = cashierRepository.findByEmail(cashierRequest.getEmail());
        if (!existingByEmail.isEmpty()) {
            response.setIsSuccess(false);
            response.setMessage("A cashier with this email already exists.");
            return response;
        }

        List<Cashier> existingByContact = cashierRepository.findByContactNumber(cashierRequest.getContactNumber());
        if (!existingByContact.isEmpty()) {
            response.setIsSuccess(false);
            response.setMessage("A cashier with this contact number already exists.");
            return response;
        }

        Cashier newCashier = new Cashier();
        newCashier.setUserName(cashierRequest.getUsername());
        newCashier.setFullName(cashierRequest.getFullName());
        newCashier.setEmail(cashierRequest.getEmail());
        newCashier.setContactNumber(cashierRequest.getContactNumber());
        newCashier.setNicNumber(cashierRequest.getNicNumber());
        newCashier.setStatus(0); // cashiers are active immediately, same as before

        newCashier.setConfirmPassword(passwordEncoder.encode(cashierRequest.getConfirmPassword()));
        newCashier.setPassword(passwordEncoder.encode(cashierRequest.getPassword()));
        newCashier.setFinalPassword(passwordEncoder.encode(cashierRequest.getConfirmPassword()));

        newCashier.setCreatedDateTime(LocalDateTime.now());
        newCashier.setLastModifiedDateTime(LocalDateTime.now());
        newCashier.setCreatedBy(username);
        newCashier.setLastModifiedBy(username);

        cashierRepository.save(newCashier);
        response.setIsSuccess(true);
        response.setMessage("Cashier created successfully");
        return response;
    }

    @Override
    public List<CashierResponse> getAllCashiers() {
        List<Cashier> cashierList = cashierRepository.findAll();

        List<CashierResponse> cashierResponseList = new ArrayList<>();

        for (Cashier cashier : cashierList) {
            CashierResponse cashierResponse = new CashierResponse();
            cashierResponse.setFullName(cashier.getFullName());
            cashierResponse.setEmail(cashier.getEmail());
            cashierResponse.setUsername(cashier.getUserName());
            cashierResponse.setId(cashier.getCashierSeq());
            cashierResponse.setContactNumber(cashier.getContactNumber());
            cashierResponse.setNicNumber(cashier.getNicNumber());
            cashierResponse.setCreatedDateTime(cashier.getCreatedDateTime());
            cashierResponse.setCashierCode(cashier.getCashierCode());
            cashierResponse.setStatus(cashier.getStatus());
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

    @Override
    public GeneralResponse adminUpdateCashier(Integer cashierSeq, AdminUpdateCashierRequest request) {
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Cashier cashier = cashierRepository.findByCashierSeq(cashierSeq);
        if (cashier == null) {
            response.setIsSuccess(false);
            response.setMessage("Cashier not found.");
            return response;
        }

        if (isBlank(request.getFullName()) || isBlank(request.getEmail())
                || isBlank(request.getContactNumber()) || isBlank(request.getUsername())) {
            response.setIsSuccess(false);
            response.setMessage("Please fill all the fields.");
            return response;
        }

        if (!USERNAME_PATTERN.matcher(request.getUsername()).matches()) {
            response.setIsSuccess(false);
            response.setMessage("Username can only contain letters, numbers, and underscores.");
            return response;
        }

        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            response.setIsSuccess(false);
            response.setMessage("Please enter a valid email address.");
            return response;
        }

        if (!CONTACT_NUMBER_PATTERN.matcher(request.getContactNumber()).matches()) {
            response.setIsSuccess(false);
            response.setMessage("Contact number must be exactly 10 digits.");
            return response;
        }

        for (Cashier existing : cashierRepository.findByUserName(request.getUsername())) {
            if (!existing.getCashierSeq().equals(cashierSeq)) {
                response.setIsSuccess(false);
                response.setMessage("Username already exists.");
                return response;
            }
        }

        for (Cashier existing : cashierRepository.findByEmail(request.getEmail())) {
            if (!existing.getCashierSeq().equals(cashierSeq)) {
                response.setIsSuccess(false);
                response.setMessage("A cashier with this email already exists.");
                return response;
            }
        }

        for (Cashier existing : cashierRepository.findByContactNumber(request.getContactNumber())) {
            if (!existing.getCashierSeq().equals(cashierSeq)) {
                response.setIsSuccess(false);
                response.setMessage("A cashier with this contact number already exists.");
                return response;
            }
        }

        cashier.setFullName(request.getFullName());
        cashier.setEmail(request.getEmail());
        cashier.setContactNumber(request.getContactNumber());
        cashier.setUserName(request.getUsername());
        cashier.setLastModifiedBy(username);
        cashier.setLastModifiedDateTime(LocalDateTime.now());

        cashierRepository.save(cashier);

        response.setIsSuccess(true);
        response.setMessage("Cashier profile updated successfully.");
        return response;
    }

    @Override
    public GeneralResponse activateCashier(Integer cashierSeq) {
        return setCashierStatus(cashierSeq, 2, "activated");
    }

    @Override
    public GeneralResponse deactivateCashier(Integer cashierSeq) {
        return setCashierStatus(cashierSeq, 0, "deactivated");
    }

    private GeneralResponse setCashierStatus(Integer cashierSeq, int status, String action) {
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Cashier cashier = cashierRepository.findByCashierSeq(cashierSeq);
        if (cashier == null) {
            response.setIsSuccess(false);
            response.setMessage("Cashier not found.");
            return response;
        }

        cashier.setStatus(status);
        cashier.setLastModifiedBy(username);
        cashier.setLastModifiedDateTime(LocalDateTime.now());
        cashierRepository.save(cashier);

        response.setIsSuccess(true);
        response.setMessage(cashier.getFullName() + " was " + action + ".");
        return response;
    }
}