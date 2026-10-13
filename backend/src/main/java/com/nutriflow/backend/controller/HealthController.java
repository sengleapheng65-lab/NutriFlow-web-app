package com.nutriflow.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Simple endpoint to check that the backend server is running
@RestController
@RequestMapping("/api")
public class HealthController {

	// GET /api/health returns {"status": "ok"}
	@GetMapping("/health")
	public Map<String, String> health() {
		return Map.of("status", "ok");
	}

}
