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

    @Query("SELECT COUNT(DISTINCT sc.student) FROM StudentClass sc WHERE sc.classes = :classes AND sc.statusSeq = :enrollmentStatus")
    Integer countEnrolledStudentsInClass(@Param("classes") Classes classes,
            @Param("enrollmentStatus") Integer enrollmentStatus);

    // [classSeq, enrolled students] for every class of one tutor.
    @Query("SELECT sc.classes.classSeq, COUNT(DISTINCT sc.student) FROM StudentClass sc " +
           "WHERE sc.classes.tutor = :tutor AND sc.statusSeq = :enrollmentStatus " +
           "GROUP BY sc.classes.classSeq")
    List<Object[]> countEnrolledStudentsGroupedByClass(@Param("tutor") Tutor tutor,
            @Param("enrollmentStatus") Integer enrollmentStatus);

    // [tutorSeq, distinct enrolled students] for every tutor, same rules as the single-tutor count above.
    @Query("SELECT sc.classes.tutor.tutorSeq, COUNT(DISTINCT sc.student) FROM StudentClass sc " +
           "WHERE sc.statusSeq = :enrollmentStatus AND sc.classes.status = :classStatus " +
           "GROUP BY sc.classes.tutor.tutorSeq")
    List<Object[]> countDistinctEnrolledStudentsGroupedByTutor(@Param("enrollmentStatus") Integer enrollmentStatus,
            @Param("classStatus") Integer classStatus);

    // Every live enrolment in an active class of this tutor, with the student and the class loaded in the same
    // query. Deleted students are left out. Used by the teacher's Students page.
    @Query("SELECT sc FROM StudentClass sc JOIN FETCH sc.student s JOIN FETCH sc.classes c " +
           "WHERE c.tutor = :tutor AND sc.statusSeq = :enrollmentStatus AND c.status = :classStatus " +
           "AND s.status <> :deletedStudentStatus " +
           "ORDER BY s.firstName, s.lastName, c.displayName")
    List<StudentClass> findEnrolmentsOfTutorsStudents(@Param("tutor") Tutor tutor,
            @Param("enrollmentStatus") Integer enrollmentStatus,
            @Param("classStatus") Integer classStatus,
            @Param("deletedStudentStatus") Integer deletedStudentStatus);

}