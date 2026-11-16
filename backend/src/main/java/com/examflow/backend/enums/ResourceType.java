package com.examflow.backend.enums;

// What a session resource is. The index is what is stored in the database, the value is what the admin
// page sends and shows, and the folder is where its files are kept. Never change an index once resources
// are saved.
public enum ResourceType {

    VIDEO(0, "video", "videos"),
    PAPER(1, "paper", "papers"),
    ANSWERS(2, "answers", "answer_sheets"),
    NOTES(3, "notes", "notes"),
    OTHER(4, "other", "other");

    private final int index;
    private final String value;
    private final String folder;

    ResourceType(int index, String value, String folder) {
        this.index = index;
        this.value = value;
        this.folder = folder;
    }

    public int getIndex() {
        return index;
    }

    public String getValue() {
        return value;
    }

    public String getFolder() {
        return folder;
    }

    // Returns null when the value is not a resource type.
    public static ResourceType fromValue(String value) {
        for (ResourceType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        return null;
    }

    // Returns null when the index is not a resource type.
    public static ResourceType fromIndex(Integer index) {
        for (ResourceType type : values()) {
            if (index != null && type.index == index) {
                return type;
            }
        }
        return null;
    }
}
