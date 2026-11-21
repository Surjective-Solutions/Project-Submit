package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.TeacherProfileUpdateRequest;
import com.examflow.backend.dto.TeacherProfileUpdateResponse;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.FileStorageService;
import com.examflow.backend.service.TeacherAccountControllerManager;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class TeacherAccountControllerManagerImpl implements TeacherAccountControllerManager {

    private static final String TUTOR_ROLE = "tutor";

    private static final int NAME_MAX = 40;
    private static final int EMAIL_MAX = 120;
    private static final int BIO_MAX = 500;
    private static final int MEDIUM_MAX = 30;
    private static final int MEDIUMS_MAX = 5;

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    // At least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.
    private static final Pattern STRONG_PASSWORD = Pattern
            .compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$");

    private final HttpServletRequest request;

    private final TutorRepository tutorRepository;

    private final PasswordEncoder passwordEncoder;

    private final FileStorageService fileStorageService;

    @Autowired
    public TeacherAccountControllerManagerImpl(HttpServletRequest request, TutorRepository tutorRepository,
            PasswordEncoder passwordEncoder, FileStorageService fileStorageService) {
        this.request = request;
        this.tutorRepository = tutorRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional
    public TeacherProfileUpdateResponse updateMyProfile(TeacherProfileUpdateRequest update, MultipartFile photo) {

        if (!TUTOR_ROLE.equals(request.getAttribute("role"))) {
            return failed("Only a teacher can edit this profile.", null);
        }
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorSeq == null ? null : tutorRepository.findByTutorSeq(tutorSeq);
        if (tutor == null) {
            return failed("Your account could not be found.", null);
        }

        // Repeats every rule the page checks, because the page can be bypassed. Nothing is saved unless all pass.
        String firstName = collapseSpaces(update.getFirstName());
        String lastName = collapseSpaces(update.getLastName());
        if (firstName.isEmpty()) {
            return failed("Enter your first name.", "first_name");
        }
        if (lastName.isEmpty()) {
            return failed("Enter your last name.", "last_name");
        }
        if (firstName.length() > NAME_MAX || lastName.length() > NAME_MAX) {
            return failed("Names can be up to " + NAME_MAX + " characters.",
                    firstName.length() > NAME_MAX ? "first_name" : "last_name");
        }

        // The email is optional; a blank one clears it.
        String email = update.getEmail() == null ? "" : update.getEmail().trim();
        if (!email.isEmpty() && (email.length() > EMAIL_MAX || !EMAIL.matcher(email).matches())) {
            return failed("Enter a valid email address, e.g. name@example.com.", "email");
        }

        String bio = update.getBio() == null ? "" : update.getBio().trim();
        if (bio.length() > BIO_MAX) {
            return failed("The bio can be up to " + BIO_MAX + " characters.", "bio");
        }

        Set<String> mediums = new LinkedHashSet<>();
        if (update.getMediums() != null) {
            for (String medium : update.getMediums().split(",")) {
                String cleaned = collapseSpaces(medium);
                if (!cleaned.isEmpty()) {
                    mediums.add(cleaned);
                }
            }
        }
        if (mediums.size() > MEDIUMS_MAX || mediums.stream().anyMatch(m -> m.length() > MEDIUM_MAX)) {
            return failed("Choose up to " + MEDIUMS_MAX + " mediums.", "mediums");
        }

        String photoProblem = fileStorageService.validateProfilePhoto(photo);
        if (photoProblem != null) {
            return failed(photoProblem, "photo");
        }

        // The password changes only when a new one is sent, and only for someone who knows the current one.
        String newPassword = update.getNewPassword();
        boolean changePassword = newPassword != null && !newPassword.isEmpty();
        if (changePassword) {
            if (update.getCurrentPassword() == null || update.getCurrentPassword().isEmpty()) {
                return failed("Enter your current password to set a new one.", "currentPassword");
            }
            if (!passwordEncoder.matches(update.getCurrentPassword(), tutor.getPassword())) {
                return failed("Your current password is incorrect.", "currentPassword");
            }
            if (!STRONG_PASSWORD.matcher(newPassword).matches()) {
                return failed("The new password needs 8 or more characters with an uppercase letter, a lowercase "
                        + "letter, a number and a special character.", "newPassword");
            }
        }

        tutor.setName(firstName + " " + lastName);
        tutor.setEmail(email.isEmpty() ? null : email);
        tutor.setBio(bio.isEmpty() ? null : bio);
        tutor.setMedium(mediums.isEmpty() ? null : String.join(", ", mediums));

        if (changePassword) {
            String encoded = passwordEncoder.encode(newPassword);
            tutor.setPassword(encoded);
            tutor.setConfirmPassword(encoded);
            tutor.setFinalPassword(encoded);
        }

        // A replaced or removed photo is deleted from the disk once the new details are saved.
        String oldPhoto = tutor.getProfilePhoto();
        if (photo != null && !photo.isEmpty()) {
            tutor.setProfilePhoto(fileStorageService.saveProfilePhoto(photo));
        } else if (Boolean.TRUE.equals(update.getRemovePhoto())) {
            tutor.setProfilePhoto(null);
        }

        tutor.setLastModifiedBy(tutor.getUserName());
        tutor.setLastModifiedDateTime(LocalDateTime.now());
        tutorRepository.save(tutor);

        if (oldPhoto != null && !oldPhoto.isBlank() && !oldPhoto.equals(tutor.getProfilePhoto())) {
            fileStorageService.deleteProfilePhoto(oldPhoto);
        }

        TeacherProfileUpdateResponse response = new TeacherProfileUpdateResponse();
        response.setIsSuccess(true);
        response.setMessage("Profile updated");
        return response;
    }

    private TeacherProfileUpdateResponse failed(String message, String field) {
        TeacherProfileUpdateResponse response = new TeacherProfileUpdateResponse();
        response.setIsSuccess(false);
        response.setMessage(message);
        response.setField(field);
        return response;
    }

    // Trims and turns any run of spaces into one.
    private String collapseSpaces(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }
}
