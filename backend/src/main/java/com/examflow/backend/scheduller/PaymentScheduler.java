package com.examflow.backend.scheduller;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.examflow.backend.service.serviceImpl.MonthlyPaymentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentScheduler {

    private final MonthlyPaymentService monthlyPaymentService;

    // @Scheduled(cron = "0 19 22 * * *")
    @Scheduled(cron = "0 */5 * * * *") // every 5 minutes (:00, :05, :10, ...)
    public void generateMonthlyPayments() {

        System.out.println("Running scheduler : " + LocalDateTime.now());

        monthlyPaymentService.generateClassPaymentRecord();

    }

    // @Scheduled(cron = "0 20 22 * * *")
    @Scheduled(cron = "0 1/5 * * * *") // every 5 minutes, 1 min after the class job (:01, :06, :11, ...)
    public void generateMonthlyPaymentsForStudentPaymentRecords() {

        System.out.println("Running scheduler : " + LocalDateTime.now());

        monthlyPaymentService.generateStudentClassPaymentRecord();

    }

}