package com.nutriflow.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Allow the React frontend (Vite dev server) to call the backend API
@Configuration
public class CorsConfig implements WebMvcConfigurer {
	@Value("${APP_FRONTEND_URLS:http://localhost:5173}")
	private String frontendUrls;

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				.allowedOriginPatterns(java.util.Arrays.stream(frontendUrls.split(","))
					.map(String::trim).toArray(String[]::new))
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowCredentials(true);
	}

}
