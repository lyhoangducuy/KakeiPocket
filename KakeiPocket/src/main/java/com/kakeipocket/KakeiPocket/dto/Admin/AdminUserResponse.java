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
public class AdminUserResponse {
    Long id;
    String fullName;
    String email;
    String role;
    String status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
