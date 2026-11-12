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

    private final String UPLOAD_PROFILE_PHOTO_DIR = System.getProperty("user.home")
            + "/lms/uploads/profile_photos/";

    // What a student's profile photo may be. The page checks the same two things, but it can
    // be bypassed, so the server decides — and looks at the file's bytes, not just its name.
    public static final long PROFILE_PHOTO_MAX_BYTES = 2L * 1024 * 1024;

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

    // Returns an error message for a photo that cannot be used, or null when it is fine.
    public String validateProfilePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        if (file.getSize() > PROFILE_PHOTO_MAX_BYTES) {
            String mb = String.format("%.1f", file.getSize() / 1024.0 / 1024.0);
            return "The photo is " + mb + " MB. Please use one under 2 MB.";
        }
        if (detectImageExtension(file) == null) {
            return "Use a JPG, PNG or WebP image for the photo.";
        }
        return null;
    }

    // Saves the photo under a generated name (never the uploaded one) and returns the address
    // it is served from, e.g. "/uploads/profile_photos/1730000000000_ab12cd34.jpg".
    public String saveProfilePhoto(MultipartFile file) {
        try {

            File directory = new File(UPLOAD_PROFILE_PHOTO_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String extension = detectImageExtension(file);
            if (extension == null) {
                throw new IllegalArgumentException("Not a supported image");
            }

            String uniqueName = System.currentTimeMillis() + "_"
                    + java.util.UUID.randomUUID().toString().substring(0, 8) + "." + extension;

            file.transferTo(new File(UPLOAD_PROFILE_PHOTO_DIR + uniqueName));

            return "/uploads/profile_photos/" + uniqueName;

        } catch (Exception e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    // Deletes a stored profile photo, given the address saveProfilePhoto returned. It removes only a file
    // that sits directly in the profile photo folder; any other value is ignored. A missing file is fine,
    // and this never throws, so a failed clean-up can't undo the change that called it.
    public void deleteProfilePhoto(String storedAddress) {
        if (storedAddress == null || storedAddress.isBlank()) {
            return;
        }
        try {
            String address = storedAddress.trim().replace('\\', '/');
            String prefix = "/uploads/profile_photos/";
            if (!address.startsWith(prefix)) {
                return;
            }
            String name = address.substring(prefix.length());
            if (name.isEmpty() || name.contains("/") || name.contains("..")) {
                return;
            }

            java.nio.file.Path directory = java.nio.file.Paths.get(UPLOAD_PROFILE_PHOTO_DIR).toAbsolutePath().normalize();
            java.nio.file.Path file = directory.resolve(name).normalize();
            if (!directory.equals(file.getParent())) {
                return;
            }
            java.nio.file.Files.deleteIfExists(file);
        } catch (Exception e) {
            System.out.println("Could not delete profile photo " + storedAddress);
        }
    }

    // Reads the file's first bytes: JPEG (FF D8 FF), PNG (89 'PNG') or WebP ('RIFF'....'WEBP').
    // Returns the matching extension, or null for anything else.
    private String detectImageExtension(MultipartFile file) {
        try (java.io.InputStream in = file.getInputStream()) {
            byte[] head = in.readNBytes(12);
            if (head.length >= 3 && (head[0] & 0xFF) == 0xFF && (head[1] & 0xFF) == 0xD8
                    && (head[2] & 0xFF) == 0xFF) {
                return "jpg";
            }
            if (head.length >= 4 && (head[0] & 0xFF) == 0x89 && head[1] == 'P' && head[2] == 'N'
                    && head[3] == 'G') {
                return "png";
            }
            if (head.length >= 12 && head[0] == 'R' && head[1] == 'I' && head[2] == 'F' && head[3] == 'F'
                    && head[8] == 'W' && head[9] == 'E' && head[10] == 'B' && head[11] == 'P') {
                return "webp";
            }
            return null;
        } catch (Exception e) {
            return null;
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
