package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.Cashier;

public interface CashierRepository extends JpaRepository<Cashier, Integer> {

    Cashier findByUserNameAndStatus(String userName, Integer statusSeq);

    List<Cashier> findByUserName(String userName);

    List<Cashier> findByStatus(Integer statusSeq);

    Cashier findByCashierSeq(Integer cashierSeq);
}
