package com.example.api_metier.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class CamundaApiClientConfig {

	@Bean
	RestClient camundaApiRestClient(@Value("${gestidlo.camunda-api.url}") String baseUrl) {
		return RestClient.builder().baseUrl(baseUrl).build();
	}
}

