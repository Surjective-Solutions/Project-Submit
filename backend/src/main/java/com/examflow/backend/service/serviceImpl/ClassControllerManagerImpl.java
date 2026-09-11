package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.CashierResponse;
import com.examflow.backend.dto.ClassRequest;
import com.examflow.backend.dto.ClassResponse;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.MonthPapersResponse;
import com.examflow.backend.dto.PaperResponse;
import com.examflow.backend.dto.PaperUploadRequest;
import com.examflow.backend.dto.QuestionPaperInstructorTutorResponse;
import com.examflow.backend.dto.QuestionRequestDTO;
import com.examflow.backend.dto.RegradeRequestResponse;
import com.examflow.backend.dto.SubQuestionRequestDTO;
import com.examflow.backend.dto.SubmissionPaperInstructorTutorResponse;
import com.examflow.backend.dto.SubmitGradeQuestionsResponse;
import com.examflow.backend.dto.SubmitGradeResponse;
import com.examflow.backend.dto.UploadPaperResponse;
import com.examflow.backend.entity.Cashier;
import com.examflow.backend.entity.ClassPaymentRecord;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.GradeSubmission;
import com.examflow.backend.entity.GradeSubmissionQuestion;
import com.examflow.backend.entity.PaperSubmission;
import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.entity.UplaodPaper;
import com.examflow.backend.entity.UploadPaperQuestion;
import com.examflow.backend.entity.UploadPaperQuestionSubQuestion;
import com.examflow.backend.repository.ClassPaymentRecordRepository;
import com.examflow.backend.repository.ClassesRepository;
import com.examflow.backend.repository.GradeSubmissionQuestionRepository;
import com.examflow.backend.repository.GradeSubmissionRepository;
import com.examflow.backend.repository.PaperSubmissionRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.repository.UploadPaperQuestionRepository;
import com.examflow.backend.repository.UploadPaperQuestionSubQuestionRepository;
import com.examflow.backend.repository.UploadPaperRepository;
import com.examflow.backend.service.ClassControllerManager;
import com.examflow.backend.service.FileStorageService;


import jakarta.servlet.http.HttpServletRequest;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class ClassControllerManagerImpl implements ClassControllerManager {

    private HttpServletRequest request;
    private final TutorRepository tutorRepository;
    private final GradeSubmissionRepository gradeSubmissionRepository;
    private final FileStorageService fileStorageService;
    private final GradeSubmissionQuestionRepository gradeSubmissionQuestionRepository;
    private final PaperSubmissionRepository paperSubmissionRepository;
    private final ClassesRepository classesRepository;
    private final UploadPaperRepository uploadPaperRepository;
    private final ClassPaymentRecordRepository classPaymentRecordRepository;
    private final UploadPaperQuestionRepository uploadPaperQuestionRepository;
    private final UploadPaperQuestionSubQuestionRepository uploadPaperQuestionSubQuestionRepository;
    private final MonthlyPaymentService monthlyPaymentService;
    private final GradeEditService gradeEditService;
    private final RegradeRequestQueryService regradeRequestQueryService;
    private final SubmissionGradeSummaryService submissionGradeSummaryService;

    @Autowired
    public ClassControllerManagerImpl(HttpServletRequest request,
            TutorRepository tutorRepository,
            GradeSubmissionQuestionRepository gradeSubmissionQuestionRepository,
            PaperSubmissionRepository paperSubmissionRepository,
            UploadPaperQuestionRepository uploadPaperQuestionRepository,
            GradeSubmissionRepository gradeSubmissionRepository,
            UploadPaperQuestionSubQuestionRepository uploadPaperQuestionSubQuestionRepository,
            FileStorageService fileStorageService,
            ClassPaymentRecordRepository classPaymentRecordRepository,
            ClassesRepository classesRepository,
            UploadPaperRepository uploadPaperRepository,
            GradeEditService gradeEditService,
            RegradeRequestQueryService regradeRequestQueryService,
            SubmissionGradeSummaryService submissionGradeSummaryService,
            MonthlyPaymentService monthlyPaymentService) {
        this.request = request;
        this.paperSubmissionRepository = paperSubmissionRepository;
        this.gradeSubmissionRepository = gradeSubmissionRepository;
        this.tutorRepository = tutorRepository;
        this.gradeSubmissionQuestionRepository = gradeSubmissionQuestionRepository;
        this.fileStorageService = fileStorageService;
        this.classPaymentRecordRepository = classPaymentRecordRepository;
        this.classesRepository = classesRepository;
        this.uploadPaperQuestionRepository = uploadPaperQuestionRepository;
        this.gradeEditService = gradeEditService;
        this.regradeRequestQueryService = regradeRequestQueryService;
        this.submissionGradeSummaryService = submissionGradeSummaryService;
        this.uploadPaperQuestionSubQuestionRepository = uploadPaperQuestionSubQuestionRepository;
        this.uploadPaperRepository = uploadPaperRepository;
        this.monthlyPaymentService = monthlyPaymentService;
    }

    // The file_url / pdf_url fields returned to the frontend need to be absolute,
    // since these pages are served from the Next.js app (port 3000) while uploaded
    // files are only served by this backend at /uploads/** (port 8080). A root-relative
    // path like "/uploads/..." would resolve against the wrong origin in an <iframe src>.
    private static final String FILE_SERVER_BASE_URL = "http://localhost:8080";

    private String buildMonthLabel(String month, String year) {
        try {
            java.time.Month monthValue = java.time.Month.of(Integer.parseInt(month));
            return monthValue.getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH) + " " + year;
        } catch (Exception e) {
            return null;
        }
    }

    // Due date arrives from the frontend as a plain "yyyy-MM-dd" date-picker value
    // with no time component. Treat the paper as due through end-of-day on that date
    // rather than the instant midnight begins, so a student submitting later that
    // same day isn't treated as already overdue.
    private LocalDateTime parseDueDate(String dueDateStr) {
        if (dueDateStr == null || dueDateStr.isBlank()) {
            return null;
        }
        return java.time.LocalDate.parse(dueDateStr).atTime(23, 59, 59);
    }

    @Override
    public GeneralResponse createClass(ClassRequest classRequest) {
        System.out.println("reached to impl");
        GeneralResponse response = new GeneralResponse();
        Classes newClass = new Classes();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);

        newClass.setDisplayName(classRequest.getDisplay_name());
        newClass.setDescription(classRequest.getDescription());
        newClass.setTutor(tutor);
        newClass.setMonthlyFee(classRequest.getMonthly_fee());
        newClass.setSubjectName(classRequest.getSubject_name());
        newClass.setLastModifiedBy(username);
        newClass.setCreatedBy(username);
        newClass.setLastModifiedDateTime(LocalDateTime.now());
        newClass.setCreatedDateTime(LocalDateTime.now());
        newClass.setStatus(2); // Set status to 2 for active

        classesRepository.save(newClass);

        response.setMessage("Class created successfully");
        response.setIsSuccess(true);
        System.out.println("Class created successfully");

        try {
            ClassPaymentRecord classPaymentRecord = new ClassPaymentRecord();
            YearMonth month = YearMonth.of(newClass.getCreatedDateTime().getYear(),
                    newClass.getCreatedDateTime().getMonth());
            Integer monthnumber = month.getMonthValue();
            Integer yearnumber = month.getYear();

            classPaymentRecord.setClasses(newClass);
            classPaymentRecord.setMonth(monthnumber);
            classPaymentRecord.setYear(yearnumber);
            classPaymentRecord.setStatus(2);
            classPaymentRecord.setCreatedBy("SYSTEM");
            classPaymentRecord.setLastModifiedBy("SYSTEM");
            classPaymentRecord.setCreatedDateTime(LocalDateTime.now());
            classPaymentRecord.setLastModifiedDateTime(LocalDateTime.now());
            classPaymentRecord.setClassPaymentRecordSearial(monthnumber + "-" + yearnumber + '-' + "payment");
            classPaymentRecordRepository.save(classPaymentRecord);

        } catch (Exception e) {

        }

        return response;
    }

    @Override
    public List<ClassResponse> getAllClasses() {
        System.out.println("reached to impl");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        List<Classes> classList = classesRepository.findByTutor(tutor);

        List<ClassResponse> classResponseList = new ArrayList<>();

        for (Classes classes : classList) {
            ClassResponse classResponse = new ClassResponse();
            classResponse.setDisplay_name(classes.getDisplayName());
            classResponse.setDescription(classes.getDescription());
            classResponse.setMonthly_fee(classes.getMonthlyFee());
            classResponse.setSubject_name(classes.getSubjectName());
            classResponse.setId(classes.getClassSeq());
            if (classes.getStatus() == 2) {
                classResponse.setStatus("ACTIVE");
            } else {
                classResponse.setStatus("INACTIVE");
            }

            List<UplaodPaper> papers = uploadPaperRepository.findByClassesAndStatus(classes, 2);

            List<UploadPaperResponse> paperResponses = new ArrayList<>();
            for (UplaodPaper paper : papers) {
                UploadPaperResponse paperResponse = new UploadPaperResponse();
                paperResponse.setPaper_name(paper.getPaperName());
                paperResponse.setId(paper.getUploadPaperSeq());
                paperResponse.setMonth(Integer.valueOf(paper.getMonth()));
                paperResponse.setYear(Integer.valueOf(paper.getYear()));
                paperResponse.setMonth_label(buildMonthLabel(paper.getMonth(), paper.getYear()));
                paperResponse.setNumber_of_questions(paper.getNoOfQuestions());
                paperResponse.setUploaded_at(paper.getCreatedDateTime());
                paperResponse.setDue_date(paper.getDueDate());
                paperResponse.setDuration_minutes(paper.getDurationMinutes());
                String paperFilePath = paper.getFilePath();
                paperResponse.setPdf_url(paperFilePath == null
                        ? null
                        : paperFilePath.startsWith("http")
                                ? paperFilePath
                                : FILE_SERVER_BASE_URL + "/uploads/" + paperFilePath);

                if (paper.getIsPublished() == true) {
                    paperResponse.setStatus("PUBLISHED");

                } else {
                    paperResponse.setStatus("DRAFT");
                }

                paperResponses.add(paperResponse);

                List<UploadPaperQuestion> paperQuestions = uploadPaperQuestionRepository.findByUplaodPaperAndStatusOrderByQuestionKeyAsc(paper, 2);
                List<QuestionPaperInstructorTutorResponse> questionResponses = new ArrayList<>();
                Integer startingNumber = paper.getStartingQuestionNumber() != null ? paper.getStartingQuestionNumber() : 1;
                Integer questionCount = startingNumber - 1;
                for(UploadPaperQuestion paperQuestion : paperQuestions){
                    QuestionPaperInstructorTutorResponse questionResponse = new QuestionPaperInstructorTutorResponse();
                    List<UploadPaperQuestionSubQuestion> subQuestions = uploadPaperQuestionSubQuestionRepository.findByUploadPaperQuestionAndStatusOrderByQuestionKeyAsc(paperQuestion, 2);
                    questionCount++;
                    if (subQuestions.size()==0) {
                        
                        questionResponse.setId(paperQuestion.getUploadPaperQuestionSeq().toString());
                        questionResponse.setMainQuestionSeq(paperQuestion.getUploadPaperQuestionSeq());
                        questionResponse.setQuestion_label("Q" + questionCount.toString());
                        questionResponse.setParent_label(null);
                        questionResponse.setMax_marks(paperQuestion.getMarks());
                        questionResponse.setDisplay_order(paperQuestion.getQuestionKey());
                        questionResponses.add(questionResponse);
                    }else{
                        Integer subQuestionCount = 0;
                        for(UploadPaperQuestionSubQuestion subQuestion : subQuestions){
                            QuestionPaperInstructorTutorResponse subQuestionResponse = new QuestionPaperInstructorTutorResponse();
                            subQuestionCount++;
                            subQuestionResponse.setId(paperQuestion.getUploadPaperQuestionSeq().toString() + "-" + subQuestion.getUploadPaperQuestionSubQuestionSeq().toString());
                            subQuestionResponse.setSubQuestionSeq(subQuestion.getUploadPaperQuestionSubQuestionSeq());
                            subQuestionResponse.setMainQuestionSeq(paperQuestion.getUploadPaperQuestionSeq());
                            subQuestionResponse.setQuestion_label("Q" + questionCount.toString()+"(" + subQuestionCount.toString() + ")");
                            subQuestionResponse.setParent_label("Q" + questionCount.toString());
                            subQuestionResponse.setMax_marks(subQuestion.getMark());
                            subQuestionResponse.setDisplay_order(subQuestion.getQuestionKey());
                            questionResponses.add(subQuestionResponse);
                        }
                    }


                    
                }
                paperResponse.setQuestions(questionResponses);

                List<PaperSubmission> paperSubmissions = paperSubmissionRepository.findByUplaodpaperAndStatusSeq(paper, 2);
                List<SubmissionPaperInstructorTutorResponse> submissionResponses = new ArrayList<>();
                for(PaperSubmission submission : paperSubmissions){
                    SubmissionPaperInstructorTutorResponse submissionResponse = new SubmissionPaperInstructorTutorResponse();
                    submissionResponse.setId(submission.getPaperSubmissionSeq().toString());
                    submissionResponse.setStudent_name(submission.getStudent().getFirstName() + " " + submission.getStudent().getLastName());
                    submissionResponse.setStudent_number(submission.getStudent().getStudentNo() != null
                        ? submission.getStudent().getStudentNo().toString()
                        : null);
                    submissionResponse.setSubmitted_at(submission.getSubmissionDate());
                    submissionResponse.setGraded(submission.isGraded());
                    submissionResponse.setGraded_at(submission.getGradedDate());
                    // submissionFilePath is already stored as a root-relative path
                    // (e.g. "/uploads/answer_sheets/xxx.pdf") by FileStorageService.saveAnswerSheet,
                    // so it only needs the backend origin, not another "/uploads/" prefix.
                    submissionResponse.setFile_url(submission.getSubmissionFilePath() != null
                            ? FILE_SERVER_BASE_URL + submission.getSubmissionFilePath()
                            : null);
                    
                    submissionResponses.add(submissionResponse);

                    submissionGradeSummaryService.applyGradeSummary(submissionResponse, submission);
                }

                paperResponse.setSubmissions(submissionResponses);

            }

            classResponse.setPapers(paperResponses);

            classResponseList.add(classResponse);
        }

        return classResponseList;
    }

    @Override
    public GeneralResponse uploadPapers(PaperUploadRequest paperUploadRequest, Integer classId,
            MultipartFile pdf_file) {
        ObjectMapper mapper = new ObjectMapper();
        List<QuestionRequestDTO> questions = mapper.readValue(
                paperUploadRequest.getQuestions(),
                new TypeReference<List<QuestionRequestDTO>>() {
                });

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        GeneralResponse response = new GeneralResponse();
        Classes classes = classesRepository.findByClassSeqAndStatus(classId, 2);
        System.out.println(classId);
        if (classes == null) {
            response.setMessage("Class not found");
            response.setIsSuccess(false);

            return response;
        }

        ClassPaymentRecord classPaymentRecord = monthlyPaymentService.getOrCreateClassPaymentRecord(classes,
                paperUploadRequest.getMonth(), paperUploadRequest.getYear(), username);

        // save to local storage.
        String fileName = fileStorageService.savePaperFile(pdf_file);

        UplaodPaper uploadPaper = new UplaodPaper();
        uploadPaper.setPaperName(paperUploadRequest.getPaper_name());
        uploadPaper.setMonth(paperUploadRequest.getMonth().toString());
        uploadPaper.setYear(paperUploadRequest.getYear().toString());
        // uploadPaper.setNoOfQuestions(paperUploadRequest.getNumber_of_questions());
        uploadPaper.setCreatedBy(username);
        uploadPaper.setLastModifiedBy(username);
        uploadPaper.setFileName(fileName);
        uploadPaper.setFilePath("papers/" + fileName);
        uploadPaper.setCreatedDateTime(LocalDateTime.now());

        uploadPaper.setLastModifiedDateTime(LocalDateTime.now());
        uploadPaper.setStatus(2);
        uploadPaper.setIsPublished(!"DRAFT".equals(paperUploadRequest.getStatus()));
    
        if (paperUploadRequest.getStatus() == "DRAFT") {

            uploadPaper.setIsPublished(false);

        } else {

            uploadPaper.setIsPublished(true);
        }

        uploadPaper.setDueDate(parseDueDate(paperUploadRequest.getDue_date()));
        uploadPaper.setDurationMinutes(paperUploadRequest.getDuration_minutes());

        uploadPaper.setClasses(classes);
        uploadPaper.setClassPaymentRecord(classPaymentRecord);

        uploadPaperRepository.save(uploadPaper);
        System.out.println("Paper uploaded successfully");

        Integer numberOfQuetions = insertPaperQuestions(uploadPaper, questions, username);

        uploadPaper.setNoOfQuestions(numberOfQuetions);

        uploadPaper.setStartingQuestionNumber(
            paperUploadRequest.getStarting_question_number() != null 
                ? paperUploadRequest.getStarting_question_number() 
                : 1
        );
        uploadPaperRepository.save(uploadPaper);

        response.setMessage("Paper uploaded successfully");
        response.setIsSuccess(true);


        return response;
    }

    // Persists the given question structure against the paper, one UploadPaperQuestion
    // (+ optional UploadPaperQuestionSubQuestion rows) per entry. Shared by the initial
    // paper upload and the paper-edit flow (which soft-deletes the old structure first).
    private Integer insertPaperQuestions(UplaodPaper uploadPaper, List<QuestionRequestDTO> questions,
            String username) {
        Integer numberOfQuetions = 0;
        for (QuestionRequestDTO question : questions) {
            UploadPaperQuestion uploadPaperQuestion = new UploadPaperQuestion();
            numberOfQuetions++;
            uploadPaperQuestion.setMarks(question.getMarks());
            uploadPaperQuestion.setQuestionKey(question.getKey());
            uploadPaperQuestion.setUplaodPaper(uploadPaper);
            uploadPaperQuestion.setStatus(2);
            uploadPaperQuestion.setCreatedDateTime(LocalDateTime.now());
            uploadPaperQuestion.setLastModifiedDateTime(LocalDateTime.now());
            uploadPaperQuestion.setCreatedBy(username);
            uploadPaperQuestion.setLastModifiedBy(username);

            uploadPaperQuestionRepository.save(uploadPaperQuestion);

            Integer totalSubQuestionMarks = 0;
            for (SubQuestionRequestDTO subpart : question.getSubparts()) {
                UploadPaperQuestionSubQuestion uploadPaperQuestionSubQuestion = new UploadPaperQuestionSubQuestion();

                uploadPaperQuestionSubQuestion.setMark(subpart.getMarks());
                totalSubQuestionMarks = totalSubQuestionMarks + subpart.getMarks();
                uploadPaperQuestionSubQuestion.setQuestionKey(subpart.getKey());
                uploadPaperQuestionSubQuestion.setUploadPaperQuestion(uploadPaperQuestion);
                uploadPaperQuestionSubQuestion.setStatus(2);
                uploadPaperQuestionSubQuestion.setCreatedDateTime(LocalDateTime.now());
                uploadPaperQuestionSubQuestion.setLastModifiedDateTime(LocalDateTime.now());
                uploadPaperQuestionSubQuestion.setCreatedBy(username);
                uploadPaperQuestionSubQuestion.setLastModifiedBy(username);

                uploadPaperQuestionSubQuestionRepository.save(uploadPaperQuestionSubQuestion);
            }
            if (uploadPaperQuestion.getMarks() == null) {
                uploadPaperQuestion.setMarks(totalSubQuestionMarks);
                uploadPaperQuestionRepository.save(uploadPaperQuestion);
            }
        }
        return numberOfQuetions;
    }

    @Override
    public GeneralResponse editPaper(Integer paperId, PaperUploadRequest paperUploadRequest,
            MultipartFile pdf_file) {
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);

        UplaodPaper paper = uploadPaperRepository.findByUploadPaperSeq(paperId);
        if (paper == null) {
            response.setIsSuccess(false);
            response.setMessage("Paper not found");
            return response;
        }

        Tutor owningTutor = paper.getClasses().getTutor();
        if (tutor == null || owningTutor == null || !owningTutor.getTutorSeq().equals(tutor.getTutorSeq())) {
            response.setIsSuccess(false);
            response.setMessage("You are not authorized to edit this paper");
            return response;
        }

        // A paper's question structure is load-bearing for every submission and grade
        // already tied to it, so once a student has submitted against it, it can no
        // longer be edited — this mirrors the same rule enforced on the Edit button
        // in the UI, but here it's the actual guarantee, not just a UI hint.
        List<PaperSubmission> existingSubmissions = paperSubmissionRepository.findByUplaodpaperAndStatusSeq(paper, 2);
        if (!existingSubmissions.isEmpty()) {
            response.setIsSuccess(false);
            response.setMessage("This paper already has submissions and can no longer be edited");
            return response;
        }

        List<QuestionRequestDTO> questions;
        try {
            ObjectMapper mapper = new ObjectMapper();
            questions = mapper.readValue(paperUploadRequest.getQuestions(),
                    new TypeReference<List<QuestionRequestDTO>>() {
                    });
        } catch (Exception e) {
            response.setIsSuccess(false);
            response.setMessage("Invalid question structure");
            return response;
        }

        paper.setPaperName(paperUploadRequest.getPaper_name());
        paper.setMonth(paperUploadRequest.getMonth().toString());
        paper.setYear(paperUploadRequest.getYear().toString());
        paper.setIsPublished(!"DRAFT".equals(paperUploadRequest.getStatus()));
        paper.setLastModifiedBy(username);
        paper.setLastModifiedDateTime(LocalDateTime.now());
        paper.setDueDate(parseDueDate(paperUploadRequest.getDue_date()));
        paper.setDurationMinutes(paperUploadRequest.getDuration_minutes());

        if (pdf_file != null && !pdf_file.isEmpty()) {
            String fileName = fileStorageService.savePaperFile(pdf_file);
            paper.setFileName(fileName);
            paper.setFilePath("papers/" + fileName);
        }

        // Safe to wholesale replace the question structure: we've already confirmed
        // there are no submissions relying on the old one. Superseded rather than
        // hard-deleted, consistent with how every other soft-delete works here.
        List<UploadPaperQuestion> oldQuestions = uploadPaperQuestionRepository
                .findByUplaodPaperAndStatusOrderByQuestionKeyAsc(paper, 2);
        for (UploadPaperQuestion oldQuestion : oldQuestions) {
            List<UploadPaperQuestionSubQuestion> oldSubQuestions = uploadPaperQuestionSubQuestionRepository
                    .findByUploadPaperQuestionAndStatusOrderByQuestionKeyAsc(oldQuestion, 2);
            for (UploadPaperQuestionSubQuestion oldSubQuestion : oldSubQuestions) {
                oldSubQuestion.setStatus(1);
                uploadPaperQuestionSubQuestionRepository.save(oldSubQuestion);
            }
            oldQuestion.setStatus(1);
            uploadPaperQuestionRepository.save(oldQuestion);
        }

        Integer numberOfQuetions = insertPaperQuestions(paper, questions, username);
        paper.setNoOfQuestions(numberOfQuetions);
        uploadPaperRepository.save(paper);

        response.setIsSuccess(true);
        response.setMessage("Paper updated successfully");
        return response;
    }

    @Override
    public GeneralResponse updateClass(Integer classId, ClassRequest classRequest) {
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Classes classes = classesRepository.findByClassSeqAndStatus(classId, 2);

        if (classes == null) {
            response.setIsSuccess(false);
            response.setMessage("Class not found");
            return response;
        }

        classes.setDisplayName(classRequest.getDisplay_name());
        classes.setDescription(classRequest.getDescription());
        classes.setMonthlyFee(classRequest.getMonthly_fee());
        classes.setSubjectName(classRequest.getSubject_name());
        classes.setLastModifiedBy(username);
        classes.setLastModifiedDateTime(LocalDateTime.now());

        classesRepository.save(classes);
        response.setMessage("Class updated successfully");
        response.setIsSuccess(true);
        return response;
    }

    @Override
    public GeneralResponse toggleClassStatus(Integer classId) {
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Classes classes = classesRepository.findById(classId).orElse(null);
        if (classes == null) {
            response.setIsSuccess(false);
            response.setMessage("Class not found");
            return response;
        }

        if (classes.getStatus() == 2) {
            classes.setStatus(1);
            response.setMessage("Class marked as inactive");
        } else {
            classes.setStatus(2);
            response.setMessage("Class marked as active");
        }

        classes.setLastModifiedBy(username);
        classes.setLastModifiedDateTime(LocalDateTime.now());
        classesRepository.save(classes);

        response.setIsSuccess(true);
        return response;
    }

    @Override
    public GeneralResponse togglePaperPublishStatus(Integer paperId) {
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);

        UplaodPaper paper = uploadPaperRepository.findByUploadPaperSeq(paperId);
        if (paper == null) {
            response.setIsSuccess(false);
            response.setMessage("Paper not found");
            return response;
        }

        Tutor owningTutor = paper.getClasses().getTutor();
        if (tutor == null || owningTutor == null || !owningTutor.getTutorSeq().equals(tutor.getTutorSeq())) {
            response.setIsSuccess(false);
            response.setMessage("You are not authorized to change this paper's status");
            return response;
        }

        boolean nowPublished = !Boolean.TRUE.equals(paper.getIsPublished());
        paper.setIsPublished(nowPublished);
        paper.setLastModifiedBy(username);
        paper.setLastModifiedDateTime(LocalDateTime.now());
        uploadPaperRepository.save(paper);

        response.setIsSuccess(true);
        response.setMessage(nowPublished ? "Paper published" : "Paper unpublished");
        return response;
    }

    @Override
    public GeneralResponse deletePaper(Integer paperId) {
        GeneralResponse response = new GeneralResponse();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);

        UplaodPaper paper = uploadPaperRepository.findByUploadPaperSeq(paperId);
        if (paper == null) {
            response.setIsSuccess(false);
            response.setMessage("Paper not found");
            return response;
        }

        Tutor owningTutor = paper.getClasses().getTutor();
        if (tutor == null || owningTutor == null || !owningTutor.getTutorSeq().equals(tutor.getTutorSeq())) {
            response.setIsSuccess(false);
            response.setMessage("You are not authorized to delete this paper");
            return response;
        }

        paper.setStatus(1); // soft delete
        paper.setLastModifiedBy(username);
        paper.setLastModifiedDateTime(LocalDateTime.now());
        uploadPaperRepository.save(paper);

        response.setIsSuccess(true);
        response.setMessage("Paper deleted successfully");
        return response;
    }

    @Override
    public GeneralResponse gradeSubmission(SubmitGradeResponse submitGradeResponse) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);

        GeneralResponse response = new GeneralResponse();

        PaperSubmission paperSubmission = paperSubmissionRepository
                .findByPaperSubmissionSeq(submitGradeResponse.getSubmissionId());
        if (paperSubmission == null) {
            response.setIsSuccess(false);
            response.setMessage("Paper submission not found. Contact a system administrator");
            return response;
        }

        Tutor owningTutor = paperSubmission.getUplaodpaper().getClasses().getTutor();
        if (tutor == null || owningTutor == null || !owningTutor.getTutorSeq().equals(tutor.getTutorSeq())) {
            response.setIsSuccess(false);
            response.setMessage("You are not authorized to grade this submission");
            return response;
        }

        GradeSubmission gradeSubmission = new GradeSubmission();
        gradeSubmission.setCreatedBy(username);
        gradeSubmission.setLastModifiedBy(username);
        gradeSubmission.setGrardedBy(username);
        gradeSubmission.setCreatedAt(LocalDateTime.now());
        gradeSubmission.setLastModifiedAt(LocalDateTime.now());
        gradeSubmission.setGradedAt(LocalDateTime.now());
        gradeSubmission.setPaperSubmission(paperSubmission);
        gradeSubmission.setMaxMarks(submitGradeResponse.getMaxMarks());
        gradeSubmission.setGrade(submitGradeResponse.getGrade());
        gradeSubmission.setTotalMarks(submitGradeResponse.getTotalMarks());
        gradeSubmission.setStatus(2); // make the record Approved status

        gradeSubmissionRepository.save(gradeSubmission);

        for (SubmitGradeQuestionsResponse submitGradeQuestionsResponse : submitGradeResponse.getQuestions()) {
            GradeSubmissionQuestion gradeSubmissionQuestion = buildGradeSubmissionQuestion(gradeSubmission,
                    submitGradeQuestionsResponse);
            if (gradeSubmissionQuestion == null) {
                response.setIsSuccess(false);
                response.setMessage("Question not found. Contact a system administrator");

                gradeSubmission.setStatus(1); // make the record open status
                gradeSubmissionRepository.save(gradeSubmission);

                return response;
            }

            gradeSubmissionQuestionRepository.save(gradeSubmissionQuestion);
        }

        paperSubmission.setGraded(true);
        paperSubmission.setGradedDate(LocalDateTime.now());
        paperSubmissionRepository.save(paperSubmission);

        response.setIsSuccess(true);
        response.setMessage("Grading submitted successfully");
        return response;
    }

    @Override
    public GeneralResponse editSubmissionGrade(SubmitGradeResponse submitGradeResponse) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);

        GeneralResponse response = new GeneralResponse();

        PaperSubmission paperSubmission = paperSubmissionRepository
                .findByPaperSubmissionSeq(submitGradeResponse.getSubmissionId());
        if (paperSubmission == null) {
            response.setIsSuccess(false);
            response.setMessage("Paper submission not found. Contact a system administrator");
            return response;
        }

        Tutor owningTutor = paperSubmission.getUplaodpaper().getClasses().getTutor();
        if (tutor == null || owningTutor == null || !owningTutor.getTutorSeq().equals(tutor.getTutorSeq())) {
            response.setIsSuccess(false);
            response.setMessage("You are not authorized to edit this submission's grade");
            return response;
        }

        return gradeEditService.editGrade(paperSubmission, submitGradeResponse, username);
    }

    @Override
    public List<RegradeRequestResponse> getPendingRegradeRequests() {
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        if (tutor == null) {
            return new ArrayList<>();
        }

        return regradeRequestQueryService.getPendingForTutors(List.of(tutor));
    }

    @Override
    public RegradeRequestResponse getRegradeRequestById(Integer regradeRequestSeq) {
        Integer tutorSeq = (Integer) request.getAttribute("userId");
        Tutor tutor = tutorRepository.findByTutorSeq(tutorSeq);
        if (tutor == null) {
            return null;
        }

        return regradeRequestQueryService.getByIdForTutors(regradeRequestSeq, List.of(tutor));
    }

    private GradeSubmissionQuestion buildGradeSubmissionQuestion(GradeSubmission gradeSubmission,
            SubmitGradeQuestionsResponse submitGradeQuestionsResponse) {
        GradeSubmissionQuestion gradeSubmissionQuestion = new GradeSubmissionQuestion();
        gradeSubmissionQuestion.setGradeSubmission(gradeSubmission);
        gradeSubmissionQuestion.setComment(submitGradeQuestionsResponse.getComment());
        gradeSubmissionQuestion.setMarksAwarded(submitGradeQuestionsResponse.getMarksAwarded());
        gradeSubmissionQuestion.setStatus(2); // make the record Approved status

        if (Boolean.TRUE.equals(submitGradeQuestionsResponse.getIsSubQuestion())) {
            UploadPaperQuestionSubQuestion subQuestion = uploadPaperQuestionSubQuestionRepository
                    .findByUploadPaperQuestionSubQuestionSeq(submitGradeQuestionsResponse.getSubquestionSeq());
            if (subQuestion == null) {
                return null;
            }

            gradeSubmissionQuestion.setIsSubQuestion(true);
            gradeSubmissionQuestion.setUploadPaperQuestionSubQuestion(subQuestion);
            gradeSubmissionQuestion.setUploadPaperQuestion(subQuestion.getUploadPaperQuestion());
        } else {
            UploadPaperQuestion question = uploadPaperQuestionRepository
                    .findByUploadPaperQuestionSeq(submitGradeQuestionsResponse.getMainQuestionSeq());
            if (question == null) {
                return null;
            }

            gradeSubmissionQuestion.setUploadPaperQuestion(question);
            gradeSubmissionQuestion.setIsSubQuestion(false);
        }

        return gradeSubmissionQuestion;
    }
}
