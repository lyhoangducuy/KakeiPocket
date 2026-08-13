package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.Authentication.Request.LoginRequestDTO;
import com.kakeipocket.KakeiPocket.dto.Authentication.Request.RegisterRequestDTO;
import com.kakeipocket.KakeiPocket.dto.Authentication.Response.LoginResponseDTO;
import com.kakeipocket.KakeiPocket.dto.Authentication.Response.RegisterResponseDTO;
import com.kakeipocket.KakeiPocket.entity.Role;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.repository.AuthenticationRepository;
import com.kakeipocket.KakeiPocket.repository.RoleRepository;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    AuthenticationRepository authenticationRepository;

    RoleRepository roleRepository;

    PasswordEncoder passwordEncoder;

    // =========================
    // LOGIN
    // =========================

    public LoginResponseDTO login(
            LoginRequestDTO request,
            HttpSession session) {

        if (request == null) {
            throw new AppException(
                    ErrorCode.INVALID_REQUEST);
        }

        // Kiểm tra session hiện tại
        Long currentUserId = (Long) session.getAttribute("userId");

        if (currentUserId != null) {

            User currentUser = authenticationRepository
                    .findById(currentUserId)
                    .orElse(null);

            if (currentUser != null) {

                if (currentUser.getEmail()
                        .equalsIgnoreCase(
                                request.getEmail())) {

                    throw new AppException(
                            ErrorCode.ALREADY_LOGGED_IN);
                }

                throw new AppException(
                        ErrorCode.SESSION_ALREADY_LOGGED_IN);
            }
        }

        // Tìm user
        User user = authenticationRepository
                .findByEmail(
                        request.getEmail())
                .orElseThrow(() -> new AppException(
                        ErrorCode.USER_NOT_FOUND));

        // Kiểm tra password bằng BCrypt
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new AppException(
                    ErrorCode.USERNAME_OR_PASSWORD_INVALID);
        }

        // Lấy role name
        String roles = user.getRole().getName();

        // Lưu ID vào session
        session.setAttribute(
                "userId",
                user.getId());

        // Lưu role name vào session
        session.setAttribute(
                "roles",
                roles);

        return LoginResponseDTO.builder()
                .email(user.getEmail())
                .roles(roles)
                .build();
    }
public LoginResponseDTO getCurrentUser(
        HttpSession session) {

    Long userId =
            (Long) session.getAttribute("userId");

    if (userId == null) {
        throw new AppException(
                ErrorCode.UNAUTHENTICATED
        );
    }

    User user =
            authenticationRepository
                    .findById(userId)
                    .orElseThrow(() ->
                            new AppException(
                                    ErrorCode.USER_NOT_FOUND
                            )
                    );

    return LoginResponseDTO.builder()
            .email(user.getEmail())
            .roles(user.getRole().getName())
            .build();
}
    // =========================
    // REGISTER
    // =========================
    public RegisterResponseDTO register(
            RegisterRequestDTO request) {

        if (request == null) {
            throw new AppException(
                    ErrorCode.INVALID_REQUEST);
        }

        // Email đã tồn tại
        if (authenticationRepository
                .findByEmail(request.getEmail())
                .isPresent()) {

            throw new AppException(
                    ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Password không giống confirm
        if (!request.getPassword()
                .equals(request.getConfirmPassword())) {

            throw new AppException(
                    ErrorCode.PASSWORD_NOT_MATCH);
        }

        // Lấy role USER
        Role userRole = roleRepository
                .findByName("USER")
                .orElseThrow(() -> new RuntimeException(
                        "USER role not found"));

        // Tạo User
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())

                // BCrypt
                .password(
                        passwordEncoder.encode(
                                request.getPassword()))

                // Mặc định USER
                .role(roleRepository.findByName("USER")
                        .orElseThrow(() -> new RuntimeException(
                                "USER role not found")))

                .build();

        user = authenticationRepository.save(user);

        return RegisterResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .build();
    }

    // =========================
    // LOGOUT
    // =========================

    public void logout(HttpSession session) {

        session.invalidate();
    }

    // =========================
    // CHECK ADMIN
    // =========================

    public boolean hasRole(
            HttpSession session,
            String requiredRole) {

        String role = (String) session.getAttribute("role");

        return requiredRole.equals(role);
    }

    public String forgotPassword(String email) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'forgotPassword'");
    }

    public void resetPassword(String token, String newPassword) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'resetPassword'");
    }

}