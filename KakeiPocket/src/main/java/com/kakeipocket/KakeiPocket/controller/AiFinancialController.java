package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.AiFinancial.AiFinancialAnalysisResponse;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.services.ai.AiFinancialService;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(
        level = lombok.AccessLevel.PRIVATE,
        makeFinal = true
)
@RequestMapping("/api/ai")
public class AiFinancialController {

    AiFinancialService aiFinancialService;

    @PostMapping("/financial-analysis")
    public ApiResponse<AiFinancialAnalysisResponse> analyze(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestBody(required = false) AiQuestionPayload body,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String question = (body != null) ? body.getQuestion() : null;

        return ApiResponse.success(
                aiFinancialService.analyze(
                        userId, year, month, question
                )
        );
    }

    public static class AiQuestionPayload {
        private String question;

        public String getQuestion() {
            return question;
        }

        public void setQuestion(String question) {
            this.question = question;
        }
    }
}