package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.examflow.backend.entity.Classes;

import com.examflow.backend.entity.ClassPaymentRecord;
import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.StudentClassPaymentRecord;

public interface StudentClassPaymentRecordsRepository extends JpaRepository<StudentClassPaymentRecord, Integer> {

    List<StudentClassPaymentRecord> findByStudentAndClassPaymentRecordAndStatus(Student student,
            ClassPaymentRecord classPaymentRecord, Integer status);

    List<StudentClassPaymentRecord> findByStudentAndClassPaymentRecord(Student student,
            ClassPaymentRecord classPaymentRecord);

    StudentClassPaymentRecord findByStudentAndStatusAndClassPaymentRecord(Student student, Integer status,
                    ClassPaymentRecord classPaymentRecord);

    List<StudentClassPaymentRecord> findByStatusNotAndIsForPayments(Integer statusSeq, Boolean isForPayments);

    StudentClassPaymentRecord findByStudentClassPaymentRecordSeq(Integer studentClassPaymentRecordSeq);

    StudentClassPaymentRecord findTopByStudentAndClassPaymentRecordAndStatusOrderByApprovedTimeDesc(
            Student student, ClassPaymentRecord classPaymentRecord, Integer status);

    // Students of a class whose payment for the given month was paid and approved.
    @Query("SELECT COUNT(DISTINCT r.student) FROM StudentClassPaymentRecord r " +
           "WHERE r.classPaymentRecord.classes = :classes AND r.classPaymentRecord.month = :month " +
           "AND r.classPaymentRecord.year = :year AND r.isPayed = true AND r.isApproved = true")
    Integer countPaidStudentsForMonth(@Param("classes") Classes classes, @Param("month") Integer month,
            @Param("year") Integer year);

    long countByStatusAndIsForPaymentsAndIsApprovedIsNull(Integer status, Boolean isForPayments);

    StudentClassPaymentRecord findTopByStatusAndIsForPaymentsAndIsApprovedIsNullOrderByPayedTimeAsc(Integer status,
            Boolean isForPayments);

    List<StudentClassPaymentRecord> findByStatusAndIsForPaymentsAndIsApprovedIsNullOrderByPayedTimeAsc(Integer status,
            Boolean isForPayments, Pageable pageable);

}
