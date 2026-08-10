package com.kakeipocket.KakeiPocket.entity;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_summaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "monthly_plan_id", nullable = false, unique = true)
    private MonthlyPlan monthlyPlan;

    @Column(name = "total_income", precision = 15, scale = 2)
    private BigDecimal totalIncome;

    @Column(name = "total_expense", precision = 15, scale = 2)
    private BigDecimal totalExpense;

    @Column(name = "total_saved", precision = 15, scale = 2)
    private BigDecimal totalSaved;

    @Column(name = "saving_rate", precision = 5, scale = 2)
    private BigDecimal savingRate;

    @Column(name = "financial_score")
    private Integer financialScore;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;
}