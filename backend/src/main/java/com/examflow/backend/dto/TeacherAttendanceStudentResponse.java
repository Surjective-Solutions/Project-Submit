package com.examflow.backend.dto;

import java.util.List;

// The student card of the teacher's Attendance page. id is the printed student number (what the card's barcode
// holds). There is no address or any other private detail, and enrolledClasses are this teacher's classes only.
// enrolledSince is "YYYY-MM-DD": the day the student joined the teacher's first class.
public class TeacherAttendanceStudentResponse {

    private String id;
    private String name;
    private String initials;
    private String phone;
    private String grade;
    private String enrolledSince;
    private List<TeacherAttendanceClassResponse> enrolledClasses;

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

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getEnrolledSince() {
        return enrolledSince;
    }

    public void setEnrolledSince(String enrolledSince) {
        this.enrolledSince = enrolledSince;
    }

    public List<TeacherAttendanceClassResponse> getEnrolledClasses() {
        return enrolledClasses;
    }

    public void setEnrolledClasses(List<TeacherAttendanceClassResponse> enrolledClasses) {
        this.enrolledClasses = enrolledClasses;
    }
}
