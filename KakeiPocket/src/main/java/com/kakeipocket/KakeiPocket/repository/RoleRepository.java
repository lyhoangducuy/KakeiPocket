package com.kakeipocket.KakeiPocket.repository;

import com.kakeipocket.KakeiPocket.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository
        extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);
}