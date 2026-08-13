package com.kakeipocket.KakeiPocket.dto.Category;

import com.kakeipocket.KakeiPocket.enums.TransactionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private TransactionType type;
    private String icon;
    private String color;
    private Boolean isDefault;
    private String createdAt;
    private String updatedAt;
}
