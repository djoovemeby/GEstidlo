package com.example.camunda_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class CamundaEngineClientConfig {

	@Bean
	RestClient camundaEngineRestClient(
			@Value("${camunda.engine.url:http://localhost:9080/engine-rest}") String camundaEngineUrl) {
		String baseUrl = camundaEngineUrl.endsWith("/") ? camundaEngineUrl : camundaEngineUrl + "/";
		return RestClient.builder().baseUrl(baseUrl).build();
	}
}
