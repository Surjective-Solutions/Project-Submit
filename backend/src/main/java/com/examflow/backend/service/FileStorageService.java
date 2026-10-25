package com.examflow.backend.service;

import java.io.File;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final String UPLOAD_DIR = System.getProperty("user.home")
            + "/lms/uploads/papers/";

    private final String UPLOAD_DIR_ANSWER_SHEET = System.getProperty("user.home")
            + "/lms/uploads/answer_sheets/";

    private final String UPLOAD_PAYEMNT_RECEIPT_DIR = System.getProperty("user.home")
            + "/lms/uploads/payment_recipts/";

    private final String UPLOAD_STUDY_PACK_COVER_DIR = System.getProperty("user.home")
            + "/lms/uploads/study_pack_covers/";

    // What a study pack cover may be. The page checks the same two things, but it can be
    // bypassed, so the server decides.
    public static final long COVER_MAX_BYTES = 2L * 1024 * 1024;

    private static final java.util.List<String> COVER_CONTENT_TYPES = java.util.List.of(
            "image/jpeg", "image/png", "image/webp");

    public String savePaperFile(MultipartFile file) {
        try {

            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String uniqueName = System.currentTimeMillis() + "_" + originalName;

            String filePath = UPLOAD_DIR + uniqueName;

            file.transferTo(new File(filePath));

            return uniqueName;

        } catch (Exception e) {
            throw new RuntimeException("Failed to store file", e);
        }

    }

    public String saveAnswerSheet(MultipartFile file) {
        try {

            File directory = new File(UPLOAD_DIR_ANSWER_SHEET);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String uniqueName = System.currentTimeMillis() + "_" + originalName;

            String filePath = UPLOAD_DIR_ANSWER_SHEET + uniqueName;
            String fileUrl = "/uploads/answer_sheets/" + uniqueName;

            file.transferTo(new File(filePath));

            return fileUrl;

        } catch (Exception e) {
            throw new RuntimeException("Failed to store file", e);
        }

    }

    // Returns an error message for a cover that cannot be used, or null when it is fine.
    public String validateStudyPackCover(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        if (!COVER_CONTENT_TYPES.contains(file.getContentType())) {
            return "Use a JPG, PNG or WebP image for the cover.";
        }
        if (file.getSize() > COVER_MAX_BYTES) {
            String mb = String.format("%.1f", file.getSize() / 1024.0 / 1024.0);
            return "The cover is " + mb + " MB. Please compress it to under 2 MB.";
        }
        return null;
    }

    public String saveStudyPackCover(MultipartFile file) {
        try {

            File directory = new File(UPLOAD_STUDY_PACK_COVER_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String uniqueName = System.currentTimeMillis() + "_" + originalName;

            String filePath = UPLOAD_STUDY_PACK_COVER_DIR + uniqueName;

            file.transferTo(new File(filePath));

            return uniqueName;

        } catch (Exception e) {
            throw new RuntimeException("Failed to store file", e);
        }

    }

    public String savePaymentReceipt(MultipartFile file) {
        try {

            File directory = new File(UPLOAD_PAYEMNT_RECEIPT_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String uniqueName = System.currentTimeMillis() + "_" + originalName;

            String filePath = UPLOAD_PAYEMNT_RECEIPT_DIR + uniqueName;

            file.transferTo(new File(filePath));

            return uniqueName;

        } catch (Exception e) {
            throw new RuntimeException("Failed to store file", e);
        }

    }
}
