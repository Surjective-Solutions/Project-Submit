package com.examflow.backend.entity;

import com.examflow.backend.enums.StudyPackStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

// Stores the enum as its number in study_pack.status.
@Converter
public class StudyPackStatusConverter implements AttributeConverter<StudyPackStatus, Integer> {

    @Override
    public Integer convertToDatabaseColumn(StudyPackStatus status) {
        return status == null ? null : status.getSequence();
    }

    @Override
    public StudyPackStatus convertToEntityAttribute(Integer sequence) {
        return StudyPackStatus.fromSequence(sequence);
    }
}
