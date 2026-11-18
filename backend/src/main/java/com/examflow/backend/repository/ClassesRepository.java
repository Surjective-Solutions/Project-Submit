package com.examflow.backend.repository;

import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.Tutor;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClassesRepository extends JpaRepository<Classes, Integer> {


    List<Classes> findByStatusAndTutor(Integer status, Tutor tutor);

    List<Classes> findByStatus(Integer status);

    Classes findByClassSeqAndStatus(Integer classSeq, Integer status);

    List<Classes> findByTutor (Tutor tutor);

    // [tutorSeq, count] for every tutor that has classes with this status.
    @Query("SELECT c.tutor.tutorSeq, COUNT(c) FROM Classes c WHERE c.status = :status GROUP BY c.tutor.tutorSeq")
    List<Object[]> countClassesGroupedByTutor(@Param("status") Integer status);
}
