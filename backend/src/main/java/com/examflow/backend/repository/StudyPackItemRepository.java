package com.examflow.backend.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.StudyPack;
import com.examflow.backend.entity.StudyPackItem;

public interface StudyPackItemRepository extends JpaRepository<StudyPackItem, Integer> {

    // The sessions of one pack, in the order students watch them.
    List<StudyPackItem> findByStudyPackAndStatusOrderByDisplayOrderAsc(StudyPack studyPack, Integer status);

    // The sessions of several packs at once (so a list needs one query, not one per pack).
    List<StudyPackItem> findByStudyPackInAndStatusOrderByDisplayOrderAsc(Collection<StudyPack> studyPacks,
            Integer status);
}
