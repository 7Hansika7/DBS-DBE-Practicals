package com.example.studentrecords.dto;

import jakarta.validation.constraints.*;

public class RegisterRequest {

    @NotBlank
    private String username;

    @NotBlank
    @Size(min = 6, message = "password must be at least 6 characters")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}