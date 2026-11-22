package com.examflow.backend.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.StudyPack;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.enums.StudyPackStatus;

public interface StudyPackRepository extends JpaRepository<StudyPack, Integer> {

    // Every pack in these statuses, the most recently changed first.
    List<StudyPack> findByStatusInOrderByLastModifiedDateTimeDesc(Collection<StudyPackStatus> statuses);

    // The same, for one teacher's packs.
    List<StudyPack> findByTutorAndStatusInOrderByLastModifiedDateTimeDesc(Tutor tutor,
            Collection<StudyPackStatus> statuses);
}
