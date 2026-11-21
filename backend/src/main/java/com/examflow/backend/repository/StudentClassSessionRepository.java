package com.examflow.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.StudentClassSession;

public interface StudentClassSessionRepository extends JpaRepository<StudentClassSession, Integer> {
}
