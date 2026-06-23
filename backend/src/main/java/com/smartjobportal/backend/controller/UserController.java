package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Update user profile (including resume URL)
     * PUT /users/{userId}
     * 
     * Expected payload:
     * {
     *   "phone": "...",
     *   "resume_url": "https://...",
     *   "skills": "...",
     *   "full_name": "..."
     * }
     */
    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> updates) {
        
        System.out.println("\n=== PUT /users/" + userId + " REQUEST ===");
        System.out.println("Request payload: " + updates);
        
        Map<String, Object> response = userService.updateProfile(userId, updates);
        
        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Upload a resume file for a user and return a backend-hosted resume URL
     * POST /users/{userId}/resume
     */
    @PostMapping("/{userId}/resume")
    public ResponseEntity<Map<String, Object>> uploadResume(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        Map<String, Object> response = userService.uploadResume(userId, file, request);
        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get user profile by ID
     * GET /users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long userId) {
        System.out.println("\n=== GET /users/" + userId + " REQUEST ===");
        
        Map<String, Object> response = userService.getUserProfile(userId);
        
        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
