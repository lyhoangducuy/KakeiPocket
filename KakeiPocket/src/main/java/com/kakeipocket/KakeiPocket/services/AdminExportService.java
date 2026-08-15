package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminDashboardSummaryResponse;
import com.kakeipocket.KakeiPocket.entity.Category;
import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.Transaction;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.repository.AuthenticationRepository;
import com.kakeipocket.KakeiPocket.repository.CategoryRepository;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.TransactionRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;
import com.kakeipocket.KakeiPocket.repository.specification.CategorySpecification;
import com.kakeipocket.KakeiPocket.repository.specification.TransactionSpecification;
import com.kakeipocket.KakeiPocket.services.export.ExcelGenerator;
import com.kakeipocket.KakeiPocket.services.export.ExcelGenerator.SummaryEntry;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminExportService {

    private static final String ADMIN_ROLE = "ADMIN";
    private static final String SYSTEM_ADMIN_EMAIL =
            "system-admin@kakeipocket.local";

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;
    private final AuthenticationRepository authenticationRepository;
    private final AdminDashboardService adminDashboardService;
    private final AuthenticationService authenticationService;
    private final ExcelGenerator excelGenerator;

    // ===========================================================
    // USERS
    // ===========================================================
    @Transactional(readOnly = true)
    public byte[] exportUsers(HttpSession session) throws IOException {
        requireAdmin(session);

        List<User> users = userRepository.findAll(
                Sort.by(Sort.Direction.ASC, "id"));

        XSSFWorkbook wb = excelGenerator.createWorkbook();
        Sheet sheet = excelGenerator.createSheet(wb, "Users");
        String[] headers = {
                "ID", "Full Name", "Email",
                "Role", "Status", "Created At", "Updated At"
        };
        excelGenerator.writeHeaderRow(sheet, headers, 0);

        CellStyle textStyle = excelGenerator.textStyle(wb);
        CellStyle dateTimeStyle = excelGenerator.dateTimeStyle(wb);

        if (users.isEmpty()) {
            excelGenerator.writeEmptyRows(sheet, 1, 1);
        } else {
            int rowIndex = 1;
            for (User u : users) {
                Row row = sheet.createRow(rowIndex++);
                excelGenerator.writeLongCell(row, 0, u.getId(), textStyle);
                excelGenerator.writeTextCell(row, 1, u.getFullName(),
                        textStyle);
                excelGenerator.writeTextCell(row, 2, u.getEmail(),
                        textStyle);
                excelGenerator.writeTextCell(
                        row, 3,
                        u.getRole() != null ? u.getRole().getName()
                                : null,
                        textStyle);
                excelGenerator.writeTextCell(
                        row, 4,
                        u.getStatus() != null
                                ? u.getStatus().name() : null,
                        textStyle);
                excelGenerator.writeDateTimeCell(
                        row, 5, u.getCreatedAt(), dateTimeStyle);
                excelGenerator.writeDateTimeCell(
                        row, 6, u.getUpdatedAt(), dateTimeStyle);
            }
        }

        excelGenerator.autoSizeColumns(sheet, headers.length);
        return excelGenerator.writeToBytes(wb);
    }

    // ===========================================================
    // TRANSACTIONS
    // ===========================================================
    @Transactional(readOnly = true)
    public byte[] exportTransactions(
            HttpSession session,
            LocalDate fromDate,
            LocalDate toDate,
            Long userId,
            Long categoryId,
            TransactionType type
    ) throws IOException {
        requireAdmin(session);
        validateDateRange(fromDate, toDate);

        Specification<Transaction> spec =
                TransactionSpecification.exportFilter(
                        fromDate, toDate, userId, categoryId, type);

        List<Transaction> transactions = transactionRepository.findAll(
                spec, Sort.by(Sort.Direction.DESC, "transactionDate"));

        XSSFWorkbook wb = excelGenerator.createWorkbook();
        Sheet sheet = excelGenerator.createSheet(wb, "Transactions");
        String[] headers = {
                "ID", "User Email", "Category", "Type",
                "Wallet", "Amount", "Note",
                "Transaction Date", "Created At"
        };
        excelGenerator.writeHeaderRow(sheet, headers, 0);

        CellStyle textStyle = excelGenerator.textStyle(wb);
        CellStyle currencyStyle = excelGenerator.currencyStyle(wb);
        CellStyle dateStyle = excelGenerator.dateStyle(wb);
        CellStyle dateTimeStyle = excelGenerator.dateTimeStyle(wb);

        if (transactions.isEmpty()) {
            excelGenerator.writeEmptyRows(sheet, 1, 1);
        } else {
            int rowIndex = 1;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowIndex++);
                excelGenerator.writeLongCell(row, 0, t.getId(),
                        textStyle);
                excelGenerator.writeTextCell(
                        row, 1,
                        t.getUser() != null
                                ? t.getUser().getEmail() : null,
                        textStyle);
                excelGenerator.writeTextCell(
                        row, 2,
                        t.getCategory() != null
                                ? t.getCategory().getName() : null,
                        textStyle);
                excelGenerator.writeTextCell(
                        row, 3,
                        t.getType() != null
                                ? t.getType().name() : null,
                        textStyle);
                excelGenerator.writeTextCell(
                        row, 4,
                        t.getWalletType() != null
                                ? t.getWalletType().name() : null,
                        textStyle);
                excelGenerator.writeNumberCell(
                        row, 5, t.getAmount(), currencyStyle);
                excelGenerator.writeTextCell(
                        row, 6, t.getNote(), textStyle);
                excelGenerator.writeDateCell(
                        row, 7, t.getTransactionDate(), dateStyle);
                excelGenerator.writeDateTimeCell(
                        row, 8, t.getCreatedAt(), dateTimeStyle);
            }
        }

        excelGenerator.autoSizeColumns(sheet, headers.length);
        return excelGenerator.writeToBytes(wb);
    }

    // ===========================================================
    // STATISTICS
    // ===========================================================
    @Transactional(readOnly = true)
    public byte[] exportStatistics(HttpSession session) throws IOException {
        requireAdmin(session);

        AdminDashboardSummaryResponse summary =
                adminDashboardService.getSummary(session);

        XSSFWorkbook wb = excelGenerator.createWorkbook();
        Sheet sheet = excelGenerator.createSheet(wb, "Dashboard Summary");
        List<SummaryEntry> entries = List.of(
                new SummaryEntry("Total Users", summary.getTotalUsers()),
                new SummaryEntry("Total Transactions",
                        summary.getTotalTransactions()),
                new SummaryEntry("Total Income",
                        summary.getTotalIncome()),
                new SummaryEntry("Total Expense",
                        summary.getTotalExpense()),
                new SummaryEntry("Total Monthly Plans",
                        summary.getTotalMonthlyPlans()),
                new SummaryEntry("Total Wallets",
                        summary.getTotalWallets()),
                new SummaryEntry("New Users (this month)",
                        summary.getNewUsers()),
                new SummaryEntry("New Transactions (this month)",
                        summary.getNewTransactions())
        );
        excelGenerator.writeSummarySheet(sheet, entries);
        return excelGenerator.writeToBytes(wb);
    }

    // ===========================================================
    // MONTHLY PLANS
    // ===========================================================
    @Transactional(readOnly = true)
    public byte[] exportMonthlyPlans(HttpSession session)
            throws IOException {
        requireAdmin(session);

        List<MonthlyPlan> plans = monthlyPlanRepository.findAll(
                Sort.by(Sort.Direction.DESC, "year")
                        .and(Sort.by(Sort.Direction.DESC, "month"))
                        .and(Sort.by(Sort.Direction.ASC, "id")));

        XSSFWorkbook wb = excelGenerator.createWorkbook();
        Sheet sheet = excelGenerator.createSheet(wb, "Monthly Plans");
        String[] headers = {
                "ID", "User Email", "Month", "Year",
                "Income Target", "Saving Target", "Note",
                "Created At", "Updated At"
        };
        excelGenerator.writeHeaderRow(sheet, headers, 0);

        CellStyle textStyle = excelGenerator.textStyle(wb);
        CellStyle currencyStyle = excelGenerator.currencyStyle(wb);
        CellStyle intStyle = excelGenerator.numberStyle(wb);
        CellStyle dateTimeStyle = excelGenerator.dateTimeStyle(wb);

        if (plans.isEmpty()) {
            excelGenerator.writeEmptyRows(sheet, 1, 1);
        } else {
            int rowIndex = 1;
            for (MonthlyPlan p : plans) {
                Row row = sheet.createRow(rowIndex++);
                excelGenerator.writeLongCell(row, 0, p.getId(),
                        textStyle);
                excelGenerator.writeTextCell(
                        row, 1,
                        p.getUser() != null
                                ? p.getUser().getEmail() : null,
                        textStyle);
                excelGenerator.writeIntCell(row, 2, p.getMonth(),
                        intStyle);
                excelGenerator.writeIntCell(row, 3, p.getYear(),
                        intStyle);
                excelGenerator.writeNumberCell(
                        row, 4, p.getIncomeTarget(), currencyStyle);
                excelGenerator.writeNumberCell(
                        row, 5, p.getSavingTarget(), currencyStyle);
                excelGenerator.writeTextCell(
                        row, 6, p.getNote(), textStyle);
                excelGenerator.writeDateTimeCell(
                        row, 7, p.getCreatedAt(), dateTimeStyle);
                excelGenerator.writeDateTimeCell(
                        row, 8, p.getUpdatedAt(), dateTimeStyle);
            }
        }

        excelGenerator.autoSizeColumns(sheet, headers.length);
        return excelGenerator.writeToBytes(wb);
    }

    // ===========================================================
    // CATEGORIES
    // ===========================================================
    @Transactional(readOnly = true)
    public byte[] exportCategories(HttpSession session) throws IOException {
        requireAdmin(session);

        Long systemUserId = authenticationRepository
                .findByEmail(SYSTEM_ADMIN_EMAIL)
                .map(User::getId)
                .orElse(null);

        List<Category> categories;
        if (systemUserId != null) {
            categories = categoryRepository.findAll(
                    CategorySpecification.systemCategories(
                            systemUserId, null, null),
                    Sort.by(Sort.Direction.ASC, "type")
                            .and(Sort.by(Sort.Direction.ASC, "name")));
        } else {
            categories = List.of();
        }

        XSSFWorkbook wb = excelGenerator.createWorkbook();
        Sheet sheet = excelGenerator.createSheet(wb, "System Categories");
        String[] headers = {
                "ID", "Name", "Type", "Icon",
                "Color", "Is Default", "Created At", "Updated At"
        };
        excelGenerator.writeHeaderRow(sheet, headers, 0);

        CellStyle textStyle = excelGenerator.textStyle(wb);
        CellStyle dateTimeStyle = excelGenerator.dateTimeStyle(wb);

        if (categories.isEmpty()) {
            excelGenerator.writeEmptyRows(sheet, 1, 1);
        } else {
            int rowIndex = 1;
            for (Category c : categories) {
                Row row = sheet.createRow(rowIndex++);
                excelGenerator.writeLongCell(row, 0, c.getId(),
                        textStyle);
                excelGenerator.writeTextCell(
                        row, 1, c.getName(), textStyle);
                excelGenerator.writeTextCell(
                        row, 2,
                        c.getType() != null
                                ? c.getType().name() : null,
                        textStyle);
                excelGenerator.writeTextCell(
                        row, 3, c.getIcon(), textStyle);
                excelGenerator.writeTextCell(
                        row, 4, c.getColor(), textStyle);
                excelGenerator.writeTextCell(
                        row, 5,
                        c.getIsDefault() != null
                                ? c.getIsDefault().toString() : null,
                        textStyle);
                excelGenerator.writeDateTimeCell(
                        row, 6, c.getCreatedAt(), dateTimeStyle);
                excelGenerator.writeDateTimeCell(
                        row, 7, c.getUpdatedAt(), dateTimeStyle);
            }
        }

        excelGenerator.autoSizeColumns(sheet, headers.length);
        return excelGenerator.writeToBytes(wb);
    }

    // ===========================================================
    // PRIVATE
    // ===========================================================

    private void requireAdmin(HttpSession session) {
        if (session == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        Object userId = session.getAttribute("userId");
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if (!authenticationService.hasRole(session, ADMIN_ROLE)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }
}