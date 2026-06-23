package com.smartjobportal.backend.service;

import com.smartjobportal.backend.model.User;
import com.smartjobportal.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Update user profile with resume URL and other fields
     * @param userId User ID
     * @param updates Map containing fields to update (phone, company, skills, resume_url, etc.)
     * @return Map with success status and updated user
     */
    public Map<String, Object> updateProfile(Long userId, Map<String, Object> updates) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOpt.get();
            
            // Log incoming data
            System.out.println("=== PROFILE UPDATE TRACE ===");
            System.out.println("UserId: " + userId);
            System.out.println("Incoming updates: " + updates);
            
            // Update resume_url
            if (updates.containsKey("resume_url")) {
                String resumeUrl = (String) updates.get("resume_url");
                System.out.println("Incoming resume_url: " + resumeUrl);
                user.setResumeUrl(resumeUrl);
                System.out.println("Set resumeUrl on User entity: " + user.getResumeUrl());
            }
            
            // Update phone
            if (updates.containsKey("phone")) {
                user.setPhone((String) updates.get("phone"));
            }
            
            // Update skills
            if (updates.containsKey("skills")) {
                Object skillsObj = updates.get("skills");
                if (skillsObj instanceof String) {
                    user.setSkills((String) skillsObj);
                } else if (skillsObj instanceof java.util.List) {
                    user.setSkills(String.join(",", (java.util.List<String>) skillsObj));
                }
            }
            
            // Update full name if present
            if (updates.containsKey("full_name") || updates.containsKey("name")) {
                String name = (String) (updates.containsKey("full_name") ? updates.get("full_name") : updates.get("name"));
                if (name != null) {
                    user.setName(name);
                }
            }

            // Save to database
            System.out.println("Before save - User resumeUrl: " + user.getResumeUrl());
            User savedUser = userRepository.save(user);
            System.out.println("After save - Saved user resumeUrl: " + savedUser.getResumeUrl());
            System.out.println("User saved successfully with ID: " + savedUser.getId());

            // Build response with updated user
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("name", savedUser.getName());
            userData.put("email", savedUser.getEmail());
            userData.put("phone", savedUser.getPhone());
            userData.put("role", savedUser.getRole());
            userData.put("skills", savedUser.getSkills());
            userData.put("resume_url", savedUser.getResumeUrl());
            
            System.out.println("Response resume_url: " + userData.get("resume_url"));
            System.out.println("=== END PROFILE UPDATE TRACE ===\n");

            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", userData);
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error updating profile: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error updating profile: " + e.getMessage());
            return response;
        }
    }

    /**
     * Upload a resume file and persist a backend-hosted URL
     * @param userId User ID
     * @param file Multipart resume file
     * @param request HttpServletRequest for building a download URL
     * @return Map with success state and resume_url
     */
    public Map<String, Object> uploadResume(Long userId, MultipartFile file, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (file == null || file.isEmpty()) {
                response.put("success", false);
                response.put("message", "Resume file is required");
                return response;
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOpt.get();
            String originalFileName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = userId + "-" + System.currentTimeMillis() + "-" + originalFileName;
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads", "resumes");
            java.nio.file.Files.createDirectories(uploadDir);
            java.nio.file.Path targetLocation = uploadDir.resolve(fileName).normalize();
            java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String resumeUrl = org.springframework.web.servlet.support.ServletUriComponentsBuilder
                    .fromCurrentContextPath()
                    .path("/resumes/")
                    .path(fileName)
                    .toUriString();

            user.setResumeUrl(resumeUrl);
            User savedUser = userRepository.save(user);

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("name", savedUser.getName());
            userData.put("email", savedUser.getEmail());
            userData.put("phone", savedUser.getPhone());
            userData.put("role", savedUser.getRole());
            userData.put("skills", savedUser.getSkills());
            userData.put("resume_url", savedUser.getResumeUrl());

            response.put("success", true);
            response.put("message", "Resume uploaded successfully");
            response.put("user", userData);
            response.put("resume_url", resumeUrl);
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error uploading resume: " + e.getMessage());
            return response;
        }
    }

    /**
     * Get user profile by ID
     * @param userId User ID
     * @return Map containing user profile or error
     */
    public Map<String, Object> getUserProfile(Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("=== GET PROFILE TRACE ===");
            System.out.println("Fetching profile for userId: " + userId);
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOpt.get();
            System.out.println("User found. ResumeUrl from DB: " + user.getResumeUrl());

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("phone", user.getPhone());
            userData.put("role", user.getRole());
            userData.put("skills", user.getSkills());
            userData.put("resume_url", user.getResumeUrl());
            
            System.out.println("Response resume_url: " + userData.get("resume_url"));
            System.out.println("=== END GET PROFILE TRACE ===\n");

            response.put("success", true);
            response.put("user", userData);
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error fetching profile");
            return response;
        }
    }
}
