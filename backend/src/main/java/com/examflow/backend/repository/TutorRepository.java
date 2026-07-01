package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.Tutor;

public interface TutorRepository extends JpaRepository<Tutor, Integer> {

    // List<Tutor> findByUserNameAndStatus(String userName, Integer status);

    Tutor findByUserNameAndStatus(String userName, Integer status);

    List<Tutor> findByUserName(String userName);

    List<Tutor> findByStatus(Integer status);

    Tutor findByTutorSeq(Integer tutorSeq);

}
