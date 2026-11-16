package com.examflow.backend.entity;

import com.examflow.backend.enums.SessionMode;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

// Stores the enum as its index in the database.
@Converter
public class SessionModeConverter implements AttributeConverter<SessionMode, Integer> {

    @Override
    public Integer convertToDatabaseColumn(SessionMode mode) {
        return mode == null ? null : mode.getIndex();
    }

    @Override
    public SessionMode convertToEntityAttribute(Integer index) {
        return SessionMode.fromIndex(index);
    }
}
