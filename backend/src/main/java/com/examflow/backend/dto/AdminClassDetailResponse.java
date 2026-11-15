package com.examflow.backend.dto;

// What the admin class page shows at the top: the class, its tutor and the enrollment numbers.
public class AdminClassDetailResponse {

    private String id;

    private String tutorId;

    private String title;

    private String subject;

    private String description;

    private Integer batchYear;

    private String level;

    private String type;

    private String medium;

    private String paymentFormat;

    private Double price;

    private Double monthlyFee;

    private Integer enrolledCount;

    private Tutor tutor;

    private Enrollments enrollments;

    public static class Tutor {

        private String id;

        private String name;

        private String subject;

        private java.util.List<String> mediums;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public java.util.List<String> getMediums() {
            return mediums;
        }

        public void setMediums(java.util.List<String> mediums) {
            this.mediums = mediums;
        }
    }

    public static class Enrollments {

        private Integer total;

        private Integer paidThisMonth;

        private Integer free;

        public Integer getTotal() {
            return total;
        }

        public void setTotal(Integer total) {
            this.total = total;
        }

        public Integer getPaidThisMonth() {
            return paidThisMonth;
        }

        public void setPaidThisMonth(Integer paidThisMonth) {
            this.paidThisMonth = paidThisMonth;
        }

        public Integer getFree() {
            return free;
        }

        public void setFree(Integer free) {
            this.free = free;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTutorId() {
        return tutorId;
    }

    public void setTutorId(String tutorId) {
        this.tutorId = tutorId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getBatchYear() {
        return batchYear;
    }

    public void setBatchYear(Integer batchYear) {
        this.batchYear = batchYear;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMedium() {
        return medium;
    }

    public void setMedium(String medium) {
        this.medium = medium;
    }

    public String getPaymentFormat() {
        return paymentFormat;
    }

    public void setPaymentFormat(String paymentFormat) {
        this.paymentFormat = paymentFormat;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getMonthlyFee() {
        return monthlyFee;
    }

    public void setMonthlyFee(Double monthlyFee) {
        this.monthlyFee = monthlyFee;
    }

    public Integer getEnrolledCount() {
        return enrolledCount;
    }

    public void setEnrolledCount(Integer enrolledCount) {
        this.enrolledCount = enrolledCount;
    }

    public Tutor getTutor() {
        return tutor;
    }

    public void setTutor(Tutor tutor) {
        this.tutor = tutor;
    }

    public Enrollments getEnrollments() {
        return enrollments;
    }

    public void setEnrollments(Enrollments enrollments) {
        this.enrollments = enrollments;
    }
}
