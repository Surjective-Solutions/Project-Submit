package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.StudentClass;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.Tutor;

@Service
public interface StudentClassesRepository extends JpaRepository<StudentClass, Integer> {

    List<StudentClass> findByStudentAndStatusSeq(Student student, Integer statusSeq);

    StudentClass findByStudentAndClassesAndStatusSeq(Student student, Classes classes, Integer statusSeq);

    // Counts each student once, even if they're enrolled in several of this tutor's
    // classes - COUNT(DISTINCT sc.student) dedups by student, unlike counting
    // StudentClass rows which would count a multi-class student more than once.
    @Query("SELECT COUNT(DISTINCT sc.student) FROM StudentClass sc " +
           "WHERE sc.classes.tutor = :tutor " +
           "AND sc.statusSeq = :enrollmentStatus " +
           "AND sc.classes.status = :classStatus")
    Integer countDistinctEnrolledStudentsByTutor(@Param("tutor") Tutor tutor,
            @Param("enrollmentStatus") Integer enrollmentStatus,
            @Param("classStatus") Integer classStatus);

}