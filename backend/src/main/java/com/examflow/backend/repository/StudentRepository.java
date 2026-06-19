package com.examflow.backend.repository;

import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.examflow.backend.entity.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    List<Student> findByContactNumber(String contactNumber);

    List<Student> findByEmail(String email);
}
