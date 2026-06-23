package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.model.User;
import com.smartjobportal.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

@RestController
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Signup API endpoint
     * Accepts user details and saves to database
     * 
     * @param user User object from request body containing:
     *             - name: User's full name
     *             - email: User's email
     *             - password: User's password
     *             - role: User's role (JOB_SEEKER or RECRUITER)
     *             - phone: User's phone number
     *             - skills: User's skills (optional)
     * 
     * @return ResponseEntity with status and message
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody User user) {
        Map<String, Object> response = authService.signup(user);
        
        if ((Boolean) response.get("success")) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> creds) {
        Map<String, Object> response = new HashMap<>();

        String email = creds.get("email");
        String password = creds.get("password");

        if (email == null || password == null) {
            response.put("success", false);
            response.put("message", "Email and password are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Map<String, Object> result = authService.login(email, password);
        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
    }
}
