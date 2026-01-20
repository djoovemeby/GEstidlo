package com.example.bff.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class DownstreamClientsConfig {

	@Bean
	RestClient metierRestClient(@Value("${gestidlo.api-metier.url}") String baseUrl) {
		return RestClient.builder().baseUrl(baseUrl).build();
	}

	@Bean
	RestClient camundaApiRestClient(@Value("${gestidlo.camunda-api.url}") String baseUrl) {
		return RestClient.builder().baseUrl(baseUrl).build();
	}
}

