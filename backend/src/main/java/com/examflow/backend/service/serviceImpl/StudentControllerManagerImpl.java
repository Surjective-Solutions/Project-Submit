package com.examflow.backend.service.serviceImpl;

import com.examflow.backend.repository.StudentClassesRepository;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import com.examflow.backend.dto.AnswerSheetUploadRequest;
import com.examflow.backend.dto.ClassResponse;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.MonthPapersResponse;
import com.examflow.backend.dto.PaperResponse;
import com.examflow.backend.dto.RegradeRequestCreateRequest;
import com.examflow.backend.dto.RegradeRequestResponse;
import com.examflow.backend.dto.StudentClassPaymentRecordResponse;
import com.examflow.backend.dto.StudentResponse;
import com.examflow.backend.dto.UserSignUpRequest;
import com.examflow.backend.dto.QuestionGradeResponse;
import com.examflow.backend.entity.ClassPaymentRecord;
import com.examflow.backend.entity.GradeSubmission;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.PaperSubmission;
import com.examflow.backend.entity.RegradeRequest;
import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.StudentClass;
import com.examflow.backend.entity.StudentClassPaymentRecord;
import com.examflow.backend.entity.StudentSubmissionPaperQuestion;
import com.examflow.backend.entity.StudentSubmissionPaperSubQuestion;
import com.examflow.backend.entity.UplaodPaper;
import com.examflow.backend.entity.UploadPaperQuestion;
import com.examflow.backend.entity.UploadPaperQuestionSubQuestion;
import com.examflow.backend.entity.GradeSubmissionQuestion;
import com.examflow.backend.enums.paymentStatus;
import com.examflow.backend.repository.ClassPaymentRecordRepository;
import com.examflow.backend.repository.GradeSubmissionRepository;
import com.examflow.backend.repository.GradeSubmissionQuestionRepository;
import com.examflow.backend.repository.ClassesRepository;
import com.examflow.backend.repository.PaperSubmissionRepository;
import com.examflow.backend.repository.RegradeRequestRepository;
import com.examflow.backend.repository.StudentClassPaymentRecordsRepository;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.repository.StudentSubmissionPaperQuestionRepository;
import com.examflow.backend.repository.StudentSubmissionPaperQuestionSubQuestionRepository;
import com.examflow.backend.repository.UploadPaperQuestionRepository;
import com.examflow.backend.repository.UploadPaperQuestionSubQuestionRepository;
import com.examflow.backend.repository.UploadPaperRepository;
import com.examflow.backend.service.FileStorageService;
import com.examflow.backend.service.StudentControllerManager;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class StudentControllerManagerImpl implements StudentControllerManager {

    private static final String FILE_SERVER_BASE_URL = "http://localhost:8080";
    private final StudentClassesRepository studentClassesRepository;
    private final StudentSubmissionPaperQuestionSubQuestionRepository studentSubmissionPaperQuestionSubQuestionRepository;
    private final UploadPaperQuestionRepository uploadPaperQuestionRepository;
    private final FileStorageService fileStorageService;
    private final PaperSubmissionRepository paperSubmissionRepository;
    private final MonthlyPaymentService monthlyPaymentService;
    private final StudentSubmissionPaperQuestionRepository studentSubmissionPaperQuestionRepository;
    private final StudentRepository studentRepository;
    private final UploadPaperRepository uploadPaperRepository;
    private final UploadPaperQuestionSubQuestionRepository uploadPaperQuestionSubQuestionRepository;
    private final ClassesRepository classesRepository;
    private final ClassPaymentRecordRepository classPaymentRecordRepository;
    private final GradeSubmissionRepository gradeSubmissionRepository;
    private final GradeSubmissionQuestionRepository gradeSubmissionQuestionRepository;
    private final StudentClassPaymentRecordsRepository studentClassPaymentRecordsRepository;
    private final RegradeRequestRepository regradeRequestRepository;
    private HttpServletRequest request;

    @Autowired
    public StudentControllerManagerImpl(StudentRepository studentRepository,
            ClassesRepository classesRepository,
            StudentSubmissionPaperQuestionSubQuestionRepository studentSubmissionPaperQuestionSubQuestionRepository,
            UploadPaperQuestionRepository uploadPaperQuestionRepository,
            StudentSubmissionPaperQuestionRepository studentSubmissionPaperQuestionRepository,
            PaperSubmissionRepository paperSubmissionRepository,
            UploadPaperQuestionSubQuestionRepository uploadPaperQuestionSubQuestionRepository,
            FileStorageService fileStorageService,
            UploadPaperRepository uploadPaperRepository,
            StudentClassPaymentRecordsRepository studentClassPaymentRecordsRepository,
            ClassPaymentRecordRepository classPaymentRecordRepository,
            GradeSubmissionRepository gradeSubmissionRepository,
            GradeSubmissionQuestionRepository gradeSubmissionQuestionRepository,
            RegradeRequestRepository regradeRequestRepository,
            MonthlyPaymentService monthlyPaymentService,
            HttpServletRequest request,
            StudentClassesRepository studentClassesRepository) {
        this.studentRepository = studentRepository;
        this.classesRepository = classesRepository;
        this.studentSubmissionPaperQuestionRepository = studentSubmissionPaperQuestionRepository;
        this.studentSubmissionPaperQuestionSubQuestionRepository = studentSubmissionPaperQuestionSubQuestionRepository;
        this.uploadPaperQuestionRepository = uploadPaperQuestionRepository;
        this.paperSubmissionRepository = paperSubmissionRepository;
        this.uploadPaperQuestionSubQuestionRepository = uploadPaperQuestionSubQuestionRepository;
        this.fileStorageService = fileStorageService;
        this.monthlyPaymentService = monthlyPaymentService;
        this.uploadPaperRepository = uploadPaperRepository;
        this.classPaymentRecordRepository = classPaymentRecordRepository;
        this.gradeSubmissionRepository = gradeSubmissionRepository;
        this.gradeSubmissionQuestionRepository = gradeSubmissionQuestionRepository;
        this.studentClassPaymentRecordsRepository = studentClassPaymentRecordsRepository;
        this.regradeRequestRepository = regradeRequestRepository;
        this.request = request;
        this.studentClassesRepository = studentClassesRepository;
    }

    @Override
    public List<StudentResponse> getAllStudents() {

        List<Student> studentList = studentRepository.findByStatus(2);

        List<StudentResponse> studentResponsesList = new ArrayList<>();

        for (Student student : studentList) {
            StudentResponse studentResponse = new StudentResponse();
            studentResponse.setId(student.getStudentSeq());
            studentResponse.setStudent_number(null);
            studentResponse.setFirst_name(student.getFirstName());
            studentResponse.setLast_name(student.getLastName());
            studentResponse.setDate_of_birth(student.getDob());
            studentResponse.setEmail(student.getEmail());
            studentResponse.setGender(student.getGender());
            studentResponse.setGrade(student.getGrade());
            studentResponse.setContact_number(student.getContactNumber());
            studentResponse.setWhatsapp_number(student.getWhatsappNumber());
            studentResponse.setSchool_name(student.getSchoolName());
            studentResponse.setSubject_stream(student.getSubjectStream());
            studentResponse.setStudent_number(student.getStudentNo());
            studentResponse.setSubject_stream(student.getSubjectStream());
            studentResponse.setGuardian_name(student.getGuardianName());
            studentResponse.setGuardian_contact(student.getGuardianContactNumber());
            studentResponse.setAddress(student.getAddress());
            studentResponse.setDistrict(student.getDistrict());
            studentResponse.setSubject_stream(student.getSubjectStream());
            if (student.getStatus() == 2) {
                studentResponse.setStatus("ACTIVE");

            } else {
                studentResponse.setStatus("INACTIVE");
            }
            studentResponsesList.add(studentResponse);
        }

        return studentResponsesList;
    }

    @Override
    public GeneralResponse addClassToStudent(Integer classId) {

        GeneralResponse generalResponse = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer studentSeq = (Integer) request.getAttribute("userId");

        Student student = studentRepository.findByStudentSeq(studentSeq);
        if (student == null) {
            generalResponse.setIsSuccess(false);
            generalResponse.setMessage("student not found");
            return generalResponse;
        } else {
            StudentClass studentClass = new StudentClass();
            Classes classes = classesRepository.findByClassSeqAndStatus(classId, 2);

            studentClass.setClasses(classes);
            studentClass.setStudent(student);
            studentClass.setCreatedBy(username);
            studentClass.setLastModifiedBy(username);
            studentClass.setLastModifiedDateTime(LocalDateTime.now());
            studentClass.setCreatedDateTime(LocalDateTime.now());
            studentClass.setStatusSeq(2);
            studentClass.setMonthlyFee(classes.getMonthlyFee());

            studentClassesRepository.save(studentClass);
            monthlyPaymentService.generateStudentClassPaymentRecord();

            // Auto-create payment record for current month so student can pay immediately
            LocalDateTime now = LocalDateTime.now();
            Integer currentMonth = now.getMonthValue();
            Integer currentYear = now.getYear();

            ClassPaymentRecord classPaymentRecord = classPaymentRecordRepository
                    .findByClassesAndStatusAndMonth(classes, 2, currentMonth);
            if (classPaymentRecord == null) {
                classPaymentRecord = new ClassPaymentRecord();
                classPaymentRecord.setClasses(classes);
                classPaymentRecord.setMonth(currentMonth);
                classPaymentRecord.setYear(currentYear);
                classPaymentRecord.setStatus(2);
                classPaymentRecord.setClassPaymentRecordSearial(currentMonth + "-" + currentYear + "-payment");
                classPaymentRecord.setCreatedBy(username);
                classPaymentRecord.setCreatedDateTime(now);
                classPaymentRecord.setLastModifiedBy(username);
                classPaymentRecord.setLastModifiedDateTime(now);
                classPaymentRecordRepository.save(classPaymentRecord);
            }

            StudentClassPaymentRecord existingRecord = studentClassPaymentRecordsRepository
                    .findByStudentAndStatusAndClassPaymentRecord(student, 2, classPaymentRecord);
            if (existingRecord == null) {
                StudentClassPaymentRecord newRecord = new StudentClassPaymentRecord();
                newRecord.setClassPaymentRecord(classPaymentRecord);
                newRecord.setStudent(student);
                newRecord.setIsPayed(false);
                newRecord.setStatus(2);
                newRecord.setCreatedBy(username);
                newRecord.setLastModifiedBy(username);
                newRecord.setCreatedDateTime(now);
                newRecord.setLastModifiedDateTime(now);
                studentClassPaymentRecordsRepository.save(newRecord);
            }

            generalResponse.setIsSuccess(true);
            generalResponse.setMessage("Class Addedd to your Class " + username);

            return generalResponse;
        }

    }

    @Override
    public List<ClassResponse> getAllEnrolledClass() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer studentSeq = (Integer) request.getAttribute("userId");
        Student student = studentRepository.findByStudentSeq(studentSeq);
        List<ClassResponse> sendClassResponses = new ArrayList<>();
        List<StudentClass> studentClasses = studentClassesRepository.findByStudentAndStatusSeq(student, 2);

        for (StudentClass studentClass : studentClasses) {
            ClassResponse classResponse = new ClassResponse();
            classResponse.setId(studentClass.getClasses().getClassSeq());
            classResponse.setClass_name(studentClass.getClasses().getDisplayName());
            classResponse.setTeacher_name(studentClass.getClasses().getTutor().getName());
            classResponse.setSubject(studentClass.getClasses().getSubjectName());
            classResponse.setEnrolled_at(studentClass.getCreatedDateTime());
            classResponse.setMonthly_fee(studentClass.getMonthlyFee());
            classResponse.setDescription(studentClass.getClasses().getDescription());
            
            if(studentClass.getClasses().getStatus() == 2){
                classResponse.setStatus("ACTIVE");
            }else{
                classResponse.setStatus("INACTIVE");
            }

            List<ClassPaymentRecord> classPaymentRecords = classPaymentRecordRepository
                    .findByClassesAndStatus(studentClass.getClasses(), 2);
            List<StudentClassPaymentRecordResponse> studentClassPaymentRecordResponses = new ArrayList<>();
            for (ClassPaymentRecord classPaymentRecord : classPaymentRecords) {

                List<StudentClassPaymentRecord> existstudentClassPaymentRecords = studentClassPaymentRecordsRepository
                        .findByStudentAndClassPaymentRecordAndStatus(student, classPaymentRecord, 2);
                for (StudentClassPaymentRecord studentClassPaymentRecord : existstudentClassPaymentRecords) {
                    StudentClassPaymentRecordResponse clasrep = new StudentClassPaymentRecordResponse();
                    clasrep.setId(studentClassPaymentRecord.getClassPaymentRecord().getClassPaymentRecordSearial());
                    clasrep.setMonth(studentClassPaymentRecord.getClassPaymentRecord().getMonth());
                    clasrep.setYear(studentClassPaymentRecord.getClassPaymentRecord().getYear());
                    if (!Boolean.TRUE.equals(studentClassPaymentRecord.getIsForPayments())) {
                        // No submission on the current active record yet. It may still be a genuinely
                        // untouched month (NOT_PAID), or it may be the fresh placeholder that
                        // rejectPayment()
                        // creates after rejecting a prior submission - check for that prior rejection
                        // so the
                        // student still sees why they were rejected until they resubmit.
                        StudentClassPaymentRecord lastRejected = studentClassPaymentRecordsRepository
                                .findTopByStudentAndClassPaymentRecordAndStatusOrderByApprovedTimeDesc(
                                        student, classPaymentRecord,
                                        paymentStatus.fromStatusName("REJECTED").getSequence());
                        if (lastRejected != null) {
                            clasrep.setStatus("REJECTED");
                            clasrep.setRejection_reason(lastRejected.getReson());
                        } else {
                            clasrep.setStatus("NOT_PAID");
                        }
                    } else if (studentClassPaymentRecord.getIsApproved() == null) {
                        clasrep.setStatus("PENDING");
                    } else if (studentClassPaymentRecord.getIsApproved() == true) {
                        clasrep.setStatus("PAID");
                    } else {
                        clasrep.setStatus("REJECTED");
                        clasrep.setRejection_reason(studentClassPaymentRecord.getReson());
                    }
                    clasrep.setReference_number(studentClassPaymentRecord.getReffrenceNo());
                    clasrep.setPaid_at(studentClassPaymentRecord.getPayedTime());
                    studentClassPaymentRecordResponses.add(clasrep);
                }

            }

            List<ClassPaymentRecord> existsClassPaymentRecords = classPaymentRecordRepository
                    .findByClassesAndStatus(studentClass.getClasses(), 2);
            System.out.println("class payment records" + existsClassPaymentRecords);
            List<MonthPapersResponse> monthPapersResponses = new ArrayList<>();
            for (ClassPaymentRecord classPaymentRecord : existsClassPaymentRecords) {
                MonthPapersResponse newMonthPapersResponse = new MonthPapersResponse();
                newMonthPapersResponse.setMonth(classPaymentRecord.getMonth());
                newMonthPapersResponse.setYear(classPaymentRecord.getYear());
                String monthLable = Month.of(classPaymentRecord.getMonth()).name() + " -  "
                        + classPaymentRecord.getYear();
                newMonthPapersResponse.setMonth_label(monthLable);

                List<UplaodPaper> monthUploadPapers = uploadPaperRepository
                        .findByClassesAndStatusAndClassPaymentRecordAndIsPublished(studentClass.getClasses(), 2, classPaymentRecord,true);
                System.out.println(monthUploadPapers);
                List<PaperResponse> monthpaperResponses = new ArrayList<>();
                for (UplaodPaper monthUploadPaper : monthUploadPapers) {

                    PaperResponse paperResponse = new PaperResponse();
                    paperResponse.setId(String.valueOf(monthUploadPaper.getUploadPaperSeq()));
                    paperResponse.setPaper_name(monthUploadPaper.getPaperName());
                    paperResponse.setDue_date(monthUploadPaper.getDueDate());
                    paperResponse.setDuration_minutes(monthUploadPaper.getDurationMinutes());

                    PaperSubmission paperSubmission = paperSubmissionRepository
                            .findByStudentAndUplaodpaperAndStatusSeq(student, monthUploadPaper, 2);

                    if (paperSubmission != null) {
                        String pdfUrl = FILE_SERVER_BASE_URL + paperSubmission.getSubmissionFilePath();
                        paperResponse.setSubmission_url(pdfUrl);

                        GradeSubmission gradeSubmission = gradeSubmissionRepository
                                .findByPaperSubmissionAndStatus(paperSubmission, 2);

                        if (gradeSubmission != null) {
                            RegradeRequest pendingRegradeRequest = regradeRequestRepository
                                    .findByPaperSubmissionAndStatus(paperSubmission, 1);
                            paperResponse.setSubmission_status(
                                    pendingRegradeRequest != null ? "REGRADE_REQUESTED" : "GRADED");
                            paperResponse.setGrade(gradeSubmission.getGrade() + " ("
                                    + gradeSubmission.getTotalMarks() + "/"
                                    + gradeSubmission.getMaxMarks() + ")");
                            paperResponse.setGraded_pdf_url(pdfUrl);
                        } else {
                            paperResponse.setSubmission_status("SUBMITTED");
                            paperResponse.setGrade(null);
                            paperResponse.setGraded_pdf_url(null);
                        }
                    } else {
                        paperResponse.setSubmission_status("NOT_SUBMITTED");
                        paperResponse.setSubmission_url(null);
                        paperResponse.setGrade(null);
                        paperResponse.setGraded_pdf_url(null);
                    }
                    String examFilePath = monthUploadPaper.getFilePath();
                    String pdfUrl = examFilePath != null && examFilePath.startsWith("http")
                            ? examFilePath
                            : FILE_SERVER_BASE_URL + "/uploads/" + examFilePath;
                    paperResponse.setExam_pdf_url(pdfUrl);
                    paperResponse.setIs_current(null);

                    monthpaperResponses.add(paperResponse);

                }
                newMonthPapersResponse.setPapers(monthpaperResponses);
                monthPapersResponses.add(newMonthPapersResponse);
            }

            classResponse.setPapers_by_month(monthPapersResponses);

            classResponse.setMonthly_payments(studentClassPaymentRecordResponses);
            sendClassResponses.add(classResponse);
        }

        return sendClassResponses;
    }

    @Override
    public StudentResponse getStudentById(Integer id) {
        Student student = studentRepository.findByStudentSeq(id);
        if (student == null)
            return null;

        StudentResponse studentResponse = new StudentResponse();
        studentResponse.setId(student.getStudentSeq());
        studentResponse.setStudent_number(null);
        studentResponse.setFirst_name(student.getFirstName());
        studentResponse.setLast_name(student.getLastName());
        studentResponse.setDate_of_birth(student.getDob());
        studentResponse.setEmail(student.getEmail());
        studentResponse.setGender(student.getGender());
        studentResponse.setGrade(student.getGrade());
        studentResponse.setContact_number(student.getContactNumber());
        studentResponse.setWhatsapp_number(student.getWhatsappNumber());
        studentResponse.setSchool_name(student.getSchoolName());
        studentResponse.setSubject_stream(student.getSubjectStream());
        studentResponse.setGuardian_name(student.getGuardianName());
        studentResponse.setGuardian_contact(student.getGuardianContactNumber());
        studentResponse.setAddress(student.getAddress());
        studentResponse.setDistrict(student.getDistrict());
        if (student.getStatus() == 2) {
            studentResponse.setStatus("ACTIVE");
        } else {
            studentResponse.setStatus("INACTIVE");
        }
        return studentResponse;
    }

    @Override
    public GeneralResponse updateStudent(Integer id, UserSignUpRequest studentRequest) {
        GeneralResponse response = new GeneralResponse();
        Student student = studentRepository.findByStudentSeq(id);
        if (student == null) {
            response.setIsSuccess(false);
            response.setMessage("Student not found");
            return response;
        }
        student.setFirstName(studentRequest.getFirstName());
        student.setLastName(studentRequest.getLastName());
        student.setEmail(studentRequest.getEmail());
        student.setContactNumber(studentRequest.getContactNumber());
        student.setWhatsappNumber(studentRequest.getWhatsappNumber());
        student.setSchoolName(studentRequest.getSchoolName());
        student.setGrade(studentRequest.getGrade());
        student.setSubjectStream(studentRequest.getSubjectStream());
        student.setGuardianName(studentRequest.getGuardianName());
        student.setGuardianContactNumber(studentRequest.getGuardianContactNumber());
        student.setAddress(studentRequest.getAddress());
        student.setDistrict(studentRequest.getDistrict());
        studentRepository.save(student);
        response.setIsSuccess(true);
        response.setMessage("Student updated successfully");
        return response;
    }

    @Override
    public GeneralResponse uploadAnswerSheet(AnswerSheetUploadRequest answerSheetUploadRequest,
            MultipartFile answerSheet) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer studentSeq = (Integer) request.getAttribute("userId");
        GeneralResponse response = new GeneralResponse();

        Student student = studentRepository.findByStudentSeq(studentSeq);
        UplaodPaper uploadPaper = uploadPaperRepository.findByUploadPaperSeq(answerSheetUploadRequest.getPaperId());

        PaperSubmission paperSubmission = new PaperSubmission();
        paperSubmission.setStudent(student);
        paperSubmission.setUplaodpaper(uploadPaper);
        paperSubmission.setSubmissionBy(username);
        paperSubmission.setSubmissionDate(LocalDateTime.now());
        paperSubmission.setGraded(false);

        String filePath = fileStorageService.saveAnswerSheet(answerSheet);
        paperSubmission.setSubmissionFilePath(filePath);
        paperSubmission.setStatusSeq(2);

        paperSubmissionRepository.save(paperSubmission);

        response.setIsSuccess(true);
        response.setMessage("Answer sheet uploaded successfully");

        List<UploadPaperQuestion> paperQuestions = uploadPaperQuestionRepository.findByUplaodPaperAndStatus(uploadPaper, 2);
        
        for(UploadPaperQuestion question : paperQuestions){
            StudentSubmissionPaperQuestion studentSubmissionPaperQuestion = new StudentSubmissionPaperQuestion();
            UploadPaperQuestion uploadPaperQuestion = uploadPaperQuestionRepository.findByUploadPaperQuestionSeq(question.getUploadPaperQuestionSeq());
            studentSubmissionPaperQuestion.setStudent(student);
            studentSubmissionPaperQuestion.setUploadPaperQuestion(uploadPaperQuestion);
            studentSubmissionPaperQuestion.setStatusSeq(2);
            studentSubmissionPaperQuestionRepository.save(studentSubmissionPaperQuestion);  
            
            List<UploadPaperQuestionSubQuestion> paperSubQuestions = uploadPaperQuestionSubQuestionRepository.findByUploadPaperQuestionAndStatus(question,2);
            if (paperSubQuestions.size()>0) {
                for (UploadPaperQuestionSubQuestion papersubQuestions : paperSubQuestions) {
                StudentSubmissionPaperSubQuestion studentSubQuestion = new StudentSubmissionPaperSubQuestion();
                studentSubQuestion.setStudentSubmissionPaperQuestion(studentSubmissionPaperQuestion);
                studentSubQuestion.setStatusSeq(2);
                studentSubQuestion.setUploadPaperQuestionSubQuestion(papersubQuestions);
                studentSubmissionPaperQuestionSubQuestionRepository.save(studentSubQuestion);
                }
            } 

         }


        return response;

    }

    @Override
    public GeneralResponse removeClassFromStudent(Integer classId) {
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer studentSeq = (Integer) request.getAttribute("userId");

        Student student = studentRepository.findByStudentSeq(studentSeq);
        if (student == null) {
            response.setIsSuccess(false);
            response.setMessage("Student not found");
            return response;
        }

        Classes classes = classesRepository.findByClassSeqAndStatus(classId, 2);
        if (classes == null) {
            response.setIsSuccess(false);
            response.setMessage("Class not found");
            return response;
        }

        StudentClass studentClass = studentClassesRepository.findByStudentAndClassesAndStatusSeq(student, classes, 2);
        if (studentClass == null) {
            response.setIsSuccess(false);
            response.setMessage("Enrollment not found");
            return response;
        }

        studentClass.setStatusSeq(1);
        studentClass.setLastModifiedBy(username);
        studentClass.setLastModifiedDateTime(LocalDateTime.now());
        studentClassesRepository.save(studentClass);

        response.setIsSuccess(true);
        response.setMessage("Class removed successfully");
        return response;
    }

    @Override
    public List<QuestionGradeResponse> getGradeDetailsForPaper(Integer paperId) {
        List<QuestionGradeResponse> questionGradeResponses = new ArrayList<>();
        Integer studentSeq = (Integer) request.getAttribute("userId");
        Student student = studentRepository.findByStudentSeq(studentSeq);

        UplaodPaper uploadPaper = uploadPaperRepository.findByUploadPaperSeq(paperId);
        if (uploadPaper == null || student == null) {
            return questionGradeResponses;
        }

        PaperSubmission paperSubmission = paperSubmissionRepository
                .findByStudentAndUplaodpaperAndStatusSeq(student, uploadPaper, 2);
        if (paperSubmission == null) {
            return questionGradeResponses;
        }

        GradeSubmission gradeSubmission = gradeSubmissionRepository
                .findByPaperSubmissionAndStatus(paperSubmission, 2);
        if (gradeSubmission == null) {
            return questionGradeResponses;
        }

        List<UploadPaperQuestion> allPaperQuestions = uploadPaperQuestionRepository
                .findByUplaodPaperAndStatusOrderByQuestionKeyAsc(uploadPaper, 2);
        Integer startingNumber = uploadPaper.getStartingQuestionNumber() != null ? uploadPaper.getStartingQuestionNumber() : 1;

        Map<Integer, Integer> questionNumberByKey = new HashMap<>();
        Integer runningNumber = startingNumber;
        for (UploadPaperQuestion q : allPaperQuestions) {
            questionNumberByKey.put(q.getUploadPaperQuestionSeq(), runningNumber);
            runningNumber++;
        }

        List<GradeSubmissionQuestion> gradeSubmissionQuestions = gradeSubmissionQuestionRepository
                .findByGradeSubmissionAndStatus(gradeSubmission, 2);

        for (GradeSubmissionQuestion gradedQuestion : gradeSubmissionQuestions) {
            QuestionGradeResponse questionResponse = new QuestionGradeResponse();
            questionResponse.setMarks_awarded(gradedQuestion.getMarksAwarded());
            questionResponse.setComment(gradedQuestion.getComment());

            Integer questionNumber = questionNumberByKey.get(gradedQuestion.getUploadPaperQuestion().getUploadPaperQuestionSeq());

            boolean isSubQuestion = Boolean.TRUE.equals(gradedQuestion.getIsSubQuestion())
                    && gradedQuestion.getUploadPaperQuestionSubQuestion() != null;
            if (isSubQuestion) {
                questionResponse.setQuestion_id("Q" + questionNumber
                        + "-" + gradedQuestion.getUploadPaperQuestionSubQuestion().getUploadPaperQuestionSubQuestionSeq().toString());
                questionResponse.setMax_marks(gradedQuestion.getUploadPaperQuestionSubQuestion().getMark());
            } else {
                questionResponse.setQuestion_id("Q" + questionNumber);
                questionResponse.setMax_marks(gradedQuestion.getUploadPaperQuestion().getMarks());
            }

            questionGradeResponses.add(questionResponse);
        }

        return questionGradeResponses;
    }

    @Override
    public GeneralResponse createRegradeRequest(Integer paperId, RegradeRequestCreateRequest regradeRequestCreateRequest) {
        GeneralResponse response = new GeneralResponse();
        Integer studentSeq = (Integer) request.getAttribute("userId");
        Student student = studentRepository.findByStudentSeq(studentSeq);
        if (student == null) {
            response.setIsSuccess(false);
            response.setMessage("Student not found");
            return response;
        }

        if (regradeRequestCreateRequest.getReason() == null || regradeRequestCreateRequest.getReason().trim().isEmpty()) {
            response.setIsSuccess(false);
            response.setMessage("Please provide a reason for the regrade request");
            return response;
        }

        UplaodPaper uploadPaper = uploadPaperRepository.findByUploadPaperSeq(paperId);
        if (uploadPaper == null) {
            response.setIsSuccess(false);
            response.setMessage("Paper not found");
            return response;
        }

        PaperSubmission paperSubmission = paperSubmissionRepository
                .findByStudentAndUplaodpaperAndStatusSeq(student, uploadPaper, 2);
        if (paperSubmission == null) {
            response.setIsSuccess(false);
            response.setMessage("You have not submitted an answer sheet for this paper");
            return response;
        }

        GradeSubmission activeGradeSubmission = gradeSubmissionRepository.findByPaperSubmissionAndStatus(paperSubmission, 2);
        if (activeGradeSubmission == null) {
            response.setIsSuccess(false);
            response.setMessage("This submission has not been graded yet");
            return response;
        }

        RegradeRequest existingPending = regradeRequestRepository.findByPaperSubmissionAndStatus(paperSubmission, 1);
        if (existingPending != null) {
            response.setIsSuccess(false);
            response.setMessage("A regrade request for this submission is already pending");
            return response;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        RegradeRequest regradeRequest = new RegradeRequest();
        regradeRequest.setPaperSubmission(paperSubmission);
        // Snapshot exactly which grading record is being contested, since a future
        // edit will supersede it with a brand new GradeSubmission row rather than
        // mutating this one - the FK keeps this request identifiable by its marks.
        regradeRequest.setGradeSubmission(activeGradeSubmission);
        regradeRequest.setReason(regradeRequestCreateRequest.getReason());
        regradeRequest.setStatus(1); // pending / open
        regradeRequest.setRequestedAt(LocalDateTime.now());
        regradeRequest.setRequestedBy(username);
        regradeRequestRepository.save(regradeRequest);

        response.setIsSuccess(true);
        response.setMessage("Regrade request submitted successfully");
        return response;
    }

    @Override
    public RegradeRequestResponse getRegradeRequestForPaper(Integer paperId) {
        Integer studentSeq = (Integer) request.getAttribute("userId");
        Student student = studentRepository.findByStudentSeq(studentSeq);
        if (student == null) {
            return null;
        }

        UplaodPaper uploadPaper = uploadPaperRepository.findByUploadPaperSeq(paperId);
        if (uploadPaper == null) {
            return null;
        }

        PaperSubmission paperSubmission = paperSubmissionRepository
                .findByStudentAndUplaodpaperAndStatusSeq(student, uploadPaper, 2);
        if (paperSubmission == null) {
            return null;
        }

        RegradeRequest regradeRequest = regradeRequestRepository
                .findTopByPaperSubmissionOrderByRequestedAtDesc(paperSubmission);
        if (regradeRequest == null) {
            return null;
        }

        RegradeRequestResponse response = new RegradeRequestResponse();
        response.setId(regradeRequest.getRegradeRequestSeq());
        response.setReason(regradeRequest.getReason());
        response.setRequested_at(regradeRequest.getRequestedAt());
        response.setStatus(regradeRequest.getStatus() == 2 ? "COMPLETED" : "PENDING");
        response.setResolved_at(regradeRequest.getResolvedAt());

        GradeSubmission contestedGradeSubmission = regradeRequest.getGradeSubmission();
        if (contestedGradeSubmission != null) {
            response.setPrevious_total_marks(contestedGradeSubmission.getTotalMarks());
            response.setPrevious_max_marks(contestedGradeSubmission.getMaxMarks());
            response.setPrevious_grade(contestedGradeSubmission.getGrade());
        }

        return response;
    }
}
