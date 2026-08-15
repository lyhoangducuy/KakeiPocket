package com.kakeipocket.KakeiPocket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kakeipocket.KakeiPocket.entity.User;

import java.time.LocalDateTime;

public interface UserRepository
        extends JpaRepository<User, Long>,
                JpaSpecificationExecutor<User> {

    @Query("SELECT COUNT(u) FROM User u")
    long countAll();

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countCreatedSince(@Param("since") LocalDateTime since);

    @Query(
            "SELECT FUNCTION('YEAR', u.createdAt) AS year, "
                    + "FUNCTION('MONTH', u.createdAt) AS month, "
                    + "COUNT(u) AS count "
                    + "FROM User u "
                    + "WHERE u.createdAt >= :since "
                    + "GROUP BY FUNCTION('YEAR', u.createdAt), FUNCTION('MONTH', u.createdAt) "
                    + "ORDER BY FUNCTION('YEAR', u.createdAt), FUNCTION('MONTH', u.createdAt)"
    )
    java.util.List<MonthlyUserAggregate> aggregateMonthlyCreated(
            @Param("since") LocalDateTime since
    );

    interface MonthlyUserAggregate {
        Integer getYear();
        Integer getMonth();
        Long getCount();
    }
}
