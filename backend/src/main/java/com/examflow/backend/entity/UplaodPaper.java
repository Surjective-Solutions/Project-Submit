package com.examflow.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "upload_paper")
public class UplaodPaper {

    private Integer uploadPaperSeq;

    private String paperName;

    private String month;

    private String year;

    private Integer noOfQuestions;

    private Integer startingQuestionNumber;

    private Integer status;

    private Boolean isPublished;

    private String fileName;

    private String filePath;

    private Classes classes;

    private ClassPaymentRecord classPaymentRecord;

    private LocalDateTime createdDateTime;

    private LocalDateTime lastModifiedDateTime;

    private String createdBy;

    private String lastModifiedBy;

    private LocalDateTime dueDate;

    private Integer durationMinutes;

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(name = "upload_paper_seq")
    public Integer getUploadPaperSeq() {
        return uploadPaperSeq;
    }

    public void setUploadPaperSeq(Integer uploadPaperSeq) {
        this.uploadPaperSeq = uploadPaperSeq;
    }

    @Column(name = "paper_name")
    public String getPaperName() {
        return paperName;
    }

    public void setPaperName(String paperName) {
        this.paperName = paperName;
    }

    @Column(name = "month")
    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    @Column(name = "year")
    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    @Column(name = "noOfQuestions")
    public Integer getNoOfQuestions() {
        return noOfQuestions;
    }

    public void setNoOfQuestions(Integer noOfQuestions) {
        this.noOfQuestions = noOfQuestions;
    }

    @Column(name = "startingQuestionNumber")
    public Integer getStartingQuestionNumber() {
        return startingQuestionNumber;
    }

    public void setStartingQuestionNumber(Integer startingQuestionNumber) {
        this.startingQuestionNumber = startingQuestionNumber;
    }

    @Column(name = "status")
    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    @ManyToOne
    @JoinColumn(name = "class_seq", nullable = true)
    public Classes getClasses() {
        return classes;
    }

    public void setClasses(Classes classes) {
        this.classes = classes;
    }

    @Column(name = "createdDateTime")
    public LocalDateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(LocalDateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    @Column(name = "lastModifiedDateTime")
    public LocalDateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(LocalDateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    @Column(name = "createdBy")
    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    @Column(name = "lastModifiedBy")
    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    @Column(name = "isPublished")
    @NotNull
    public Boolean getIsPublished() {
        return isPublished;
    }

    public void setIsPublished(Boolean isPublished) {
        this.isPublished = isPublished;
    }

    @Column(name = "fileName")
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }


    @Column(name = "filePath")
    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    @ManyToOne
    @JoinColumn(name = "class_payment_record_seq", referencedColumnName = "classPaymentRecordSeq", nullable = true)
    public ClassPaymentRecord getClassPaymentRecord() {
        return classPaymentRecord;
    }

    public void setClassPaymentRecord(ClassPaymentRecord classPaymentRecord) {
        this.classPaymentRecord = classPaymentRecord;
    }

    @Column(name = "dueDate")
    public LocalDateTime getDueDate(){
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate){
        this.dueDate = dueDate;
    }

    @Column(name = "durationMinutes")
    public Integer getDurationMinutes(){
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes){
        this.durationMinutes = durationMinutes;
    }

}
