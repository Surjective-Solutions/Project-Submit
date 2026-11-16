package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.examflow.backend.entity.ClassSession;
import com.examflow.backend.entity.ClassSessionResource;

public interface ClassSessionResourceRepository extends JpaRepository<ClassSessionResource, Integer> {

    List<ClassSessionResource> findBySessionAndStatusOrderByCreatedDateTimeAsc(ClassSession session, Integer status);

    ClassSessionResource findByResourceSeqAndSessionAndStatus(Integer resourceSeq, ClassSession session,
            Integer status);

    Integer countBySessionAndStatus(ClassSession session, Integer status);

    // [sessionSeq, count] for the given sessions, so a session list needs one query, not one per session.
    @Query("SELECT r.session.sessionSeq, COUNT(r) FROM ClassSessionResource r "
            + "WHERE r.session IN :sessions AND r.status = :status GROUP BY r.session.sessionSeq")
    List<Object[]> countBySessions(@Param("sessions") List<ClassSession> sessions, @Param("status") Integer status);
}
