package com.examflow.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.AdminUser;

public interface AdminUserRepository extends JpaRepository<AdminUser, Integer> {

    AdminUser findByUserNameAndStatus(String username, Integer statusseq);
}
