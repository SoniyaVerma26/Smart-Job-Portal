package com.smartjobportal.backend.service;

import com.smartjobportal.backend.model.User;
import com.smartjobportal.backend.repository.UserRepository;
import com.smartjobportal.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Register a new user
     * @param user User object containing registration details
     * @return Map containing status and message
     */
    public Map<String, Object> signup(User user) {
        Map<String, Object> response = new HashMap<>();

        // Validate input
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Name is required");
            return response;
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return response;
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Password is required");
            return response;
        }

        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Role is required");
            return response;
        }

        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Phone number is required");
            return response;
        }

        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            response.put("success", false);
            response.put("message", "Email already registered");
            return response;
        }

        // Set default role if not specified
        if ("RECRUITER".equalsIgnoreCase(user.getRole())) {
            user.setRole("RECRUITER");
        } else {
            user.setRole("JOB_SEEKER");
        }

        // Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save user to database
        User savedUser = userRepository.save(user);

        if (savedUser != null && savedUser.getId() != null) {
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("email", savedUser.getEmail());
        } else {
            response.put("success", false);
            response.put("message", "Failed to register user. Please try again");
        }

        return response;
    }

    /**
     * Validate user credentials
     * @param email User email
     * @param password User password
     * @return User object if credentials are valid, null otherwise
     */
    public User validateUser(String email, String password) {
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    public Map<String, Object> login(String email, String password) {
        Map<String, Object> response = new HashMap<>();
        User user = validateUser(email, password);
        if (user == null) {
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return response;
        }

        String token = jwtUtil.generateToken(user);
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("name", user.getName());
        userInfo.put("email", user.getEmail());
        userInfo.put("phone", user.getPhone());
        userInfo.put("role", user.getRole());
        userInfo.put("skills", user.getSkills());
        userInfo.put("resume_url", user.getResumeUrl());
        
        System.out.println("=== LOGIN RESPONSE TRACE ===");
        System.out.println("UserId: " + user.getId());
        System.out.println("ResumeUrl from DB: " + user.getResumeUrl());
        System.out.println("Response user info: " + userInfo);

        response.put("success", true);
        response.put("token", token);
        response.put("user", userInfo);
        return response;
    }
}
