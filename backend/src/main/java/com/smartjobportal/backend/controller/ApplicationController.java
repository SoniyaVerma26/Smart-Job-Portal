package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.model.Application;
import com.smartjobportal.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyToJob(@RequestBody Application application) {
        Map<String, Object> resp = new HashMap<>();
        if (application.getJobId() == null || application.getUserId() == null) {
            resp.put("success", false);
            resp.put("message", "jobId and userId are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
        if (application.getResumeLink() == null || application.getResumeLink().isBlank()) {
            resp.put("success", false);
            resp.put("message", "Resume is required before applying for a job.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }

        try {
            if (applicationService.hasApplied(application.getJobId(), application.getUserId())) {
                resp.put("success", false);
                resp.put("message", "You have already applied for this job");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(resp);
            }

            application.setStatus(application.getStatus() != null ? application.getStatus() : "PENDING");
            var created = applicationService.createApplication(application);
            if (created == null) {
                resp.put("success", false);
                resp.put("message", "Failed to save application");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
            }

            resp.put("success", true);
            resp.put("message", "Job applied successfully");
            resp.put("application", created);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (Exception e) {
            e.printStackTrace();
            resp.put("success", false);
            resp.put("message", "An error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @GetMapping("/applications/user/{userId}")
    public ResponseEntity<Map<String, Object>> getApplicationsForUser(@PathVariable Long userId) {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<Application> applications = applicationService.getApplicationsByUserId(userId);
            resp.put("success", true);
            resp.put("applications", applications);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            resp.put("success", false);
            resp.put("message", "An error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }
}
