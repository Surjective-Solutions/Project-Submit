package com.examflow.backend.entity;

import com.examflow.backend.enums.ResourceType;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

// Stores the resource type as its index in the database.
@Converter
public class ResourceTypeConverter implements AttributeConverter<ResourceType, Integer> {

    @Override
    public Integer convertToDatabaseColumn(ResourceType type) {
        return type == null ? null : type.getIndex();
    }

    @Override
    public ResourceType convertToEntityAttribute(Integer index) {
        return ResourceType.fromIndex(index);
    }
}
