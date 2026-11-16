package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.AdminSessionResourceResponse;
import com.examflow.backend.dto.AdminSessionResourceSaveResponse;

@Service
public interface AdminSessionResourceControllerManager {

    // The active resources of a session, oldest first; empty when the session does not exist.
    List<AdminSessionResourceResponse> getResources(Integer classSeq, Integer sessionSeq);

    // Adds a file (kind "file", with file) or a link (kind "link", with url) to a session.
    AdminSessionResourceSaveResponse addResource(Integer classSeq, Integer sessionSeq, String type, String title,
            String kind, String url, MultipartFile file);

    AdminSessionResourceSaveResponse deleteResource(Integer classSeq, Integer sessionSeq, Integer resourceSeq);
}
