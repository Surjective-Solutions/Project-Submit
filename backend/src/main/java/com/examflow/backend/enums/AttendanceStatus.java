package com.examflow.backend.enums;

// What a student's attendance of one class session is. It is worked out from the scans and never stored, so
// changing the grace period corrects the old records too.
//
// PRESENT: the first scan is at or before ON_TIME_MINUTES after the session starts.
// LATE: the first scan is later than that.
// ABSENT: no scan at all.
public enum AttendanceStatus {

    PRESENT("present"),
    LATE("late"),
    ABSENT("absent");

    // The attendance page shows a scan up to this many minutes after the start as on time.
    public static final int ON_TIME_MINUTES = 10;

    private final String value;

    AttendanceStatus(String value) {
        this.value = value;
    }

    // The lower case word the attendance page expects.
    public String getValue() {
        return value;
    }
}
