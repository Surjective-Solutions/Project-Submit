package com.examflow.backend.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.examflow.backend.entity.StudentClass;
import com.examflow.backend.entity.StudentClassSessionAttendance;

public interface StudentClassSessionAttendanceRepository extends JpaRepository<StudentClassSessionAttendance, Integer> {

    // The active attendance records of these enrolments for these sessions, with the student's place in the session
    // and the session loaded in the same query. The caller must not pass an empty list.
    @Query("SELECT a FROM StudentClassSessionAttendance a JOIN FETCH a.studentClassSession scs JOIN FETCH scs.classSession cs " +
           "WHERE scs.studentClass IN :enrolments AND cs.sessionSeq IN :sessionSeqs " +
           "AND a.status = :attendanceStatus AND scs.status = :placeStatus")
    List<StudentClassSessionAttendance> findActiveByEnrolmentsAndSessions(
            @Param("enrolments") Collection<StudentClass> enrolments,
            @Param("sessionSeqs") Collection<Integer> sessionSeqs,
            @Param("attendanceStatus") Integer attendanceStatus,
            @Param("placeStatus") Integer placeStatus);
}
