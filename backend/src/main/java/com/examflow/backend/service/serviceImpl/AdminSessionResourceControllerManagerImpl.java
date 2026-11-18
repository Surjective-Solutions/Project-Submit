package com.examflow.backend.service.serviceImpl;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.AdminSessionResourceResponse;
import com.examflow.backend.dto.AdminSessionResourceSaveResponse;
import com.examflow.backend.entity.ClassSession;
import com.examflow.backend.entity.ClassSessionResource;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.enums.ResourceKind;
import com.examflow.backend.enums.ResourceType;
import com.examflow.backend.repository.ClassSessionRepository;
import com.examflow.backend.repository.ClassSessionResourceRepository;
import com.examflow.backend.repository.ClassesRepository;
import com.examflow.backend.service.AdminSessionResourceControllerManager;
import com.examflow.backend.service.SessionResourceStorageService;

@Service
public class AdminSessionResourceControllerManagerImpl implements AdminSessionResourceControllerManager {

    // Class status: 2 = active.
    private static final Integer ACTIVE = 2;

    // Session status: 2 = approved, 1 = open (both are live), 0 = deleted.
    private static final List<Integer> LIVE_SESSION_STATUSES = List.of(2, 1);

    // Resource status: 2 = active, 0 = deleted.
    private static final Integer RESOURCE_ACTIVE = 2;

    private static final Integer RESOURCE_DELETED = 0;

    private static final int TITLE_MAX = 90;

    private final ClassesRepository classesRepository;

    private final ClassSessionRepository classSessionRepository;

    private final ClassSessionResourceRepository classSessionResourceRepository;

    private final SessionResourceStorageService sessionResourceStorageService;

    @Autowired
    public AdminSessionResourceControllerManagerImpl(ClassesRepository classesRepository,
            ClassSessionRepository classSessionRepository,
            ClassSessionResourceRepository classSessionResourceRepository,
            SessionResourceStorageService sessionResourceStorageService) {
        this.classesRepository = classesRepository;
        this.classSessionRepository = classSessionRepository;
        this.classSessionResourceRepository = classSessionResourceRepository;
        this.sessionResourceStorageService = sessionResourceStorageService;
    }

    @Override
    public List<AdminSessionResourceResponse> getResources(Integer classSeq, Integer sessionSeq) {
        List<AdminSessionResourceResponse> result = new ArrayList<>();
        ClassSession session = findSession(classSeq, sessionSeq);
        if (session == null) {
            return result;
        }
        for (ClassSessionResource resource : classSessionResourceRepository
                .findBySessionAndStatusOrderByCreatedDateTimeAsc(session, RESOURCE_ACTIVE)) {
            result.add(toResponse(resource));
        }
        return result;
    }

    @Override
    public AdminSessionResourceSaveResponse addResource(Integer classSeq, Integer sessionSeq, String type,
            String title, String kind, String url, MultipartFile file) {
        ClassSession session = findSession(classSeq, sessionSeq);
        if (session == null) {
            return failure("Session not found.");
        }
        ResourceType resourceType = ResourceType.fromValue(type);
        if (resourceType == null) {
            return failure("Choose what kind of resource this is.");
        }
        ResourceKind resourceKind = ResourceKind.fromValue(kind);
        if (resourceKind == null) {
            return failure("Choose whether to upload a file or add a link.");
        }
        String cleanTitle = title == null ? "" : title.trim();
        if (cleanTitle.isEmpty() || cleanTitle.length() > TITLE_MAX) {
            return failure("Give the resource a title of up to " + TITLE_MAX + " characters.");
        }

        ClassSessionResource resource = new ClassSessionResource();
        resource.setSession(session);
        resource.setType(resourceType);
        resource.setKind(resourceKind);
        resource.setTitle(cleanTitle);

        if (resourceKind == ResourceKind.FILE) {
            String problem = sessionResourceStorageService.validate(file);
            if (problem != null) {
                return failure(problem);
            }
            resource.setFileName(file.getOriginalFilename());
            resource.setFileSize(file.getSize());
            resource.setUrl(sessionResourceStorageService.save(file, resourceType, classSeq, sessionSeq));
        } else {
            String link = url == null ? "" : url.trim();
            if (!isWebUrl(link)) {
                return failure("Enter a full link starting with https://.");
            }
            resource.setUrl(link);
        }

        resource.setStatus(RESOURCE_ACTIVE);
        resource.setCreatedDateTime(LocalDateTime.now());
        resource.setCreatedBy(currentUser());

        AdminSessionResourceSaveResponse response = new AdminSessionResourceSaveResponse();
        response.setIsSuccess(true);
        response.setMessage("Resource added.");
        response.setResource(toResponse(classSessionResourceRepository.save(resource)));
        return response;
    }

    @Override
    public AdminSessionResourceSaveResponse deleteResource(Integer classSeq, Integer sessionSeq,
            Integer resourceSeq) {
        ClassSession session = findSession(classSeq, sessionSeq);
        ClassSessionResource resource = session == null ? null
                : classSessionResourceRepository.findByResourceSeqAndSessionAndStatus(resourceSeq, session,
                        RESOURCE_ACTIVE);
        if (resource == null) {
            return failure("Resource not found.");
        }
        // Soft delete: the row and the stored file stay.
        resource.setStatus(RESOURCE_DELETED);
        resource.setLastModifiedDateTime(LocalDateTime.now());
        resource.setLastModifiedBy(currentUser());
        classSessionResourceRepository.save(resource);

        AdminSessionResourceSaveResponse response = new AdminSessionResourceSaveResponse();
        response.setIsSuccess(true);
        response.setMessage("Resource deleted.");
        return response;
    }

    private ClassSession findSession(Integer classSeq, Integer sessionSeq) {
        Classes cls = classesRepository.findByClassSeqAndStatus(classSeq, ACTIVE);
        if (cls == null) {
            return null;
        }
        return classSessionRepository.findBySessionSeqAndClassesAndStatusIn(sessionSeq, cls, LIVE_SESSION_STATUSES);
    }

    private boolean isWebUrl(String value) {
        try {
            URI uri = URI.create(value);
            return ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
                    && uri.getHost() != null;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private AdminSessionResourceResponse toResponse(ClassSessionResource resource) {
        AdminSessionResourceResponse response = new AdminSessionResourceResponse();
        response.setId(String.valueOf(resource.getResourceSeq()));
        response.setType(resource.getType() == null ? null : resource.getType().getValue());
        response.setKind(resource.getKind() == null ? null : resource.getKind().getValue());
        response.setTitle(resource.getTitle());
        response.setFileName(resource.getFileName());
        response.setSize(resource.getFileSize());
        response.setUrl(resource.getUrl());
        return response;
    }

    private AdminSessionResourceSaveResponse failure(String message) {
        AdminSessionResourceSaveResponse response = new AdminSessionResourceSaveResponse();
        response.setIsSuccess(false);
        response.setMessage(message);
        return response;
    }

    private String currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? null : auth.getName();
    }
}
