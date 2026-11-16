package com.examflow.backend.entity;

import com.examflow.backend.enums.ResourceKind;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

// Stores the resource kind as its index in the database.
@Converter
public class ResourceKindConverter implements AttributeConverter<ResourceKind, Integer> {

    @Override
    public Integer convertToDatabaseColumn(ResourceKind kind) {
        return kind == null ? null : kind.getIndex();
    }

    @Override
    public ResourceKind convertToEntityAttribute(Integer index) {
        return ResourceKind.fromIndex(index);
    }
}
