package com.examflow.backend.repository;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.examflow.backend.entity.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    List<Student> findByContactNumber(String contactNumber);

    List<Student> findByEmail(String email);

    Student findByContactNumberAndStatus(String contactNumber, Integer status);

    Student findByEmailAndStatus(String email, Integer status);

    List<Student> findByStatus(Integer status);

    Student findByStudentSeq(Integer studentSeq);

    long countByStatus(Integer status);

    long countByStatusAndRegisterDateTimeGreaterThanEqual(Integer status, LocalDateTime registerDateTime);

}
