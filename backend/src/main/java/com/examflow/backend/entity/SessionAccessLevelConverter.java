package com.examflow.backend.entity;

import com.examflow.backend.enums.SessionAccessLevel;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

// Stores the enum as its index in the database.
@Converter
public class SessionAccessLevelConverter implements AttributeConverter<SessionAccessLevel, Integer> {

    @Override
    public Integer convertToDatabaseColumn(SessionAccessLevel level) {
        return level == null ? null : level.getIndex();
    }

    @Override
    public SessionAccessLevel convertToEntityAttribute(Integer index) {
        return SessionAccessLevel.fromIndex(index);
    }
}
