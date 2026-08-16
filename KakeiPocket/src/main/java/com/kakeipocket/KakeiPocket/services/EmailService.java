package com.kakeipocket.KakeiPocket.services;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetOtp(
            String email,
            String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "KakeiPocket - OTP Reset Password"
        );

        message.setText(
                "Xin chào,\n\n"
                + "Mã OTP để đặt lại mật khẩu KakeiPocket của bạn là:\n\n"
                + otp
                + "\n\n"
                + "Mã OTP có hiệu lực trong 5 phút."
                + "\n\n"
                + "Không chia sẻ mã OTP này cho bất kỳ ai."
                + "\n\n"
                + "Nếu bạn không yêu cầu đặt lại mật khẩu, "
                + "vui lòng bỏ qua email này."
                + "\n\n"
                + "KakeiPocket"
        );

        mailSender.send(message);
    }
}
