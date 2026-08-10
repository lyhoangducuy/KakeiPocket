package com.kakeipocket.KakeiPocket.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kakeipocket.KakeiPocket.entity.User;
import java.util.List;
import java.util.Optional;


public interface AuthenticationRepository extends JpaRepository<User,Long>{    
    Optional<User> findByEmail(String email);
}
