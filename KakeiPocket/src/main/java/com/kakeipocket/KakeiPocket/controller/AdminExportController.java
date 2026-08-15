package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.services.AdminExportService;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/admin/export")
public class AdminExportController {

    private static final String XLSX_CONTENT_TYPE =
            "application/vnd.openxmlformats-officedocument"
                    + ".spreadsheetml.sheet";

    AdminExportService adminExportService;

    @GetMapping("/users")
    public ResponseEntity<ByteArrayResource> exportUsers(
            HttpSession session
    ) throws IOException {
        byte[] bytes = adminExportService.exportUsers(session);
        return buildResponse(
                bytes,
                buildFilename("kakeipocket-users"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ByteArrayResource> exportTransactions(
            HttpSession session,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) TransactionType type
    ) throws IOException {
        byte[] bytes = adminExportService.exportTransactions(
                session, fromDate, toDate, userId, categoryId, type);
        return buildResponse(
                bytes,
                buildFilename("kakeipocket-transactions"));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ByteArrayResource> exportStatistics(
            HttpSession session
    ) throws IOException {
        byte[] bytes = adminExportService.exportStatistics(session);
        return buildResponse(
                bytes,
                buildFilename("kakeipocket-statistics"));
    }

    @GetMapping("/monthly-plans")
    public ResponseEntity<ByteArrayResource> exportMonthlyPlans(
            HttpSession session
    ) throws IOException {
        byte[] bytes = adminExportService.exportMonthlyPlans(session);
        return buildResponse(
                bytes,
                buildFilename("kakeipocket-monthly-plans"));
    }

    @GetMapping("/categories")
    public ResponseEntity<ByteArrayResource> exportCategories(
            HttpSession session
    ) throws IOException {
        byte[] bytes = adminExportService.exportCategories(session);
        return buildResponse(
                bytes,
                buildFilename("kakeipocket-categories"));
    }

    // ===========================================================
    // HELPERS
    // ===========================================================

    private ResponseEntity<ByteArrayResource> buildResponse(
            byte[] bytes, String filename
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(XLSX_CONTENT_TYPE));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("no-store");

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(bytes.length)
                .body(new ByteArrayResource(bytes));
    }

    private String buildFilename(String base) {
        return base + "-" + LocalDate.now() + ".xlsx";
    }
}