package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.ClassSession;
import com.examflow.backend.entity.Classes;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Integer> {

    List<ClassSession> findByClassesAndStatusInOrderByStartsAtAsc(Classes classes, List<Integer> statuses);

    ClassSession findBySessionSeqAndClassesAndStatusIn(Integer sessionSeq, Classes classes, List<Integer> statuses);
}
