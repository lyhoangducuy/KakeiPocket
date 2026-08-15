package com.kakeipocket.KakeiPocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PageResponse<T> {
    List<T> content;
    int page;
    int size;
    long totalElements;
    int totalPages;
    boolean last;

    public static <T> PageResponse<T> from(
            List<T> content,
            int page,
            int size,
            long totalElements
    ) {
        int totalPages = size > 0
                ? (int) Math.ceil(
                        (double) totalElements / (double) size)
                : 0;
        boolean last = page >= Math.max(totalPages - 1, 0);
        return PageResponse.<T>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .last(last)
                .build();
    }
}
