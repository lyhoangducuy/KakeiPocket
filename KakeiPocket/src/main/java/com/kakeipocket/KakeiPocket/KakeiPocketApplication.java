package com.kakeipocket.KakeiPocket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableJpaAuditing
public class KakeiPocketApplication {

	public static void main(String[] args) {
		SpringApplication.run(KakeiPocketApplication.class, args);
	}

}
