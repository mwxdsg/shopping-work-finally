package com.ecommerce.shop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests()
                .antMatchers("/api/users/register", "/api/users/login", "/api/products").permitAll()
                .antMatchers("/api/products/**").permitAll()
                .antMatchers("/api/cart/**", "/api/orders/**").permitAll()
                .antMatchers("/api/reports/**").permitAll()
                .anyRequest().permitAll()
            .and()
            .formLogin().disable()
            .httpBasic().disable();

        return http.build();
    }
}