package com.kakeipocket.KakeiPocket.repository;

import com.kakeipocket.KakeiPocket.entity.SystemConfig;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemConfigRepository
        extends JpaRepository<SystemConfig, Long> {

    /**
     * Returns the single system configuration row.
     * The table is expected to contain at most one record.
     */
    Optional<SystemConfig> findFirstByOrderByIdAsc();
}
