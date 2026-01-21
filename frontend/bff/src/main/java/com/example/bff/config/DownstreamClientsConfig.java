package com.example.bff.config;

import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.client.RestClient;

@Configuration
public class DownstreamClientsConfig {

	@Bean
	RestClient metierRestClient(@Value("${gestidlo.api-metier.url}") String baseUrl) {
		return RestClient.builder()
				.baseUrl(baseUrl)
				.requestInterceptor((request, body, execution) -> {
					Authentication auth = SecurityContextHolder.getContext().getAuthentication();
					if (auth instanceof JwtAuthenticationToken jwtAuth) {
						request.getHeaders().set(HttpHeaders.AUTHORIZATION, "Bearer " + jwtAuth.getToken().getTokenValue());
					}
					return execution.execute(request, body);
				})
				.build();
	}

	@Bean
	RestClient camundaApiRestClient(@Value("${gestidlo.camunda-api.url}") String baseUrl) {
		return RestClient.builder().baseUrl(baseUrl).build();
	}
}
