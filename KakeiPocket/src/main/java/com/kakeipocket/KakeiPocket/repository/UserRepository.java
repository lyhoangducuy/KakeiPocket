package com.kakeipocket.KakeiPocket.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kakeipocket.KakeiPocket.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
}
