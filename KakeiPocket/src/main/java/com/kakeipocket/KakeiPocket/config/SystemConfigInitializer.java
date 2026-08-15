package com.kakeipocket.KakeiPocket.config;

import com.kakeipocket.KakeiPocket.entity.SystemConfig;
import com.kakeipocket.KakeiPocket.repository.SystemConfigRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SystemConfigInitializer implements CommandLineRunner {

    SystemConfigRepository systemConfigRepository;

    @Override
    public void run(String... args) {
        if (systemConfigRepository.findFirstByOrderByIdAsc().isPresent()) {
            return;
        }

        SystemConfig defaults = SystemConfig.builder()
                .warningThreshold(80)
                .dangerThreshold(100)
                .updatedAt(LocalDateTime.now())
                .build();
        systemConfigRepository.save(defaults);
        log.info("Initialized default SystemConfig: warning=80, danger=100");
    }
}
