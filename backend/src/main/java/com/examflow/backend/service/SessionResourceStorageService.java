package com.examflow.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.enums.ResourceType;

// Keeps session resource files, apart from every other upload. Layout under the default upload folder
// (~/lms/uploads/):
//
//   session_resources/<type folder>/class_<classSeq>/session_<sessionSeq>/<generated name>.<ext>
//
// e.g. session_resources/papers/class_3/session_9/1730000000000_ab12cd34.pdf. Files are saved under a
// generated name (never the uploaded one) and are served by the existing /uploads/** handler.
@Service
public class SessionResourceStorageService {

    private static final String ROOT_ADDRESS = "/uploads/session_resources/";

    private static final Path ROOT = Paths.get(System.getProperty("user.home"), "lms", "uploads", "session_resources");

    public static final long FILE_MAX_BYTES = 25L * 1024 * 1024;

    public static final long VIDEO_MAX_BYTES = 200L * 1024 * 1024;

    private static final List<String> VIDEO_EXTENSIONS = List.of("mp4", "webm", "mov");

    private static final List<String> FILE_EXTENSIONS = List.of("pdf", "doc", "docx", "ppt", "pptx", "png", "jpg",
            "jpeg", "mp4", "webm", "mov");

    // Returns an error message for a file that cannot be used, or null when it is fine.
    public String validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "Choose a file to upload.";
        }
        String extension = extensionOf(file.getOriginalFilename());
        if (!FILE_EXTENSIONS.contains(extension)) {
            return "That file type is not allowed. Use PDF, Word, PowerPoint, PNG, JPG, MP4, WebM or MOV.";
        }
        boolean video = VIDEO_EXTENSIONS.contains(extension);
        long max = video ? VIDEO_MAX_BYTES : FILE_MAX_BYTES;
        if (file.getSize() > max) {
            return "The file is too large. The limit is " + (max / 1024 / 1024) + " MB"
                    + (video ? " for a video." : ".");
        }
        return null;
    }

    // Saves the file in its own type, class and session folders and returns the address it is served from.
    public String save(MultipartFile file, ResourceType type, Integer classSeq, Integer sessionSeq) {
        try {
            Path directory = ROOT.resolve(type.getFolder()).resolve("class_" + classSeq)
                    .resolve("session_" + sessionSeq);
            Files.createDirectories(directory);

            String name = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "."
                    + extensionOf(file.getOriginalFilename());
            file.transferTo(directory.resolve(name));

            return ROOT_ADDRESS + type.getFolder() + "/class_" + classSeq + "/session_" + sessionSeq + "/" + name;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store the resource file", e);
        }
    }

    private String extensionOf(String fileName) {
        if (fileName == null) {
            return "";
        }
        int dot = fileName.lastIndexOf('.');
        return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
