package com.kakeipocket.KakeiPocket.dto.Admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AdminCategoryResponse {
    Long id;
    String name;
    String type;
    String icon;
    String color;
    Boolean isDefault;
    long usageCount;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
