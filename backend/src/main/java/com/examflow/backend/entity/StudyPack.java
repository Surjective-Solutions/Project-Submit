package com.examflow.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// A bundle of past class recordings a student can buy. The recordings themselves are never
// copied: each session of the pack is a StudyPackItem holding only the recording's code.
@Entity
@Table(name = "study_pack")
public class StudyPack {

    // study_pack.status — the row's lifecycle, the same values the rest of the app uses.
    public static final Integer STATUS_ACTIVE = 2;

    // validity_type — how long a student keeps access after buying.
    // "custom" is the only one that reads validity_days; "exam" ends on the grade's exam day.
    public static final String VALIDITY_CUSTOM = "custom";
    public static final String VALIDITY_EXAM = "exam";

    private Integer studyPackSeq;

    private String studyPackName;

    private String studyPackDescription;

    // file name of the cover inside the study_pack_covers upload folder, null when there is none
    private String studyPackImage;

    private Tutor tutor;

    // The class the recordings came from. Nothing fills this yet: the admin form picks a
    // teacher, grade and subject rather than one class. Kept nullable so a later Class
    // Recordings link can set it without a migration.
    private Classes classes;

    private String grade;

    private String subject;

    private Double studyPackPrice;

    private String validityType;

    // only set when validityType is "custom"
    private Integer validityDays;

    // The three cuts of every sale, in percent. They are stored as entered and always total 100.
    private Integer teacherSharePercentage;

    private Integer instituteSharePercentage;

    private Integer systemSharePercentage;

    // false while the pack is a draft; true once it is on sale
    private Boolean isPublished;

    // how many students have bought the pack
    private Integer soldCount;

    private Integer status;

    private LocalDateTime createdDateTime;

    private LocalDateTime lastModifiedDateTime;

    private String createdBy;

    private String lastModifiedBy;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "study_pack_seq")
    public Integer getStudyPackSeq() {
        return studyPackSeq;
    }

    public void setStudyPackSeq(Integer studyPackSeq) {
        this.studyPackSeq = studyPackSeq;
    }

    @Column(name = "study_pack_name")
    public String getStudyPackName() {
        return studyPackName;
    }

    public void setStudyPackName(String studyPackName) {
        this.studyPackName = studyPackName;
    }

    @Column(name = "study_pack_description", length = 1000)
    public String getStudyPackDescription() {
        return studyPackDescription;
    }

    public void setStudyPackDescription(String studyPackDescription) {
        this.studyPackDescription = studyPackDescription;
    }

    @Column(name = "study_pack_image")
    public String getStudyPackImage() {
        return studyPackImage;
    }

    public void setStudyPackImage(String studyPackImage) {
        this.studyPackImage = studyPackImage;
    }

    @ManyToOne
    @JoinColumn(name = "tutorSeq", nullable = true)
    public Tutor getTutor() {
        return tutor;
    }

    public void setTutor(Tutor tutor) {
        this.tutor = tutor;
    }

    @ManyToOne
    @JoinColumn(name = "class_seq", nullable = true)
    public Classes getClasses() {
        return classes;
    }

    public void setClasses(Classes classes) {
        this.classes = classes;
    }

    @Column(name = "grade")
    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    @Column(name = "subject")
    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    @Column(name = "study_pack_price")
    public Double getStudyPackPrice() {
        return studyPackPrice;
    }

    public void setStudyPackPrice(Double studyPackPrice) {
        this.studyPackPrice = studyPackPrice;
    }

    @Column(name = "validity_type")
    public String getValidityType() {
        return validityType;
    }

    public void setValidityType(String validityType) {
        this.validityType = validityType;
    }

    @Column(name = "validity_days")
    public Integer getValidityDays() {
        return validityDays;
    }

    public void setValidityDays(Integer validityDays) {
        this.validityDays = validityDays;
    }

    @Column(name = "teacher_share_percentage")
    public Integer getTeacherSharePercentage() {
        return teacherSharePercentage;
    }

    public void setTeacherSharePercentage(Integer teacherSharePercentage) {
        this.teacherSharePercentage = teacherSharePercentage;
    }

    @Column(name = "institute_share_percentage")
    public Integer getInstituteSharePercentage() {
        return instituteSharePercentage;
    }

    public void setInstituteSharePercentage(Integer instituteSharePercentage) {
        this.instituteSharePercentage = instituteSharePercentage;
    }

    @Column(name = "system_share_percentage")
    public Integer getSystemSharePercentage() {
        return systemSharePercentage;
    }

    public void setSystemSharePercentage(Integer systemSharePercentage) {
        this.systemSharePercentage = systemSharePercentage;
    }

    @Column(name = "is_published")
    public Boolean getIsPublished() {
        return isPublished;
    }

    public void setIsPublished(Boolean isPublished) {
        this.isPublished = isPublished;
    }

    @Column(name = "sold_count")
    public Integer getSoldCount() {
        return soldCount;
    }

    public void setSoldCount(Integer soldCount) {
        this.soldCount = soldCount;
    }

    @Column(name = "status")
    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
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

}
