package com.kakeipocket.KakeiPocket.mapper;

import org.mapstruct.Mapper;

import com.kakeipocket.KakeiPocket.dto.Authentication.Response.LoginResponseDTO;

@Mapper(componentModel = "spring")
public interface UserMapper {
    LoginResponseDTO toLoginResponseDTO(String username);   
}
