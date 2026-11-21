package com.examflow.backend.enums;

// How an attendance record was made, stored as a number in student_class_session_attendance.method_seq.
// Never change a number once records are saved.
public enum AttendanceMethod {

    BARCODE(1, "Student card scanned"),
    PHONE(2, "Found by phone number"),
    MANUAL(3, "Entered by staff"),
    ONLINE(4, "Joined the online session");

    private final Integer statusSeq;
    private final String statusDescription;

    AttendanceMethod(Integer statusSeq, String statusDescription) {
        this.statusSeq = statusSeq;
        this.statusDescription = statusDescription;
    }

    public int getSequence() {
        return statusSeq;
    }

    public String getStatusDescription() {
        return statusDescription;
    }

    // The method for the number stored in the database; null for a missing or unknown number.
    public static AttendanceMethod fromSequence(Integer sequence) {
        if (sequence == null) {
            return null;
        }
        for (AttendanceMethod method : values()) {
            if (method.statusSeq.equals(sequence)) {
                return method;
            }
        }
        return null;
    }
}
