package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.ClassRecording;
import com.examflow.backend.entity.Tutor;

public interface ClassRecordingRepository extends JpaRepository<ClassRecording, Integer> {

    List<ClassRecording> findByTutorAndStatusOrderByCreatedDateTimeDesc(Tutor tutor, Integer status);

    List<ClassRecording> findByStatusOrderByCreatedDateTimeDesc(Integer status);

    ClassRecording findByRecordingCodeIgnoreCaseAndStatus(String recordingCode, Integer status);
}
