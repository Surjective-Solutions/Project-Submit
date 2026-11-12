package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.AdminUser;

public interface AdminUserRepository extends JpaRepository<AdminUser, Integer> {

    AdminUser findByUserNameAndStatus(String username, Integer statusseq);

    // used to keep two admins from sharing an email address
    List<AdminUser> findByEmailIgnoreCase(String email);
}
