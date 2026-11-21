package com.examflow.backend.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.ClassSession;
import com.examflow.backend.entity.Classes;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Integer> {

    List<ClassSession> findByClassesAndStatusInOrderByStartsAtAsc(Classes classes, List<Integer> statuses);

    ClassSession findBySessionSeqAndClassesAndStatusIn(Integer sessionSeq, Classes classes, List<Integer> statuses);

    // The sessions of several classes, oldest first (the attendance page uses the latest one to show a class's usual
    // weekday and time).
    List<ClassSession> findByClassesInAndStatusInOrderByStartsAtAsc(Collection<Classes> classes, List<Integer> statuses);

    // The sessions of several classes that start between two moments (from inclusive, to exclusive), oldest first.
    List<ClassSession> findByClassesInAndStatusInAndStartsAtGreaterThanEqualAndStartsAtLessThanOrderByStartsAtAsc(
            Collection<Classes> classes, List<Integer> statuses, LocalDateTime from, LocalDateTime to);
}
