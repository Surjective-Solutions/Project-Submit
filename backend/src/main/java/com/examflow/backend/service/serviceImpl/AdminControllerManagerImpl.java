package com.examflow.backend.service.serviceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.config.NoConfig;
import com.examflow.backend.dto.AdminStudentRegistrationRequest;
import com.examflow.backend.dto.AdminStudentRegistrationResponse;
import com.examflow.backend.dto.RegisteredTodayResponse;
import com.examflow.backend.dto.StudentDuplicateCheckResponse;
import com.examflow.backend.entity.Student;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.service.AdminControllerManager;
import com.examflow.backend.service.FileStorageService;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class AdminControllerManagerImpl implements AdminControllerManager {

    // Students with this status can log in; it is also what a signed-up student gets.
    private static final Integer ACTIVE_STUDENT_STATUS = 2;

    // The academy runs on Sri Lanka time, so "today" and a student's age are measured there.
    private static final ZoneId ACADEMY_ZONE = ZoneId.of("Asia/Colombo");

    // Same limits as the registration page (student-registration/constants.js).
    private static final int AGE_MIN = 10;
    private static final int AGE_MAX = 30;
    private static final int ADDRESS_MIN = 8;

    private static final List<String> GENDERS = List.of("Female", "Male");
    private static final List<String> GRADES = List.of("10", "11", "12", "13");
    private static final List<String> STREAMS = List.of("Physical Science", "Biological Science", "Commerce",
            "Technology", "Arts");
    private static final List<String> MEDIUMS = List.of("Sinhala", "English", "Tamil");
    private static final List<String> DISTRICTS = List.of("Ampara", "Anuradhapura", "Badulla", "Batticaloa",
            "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi",
            "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
            "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya");

    private static final Pattern PHONE = Pattern.compile("^7\\d{8}$");
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern POSTAL_CODE = Pattern.compile("^\\d{5}$");
    private static final Pattern NIC = Pattern.compile("^(\\d{9}[VX]|\\d{12})$");

    // Password rules, the same eight as the page (student-registration/password.js).
    private static final List<String> COMMON_PASSWORDS = List.of("password", "12345678", "123456789", "qwerty",
            "abc123", "syzygy", "11111111", "letmein");
    private static final int PASSWORD_MIN_LENGTH = 8;
    private static final int MIN_NAME_LETTERS = 3;
    private static final int PHONE_TAIL_DIGITS = 6;

    private static final String STUDENT_NUMBER_CONFIG = "student";

    private final HttpServletRequest request;
    private final StudentRepository studentRepository;
    private final FileStorageService fileStorageService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final NoConfig noConfig;

    @Autowired
    public AdminControllerManagerImpl(HttpServletRequest request,
            StudentRepository studentRepository,
            FileStorageService fileStorageService,
            BCryptPasswordEncoder passwordEncoder,
            NoConfig noConfig) {
        this.request = request;
        this.studentRepository = studentRepository;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
        this.noConfig = noConfig;
    }

    // Student registration ----------------------------------------------

    @Override
    public StudentDuplicateCheckResponse checkStudentDuplicate(String contactNumber) {

        StudentDuplicateCheckResponse response = new StudentDuplicateCheckResponse();
        response.setDuplicate(false);

        if (!isAdmin()) {
            response.setIsSuccess(false);
            response.setMessage("Only an admin can check student registrations.");
            return response;
        }

        String phone = normalizePhone(contactNumber);
        if (!PHONE.matcher(phone).matches()) {
            response.setIsSuccess(false);
            response.setMessage("Enter a valid 9-digit mobile number, e.g. 77 123 4567.");
            return response;
        }

        response.setIsSuccess(true);
        List<Student> existing = studentRepository.findByContactNumber(toLocalNumber(phone));
        if (!existing.isEmpty()) {
            Student student = existing.get(0);
            response.setDuplicate(true);
            response.setName(joinName(student.getFirstName(), student.getLastName()));
            response.setStudentId(student.getStudentNo());
            response.setMessage("This contact number is already registered.");
        } else {
            response.setMessage("This contact number is not registered yet.");
        }
        return response;
    }

    @Override
    @Transactional
    public AdminStudentRegistrationResponse registerStudent(AdminStudentRegistrationRequest registration,
            MultipartFile photo) {

        AdminStudentRegistrationResponse response = new AdminStudentRegistrationResponse();

        if (!isAdmin()) {
            return failed(response, "Only an admin can register students.");
        }

        String problem = validate(registration, photo);
        if (problem != null) {
            return failed(response, problem);
        }

        String contact = toLocalNumber(normalizePhone(registration.getContactNumber()));

        List<Student> sameContact = studentRepository.findByContactNumber(contact);
        if (!sameContact.isEmpty()) {
            Student existing = sameContact.get(0);
            return failed(response, "This contact number is already registered to "
                    + joinName(existing.getFirstName(), existing.getLastName()) + " ("
                    + existing.getStudentNo() + ").");
        }

        String email = trim(registration.getEmail());
        if (!studentRepository.findByEmail(email).isEmpty()) {
            return failed(response, "A student with this email already exists.");
        }

        // Taken last among the checks: the counter only moves when the student will be saved,
        // and @Transactional rolls it back if anything below fails.
        String studentNo = noConfig.NoConfigCreation(STUDENT_NUMBER_CONFIG);
        if (isBlank(studentNo)) {
            return failed(response, "Student numbers are not set up yet. Please contact the system administrator.");
        }

        boolean advancedLevel = isAdvancedLevel(registration.getGrade());
        String hashedPassword = passwordEncoder.encode(registration.getPassword());

        Student student = new Student();
        student.setFirstName(trim(registration.getFirstName()));
        student.setLastName(trim(registration.getLastName()));
        student.setContactNumber(contact);
        student.setDob(LocalDate.parse(trim(registration.getDateOfBirth())));
        student.setGender(registration.getGender());
        student.setAddress(trim(registration.getAddress()));
        student.setCity(trim(registration.getCity()));
        student.setPostalCode(isBlank(registration.getPostalCode()) ? null : trim(registration.getPostalCode()));
        student.setDistrict(registration.getDistrict());
        student.setGuardianName(trim(registration.getGuardianName()));
        student.setGuardianContactNumber(toLocalNumber(normalizePhone(registration.getGuardianContact())));
        student.setEmail(email);
        student.setNic(isBlank(registration.getNic()) ? null : normalizeNic(registration.getNic()));
        student.setWhatsappNumber(isBlank(registration.getWhatsappNumber()) ? contact
                : toLocalNumber(normalizePhone(registration.getWhatsappNumber())));
        student.setSchoolName(trim(registration.getSchool()));
        student.setGrade(registration.getGrade());
        student.setSubjectStream(advancedLevel ? registration.getStream() : null);
        student.setMedium(registration.getMedium());
        student.setExamYear(registration.getExamYear());

        // Login checks finalPassword; password and confirmPassword are kept in step the way
        // the student self sign-up does it. The plain text is never stored.
        student.setPassword(hashedPassword);
        student.setConfirmPassword(hashedPassword);
        student.setFinalPassword(hashedPassword);

        student.setStudentNo(studentNo);
        student.setStatus(ACTIVE_STUDENT_STATUS);
        student.setIsFirstLogin(true);
        student.setRegisterDateTime(LocalDateTime.now());

        if (photo != null && !photo.isEmpty()) {
            student.setProfilePhoto(fileStorageService.saveProfilePhoto(photo));
        }

        studentRepository.save(student);

        response.setIsSuccess(true);
        response.setMessage("Student registered successfully");
        response.setStudentId(student.getStudentNo());
        response.setStudentSeq(student.getStudentSeq());
        return response;
    }

    @Override
    public RegisteredTodayResponse getStudentsRegisteredToday() {

        RegisteredTodayResponse response = new RegisteredTodayResponse();

        if (!isAdmin()) {
            response.setCount(0);
            return response;
        }

        LocalDateTime startOfToday = LocalDate.now(ACADEMY_ZONE).atStartOfDay();
        response.setCount(studentRepository.countByStatusAndRegisterDateTimeGreaterThanEqual(
                ACTIVE_STUDENT_STATUS, startOfToday));
        return response;
    }

    // Validation ---------------------------------------------------------

    // Repeats every rule the registration page checks, because the page can be bypassed.
    // Returns the message to show, or null when the student can be saved.
    private String validate(AdminStudentRegistrationRequest r, MultipartFile photo) {

        if (isBlank(r.getFirstName())) {
            return "Enter the first name.";
        }
        if (isBlank(r.getLastName())) {
            return "Enter the last name.";
        }
        if (!PHONE.matcher(normalizePhone(r.getContactNumber())).matches()) {
            return "Enter a valid contact number, e.g. 077 123 4567.";
        }

        LocalDate dob = parseDate(r.getDateOfBirth());
        if (dob == null) {
            return "Enter the date of birth.";
        }
        int age = Period.between(dob, LocalDate.now(ACADEMY_ZONE)).getYears();
        if (dob.isAfter(LocalDate.now(ACADEMY_ZONE)) || age < AGE_MIN || age > AGE_MAX) {
            return "Check the date of birth. The student should be " + AGE_MIN + " to " + AGE_MAX
                    + " years old.";
        }

        if (!GENDERS.contains(r.getGender())) {
            return "Select a gender.";
        }
        if (isBlank(r.getAddress()) || trim(r.getAddress()).length() < ADDRESS_MIN) {
            return "Enter the full address (at least " + ADDRESS_MIN + " characters).";
        }
        if (isBlank(r.getCity())) {
            return "Enter the city.";
        }
        if (!isBlank(r.getPostalCode()) && !POSTAL_CODE.matcher(trim(r.getPostalCode())).matches()) {
            return "Enter a 5-digit postal code, e.g. 20400.";
        }
        if (!DISTRICTS.contains(r.getDistrict())) {
            return "Select a district.";
        }

        if (isBlank(r.getGuardianName())) {
            return "Enter the guardian's name.";
        }
        if (!PHONE.matcher(normalizePhone(r.getGuardianContact())).matches()) {
            return "Enter a valid guardian contact number, e.g. 077 123 4567.";
        }

        if (isBlank(r.getEmail()) || !EMAIL.matcher(trim(r.getEmail())).matches()) {
            return "Enter a valid email address, e.g. student@gmail.com.";
        }
        if (isBlank(r.getSchool())) {
            return "Enter the school name.";
        }
        if (!isBlank(r.getNic()) && !NIC.matcher(normalizeNic(r.getNic())).matches()) {
            return "Enter a valid NIC, e.g. 200912345678 or 912345678V.";
        }
        // A blank WhatsApp number means "same as the contact number"; a given one must be valid.
        if (!isBlank(r.getWhatsappNumber()) && !PHONE.matcher(normalizePhone(r.getWhatsappNumber())).matches()) {
            return "Enter a valid WhatsApp number, e.g. 077 123 4567.";
        }

        if (!GRADES.contains(r.getGrade())) {
            return "Select a grade.";
        }
        if (isAdvancedLevel(r.getGrade()) && !STREAMS.contains(r.getStream())) {
            return "Select a subject stream.";
        }
        if (!MEDIUMS.contains(r.getMedium())) {
            return "Select a medium.";
        }
        int thisYear = LocalDate.now(ACADEMY_ZONE).getYear();
        if (r.getExamYear() == null || r.getExamYear() < thisYear - 1 || r.getExamYear() > thisYear + 5) {
            return "Select the exam year.";
        }

        String photoProblem = fileStorageService.validateProfilePhoto(photo);
        if (photoProblem != null) {
            return photoProblem;
        }

        return validatePassword(r);
    }

    private String validatePassword(AdminStudentRegistrationRequest r) {
        String password = r.getPassword() != null ? r.getPassword() : "";
        String lower = password.toLowerCase();

        boolean valid = password.length() >= PASSWORD_MIN_LENGTH
                && password.chars().anyMatch(Character::isUpperCase)
                && password.chars().anyMatch(Character::isLowerCase)
                && password.chars().anyMatch(Character::isDigit)
                && password.codePoints().anyMatch(cp -> !Character.isLetterOrDigit(cp) && !Character.isWhitespace(cp))
                && password.chars().noneMatch(Character::isWhitespace)
                && COMMON_PASSWORDS.stream().noneMatch(lower::contains);

        if (!valid || containsPersonalInfo(password, r)) {
            return "The password does not meet the requirements.";
        }
        return null;
    }

    // True when the password holds the first or last name (3+ letters, any case) or the last
    // six digits of the contact number.
    private boolean containsPersonalInfo(String password, AdminStudentRegistrationRequest r) {
        String lower = password.toLowerCase();
        for (String name : new String[] { r.getFirstName(), r.getLastName() }) {
            String compact = name != null ? name.replaceAll("\\s+", "").toLowerCase() : "";
            long letters = compact.codePoints().filter(Character::isLetter).count();
            if (letters >= MIN_NAME_LETTERS && lower.contains(compact)) {
                return true;
            }
        }
        String digits = normalizePhone(r.getContactNumber());
        return digits.length() >= PHONE_TAIL_DIGITS
                && password.contains(digits.substring(digits.length() - PHONE_TAIL_DIGITS));
    }

    // Small helpers ------------------------------------------------------

    private boolean isAdmin() {
        return "admin".equals(request.getAttribute("role"));
    }

    private AdminStudentRegistrationResponse failed(AdminStudentRegistrationResponse response, String message) {
        response.setIsSuccess(false);
        response.setMessage(message);
        return response;
    }

    private boolean isAdvancedLevel(String grade) {
        return "12".equals(grade) || "13".equals(grade);
    }

    // Digits only, without a leading 94 or 0: a valid mobile number is then 7 + 8 digits.
    private String normalizePhone(String value) {
        String digits = value != null ? value.replaceAll("\\D", "") : "";
        if (digits.startsWith("94")) {
            digits = digits.substring(2);
        }
        if (digits.startsWith("0")) {
            digits = digits.substring(1);
        }
        return digits;
    }

    // The format students are stored and log in with: "0771234567".
    private String toLocalNumber(String normalizedPhone) {
        return "0" + normalizedPhone;
    }

    private String normalizeNic(String nic) {
        return nic != null ? nic.replaceAll("\\s", "").toUpperCase() : null;
    }

    private LocalDate parseDate(String value) {
        if (isBlank(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private String joinName(String firstName, String lastName) {
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String trim(String value) {
        return value != null ? value.trim() : null;
    }

}
