package com.examflow.backend.enums;

// Who may open a class session. The index is what is stored in the database; the value is what the
// admin page sends and shows. Never change an index once sessions are saved.
public enum SessionAccessLevel {

    ALL(0, "all"),
    REGISTERED(1, "registered"),
    PAID(2, "paid");

    private final int index;
    private final String value;

    SessionAccessLevel(int index, String value) {
        this.index = index;
        this.value = value;
    }

    public int getIndex() {
        return index;
    }

    public String getValue() {
        return value;
    }

    // Returns null when the value is not an access level.
    public static SessionAccessLevel fromValue(String value) {
        for (SessionAccessLevel level : values()) {
            if (level.value.equals(value)) {
                return level;
            }
        }
        return null;
    }

    // Returns null when the index is not an access level.
    public static SessionAccessLevel fromIndex(Integer index) {
        for (SessionAccessLevel level : values()) {
            if (index != null && level.index == index) {
                return level;
            }
        }
        return null;
    }
}
