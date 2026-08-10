package com.kakeipocket.KakeiPocket.dto.Authentication.Response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterResponseDTO {

    private Long id;
    private String fullName;
    private String email;
}