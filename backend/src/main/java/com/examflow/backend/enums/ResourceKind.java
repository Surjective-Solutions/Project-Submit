package com.examflow.backend.enums;

// Whether a resource is an uploaded file or a link. The index is what is stored in the database; the
// value is what the admin page sends and shows. Never change an index once resources are saved.
public enum ResourceKind {

    FILE(0, "file"),
    LINK(1, "link");

    private final int index;
    private final String value;

    ResourceKind(int index, String value) {
        this.index = index;
        this.value = value;
    }

    public int getIndex() {
        return index;
    }

    public String getValue() {
        return value;
    }

    // Returns null when the value is not a resource kind.
    public static ResourceKind fromValue(String value) {
        for (ResourceKind kind : values()) {
            if (kind.value.equals(value)) {
                return kind;
            }
        }
        return null;
    }

    // Returns null when the index is not a resource kind.
    public static ResourceKind fromIndex(Integer index) {
        for (ResourceKind kind : values()) {
            if (index != null && kind.index == index) {
                return kind;
            }
        }
        return null;
    }
}
