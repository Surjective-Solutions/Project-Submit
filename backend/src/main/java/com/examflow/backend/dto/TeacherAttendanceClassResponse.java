package com.examflow.backend.dto;

// A class of the teacher that a student is enrolled in, as the attendance page lists it. weekday is 0-6 (Sunday = 0)
// and startTime is "HH:mm"; both come from the class's latest session and are null when it has none.
public class TeacherAttendanceClassResponse {

    private String name;
    private String tutor;
    private Integer weekday;
    private String startTime;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTutor() {
        return tutor;
    }

    public void setTutor(String tutor) {
        this.tutor = tutor;
    }

    public Integer getWeekday() {
        return weekday;
    }

    public void setWeekday(Integer weekday) {
        this.weekday = weekday;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
}
