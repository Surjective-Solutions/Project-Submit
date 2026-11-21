package com.examflow.backend.enums;

// The status of a student account, stored as a number in student.status.
//
// 2 (ACTIVE) and 1 (DEVICE_LOCKED) are the numbers the system already uses: 2 is what signup and the admin give a
// student, and 1 is what the one-device rule sets. Do not change them, or the students already in the database
// change meaning. The other numbers are new and only used once the code that sets them exists.
//
// Only ACTIVE students can log in. Every other status keeps the student's record and class enrolments.
public enum StudentStatus {

    DELETED(0, "Deleted"),
    DEVICE_LOCKED(1, "Locked: logged in from another device"),
    ACTIVE(2, "Active"),
    SUSPENDED(3, "Suspended by the institute"),
    GRADUATED(4, "Graduated"),
    LEFT(5, "Left the institute");

    private final Integer statusSeq;
    private final String statusDescription;

    StudentStatus(Integer statusSeq, String statusDescription) {
        this.statusSeq = statusSeq;
        this.statusDescription = statusDescription;
    }

    public int getSequence() {
        return statusSeq;
    }

    public String getStatusDescription() {
        return statusDescription;
    }

    // Can this student log in and use the system?
    public boolean canLogin() {
        return this == ACTIVE;
    }

    // The status for the number stored in the database; null for a missing or unknown number.
    public static StudentStatus fromSequence(Integer sequence) {
        if (sequence == null) {
            return null;
        }
        for (StudentStatus status : values()) {
            if (status.statusSeq.equals(sequence)) {
                return status;
            }
        }
        return null;
    }
}
