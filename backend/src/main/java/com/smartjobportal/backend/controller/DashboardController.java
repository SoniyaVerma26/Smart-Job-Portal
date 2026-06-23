package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/recruiter/dashboard/{recruiterId}")
    public ResponseEntity<Map<String, Object>> getRecruiterDashboard(@PathVariable Long recruiterId) {
        try {
            Map<String, Object> response = dashboardService.getRecruiterDashboard(recruiterId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = Map.of(
                    "success", false,
                    "message", "An error occurred while fetching recruiter dashboard"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/user/dashboard/{userId}")
    public ResponseEntity<Map<String, Object>> getUserDashboard(@PathVariable Long userId) {
        try {
            Map<String, Object> response = dashboardService.getUserDashboard(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = Map.of(
                    "success", false,
                    "message", "An error occurred while fetching user dashboard"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
