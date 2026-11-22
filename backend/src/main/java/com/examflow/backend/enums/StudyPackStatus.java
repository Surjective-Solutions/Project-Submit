package com.examflow.backend.enums;

// Where a study pack is in its life, stored as a number in study_pack.status. Never change a number once packs are
// saved.
//
// DRAFT: saved but not on sale. This is what every teacher save and every admin "Save draft" gives.
// PUBLISHED: on sale. Only an admin can publish.
// EXPIRED: was on sale and no longer is (set by an admin or when the pack's end date passes).
// DELETED: removed. The row stays so that purchases made earlier keep working.
public enum StudyPackStatus {

    DELETED(0, "deleted"),
    DRAFT(1, "draft"),
    PUBLISHED(2, "published"),
    EXPIRED(3, "expired");

    private final int sequence;
    private final String value;

    StudyPackStatus(int sequence, String value) {
        this.sequence = sequence;
        this.value = value;
    }

    // The number stored in the database.
    public int getSequence() {
        return sequence;
    }

    // The lower case word the pages use.
    public String getValue() {
        return value;
    }

    // Null when the number is not a status.
    public static StudyPackStatus fromSequence(Integer sequence) {
        if (sequence == null) {
            return null;
        }
        for (StudyPackStatus status : values()) {
            if (status.sequence == sequence) {
                return status;
            }
        }
        return null;
    }
}
