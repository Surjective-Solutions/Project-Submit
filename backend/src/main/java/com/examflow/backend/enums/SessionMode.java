package com.examflow.backend.enums;

// How a class session is held. The index is what is stored in the database; the value is what the
// admin page sends and shows. Never change an index once sessions are saved.
public enum SessionMode {

    ONLINE(0, "online"),
    PHYSICAL(1, "physical");

    private final int index;
    private final String value;

    SessionMode(int index, String value) {
        this.index = index;
        this.value = value;
    }

    public int getIndex() {
        return index;
    }

    public String getValue() {
        return value;
    }

    // Returns null when the value is not a session mode.
    public static SessionMode fromValue(String value) {
        for (SessionMode mode : values()) {
            if (mode.value.equals(value)) {
                return mode;
            }
        }
        return null;
    }

    // Returns null when the index is not a session mode.
    public static SessionMode fromIndex(Integer index) {
        for (SessionMode mode : values()) {
            if (index != null && mode.index == index) {
                return mode;
            }
        }
        return null;
    }
}
