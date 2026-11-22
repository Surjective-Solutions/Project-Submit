package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.ClassRecordingRequest;
import com.examflow.backend.dto.ClassRecordingResponse;
import com.examflow.backend.dto.ClassRecordingSaveResponse;

// Class recording records: the details and the code of a recording, never the video itself.
@Service
public interface ClassRecordingControllerManager {

    // Saves a record and gives it a new code. An admin saves it for the teacher named in the request; a teacher
    // saves it for themselves.
    ClassRecordingSaveResponse saveRecording(ClassRecordingRequest recordingRequest);

    // One recording by its code (REC-1001). An admin can find any; a teacher only their own. Null when there is no
    // such recording, so a teacher cannot tell someone else's code from one that does not exist.
    ClassRecordingResponse findRecordingByCode(String code);

    // An admin gets every recording (or one teacher's when tutorId is given); a teacher gets only their own.
    List<ClassRecordingResponse> listRecordings(Integer tutorId);
}
