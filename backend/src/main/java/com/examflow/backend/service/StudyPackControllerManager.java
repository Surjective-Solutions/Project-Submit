package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.StudyPackClassResponse;
import com.examflow.backend.dto.StudyPackRequest;
import com.examflow.backend.dto.StudyPackResponse;
import com.examflow.backend.dto.StudyPackSaveResponse;

@Service
public interface StudyPackControllerManager {

    // An admin creates a pack. "Save & publish" puts it on sale (PUBLISHED); anything else saves a DRAFT.
    StudyPackSaveResponse createStudyPack(StudyPackRequest studyPackRequest, MultipartFile cover);

    // A teacher saves a pack of their own. The teacher comes from the token, the pack is always a draft with the
    // institute's standard revenue split, and only the teacher's own recordings and classes are accepted.
    StudyPackSaveResponse createMyStudyPack(StudyPackRequest studyPackRequest, MultipartFile cover);

    // An admin changes any pack (its sessions are replaced by the ones sent).
    StudyPackSaveResponse updateStudyPack(Integer id, StudyPackRequest studyPackRequest, MultipartFile cover);

    // A teacher changes one of their own packs. Its status and revenue split stay as they are; someone else's pack
    // answers "no longer exists".
    StudyPackSaveResponse updateMyStudyPack(Integer id, StudyPackRequest studyPackRequest, MultipartFile cover);

    // Every pack (draft, published or expired) with its sessions for an admin; a teacher gets only their own.
    List<StudyPackResponse> getStudyPacks();

    // The active classes of a teacher, for the Class dropdown. An admin names the teacher; a teacher always gets their
    // own classes, whatever the request says.
    List<StudyPackClassResponse> getTutorClasses(Integer tutorId);
}
