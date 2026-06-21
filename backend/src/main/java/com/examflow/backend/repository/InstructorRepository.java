package com.examflow.backend.repository;

import java.util.List;

import com.examflow.backend.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstructorRepository extends JpaRepository<Instructor, Integer> {

    List<Instructor> findByContactNumber(String contactNumber);

    Instructor findByContactNumberAndStatus(String contactNumber, Integer status);

    Instructor findByEmailAndStatus(String contactNumber, Integer status);

    List<Instructor> findByEmail(String email);

    Instructor findByInstructorSeq(Integer instructorSeq);
}
