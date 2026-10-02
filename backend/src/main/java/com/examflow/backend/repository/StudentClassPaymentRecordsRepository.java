package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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

    long countByStatusAndIsForPaymentsAndIsApprovedIsNull(Integer status, Boolean isForPayments);

    StudentClassPaymentRecord findTopByStatusAndIsForPaymentsAndIsApprovedIsNullOrderByPayedTimeAsc(Integer status,
            Boolean isForPayments);

    List<StudentClassPaymentRecord> findByStatusAndIsForPaymentsAndIsApprovedIsNullOrderByPayedTimeAsc(Integer status,
            Boolean isForPayments, Pageable pageable);

}
