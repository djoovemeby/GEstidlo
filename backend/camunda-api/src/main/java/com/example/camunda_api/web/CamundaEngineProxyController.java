package com.example.camunda_api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Supplier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

@RestController
@RequestMapping("/api")
public class CamundaEngineProxyController {

	private final RestClient camunda;
	private final ObjectMapper objectMapper;

	public CamundaEngineProxyController(RestClient camundaEngineRestClient, ObjectMapper objectMapper) {
		this.camunda = camundaEngineRestClient;
		this.objectMapper = objectMapper;
	}

	@GetMapping("/process-definitions")
	public ResponseEntity<JsonNode> listProcessDefinitions(
			@RequestParam(name = "latest", defaultValue = "true") boolean latest) {
		String uri = latest ? "process-definition?latestVersion=true" : "process-definition";
		return safeJson(() -> camunda.get().uri(uri).retrieve().body(String.class));
	}

	@PostMapping(path = "/process-instances/{key}/start", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<JsonNode> startProcessInstance(@PathVariable("key") String definitionKey,
			@RequestBody(required = false) Map<String, Object> variables) {
		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("variables", wrapVariables(variables));
		return safeJson(() -> camunda.post()
				.uri("process-definition/key/{key}/start", definitionKey)
				.contentType(MediaType.APPLICATION_JSON)
				.body(payload)
				.retrieve()
				.body(String.class));
	}

	@GetMapping("/tasks")
	public ResponseEntity<JsonNode> listTasks(@RequestParam("processInstanceId") String processInstanceId) {
		return safeJson(() -> camunda.get()
				.uri("task?processInstanceId={id}", processInstanceId)
				.retrieve()
				.body(String.class));
	}

	@PostMapping(path = "/tasks/{id}/complete", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Void> completeTask(@PathVariable("id") String taskId,
			@RequestBody(required = false) Map<String, Object> variables) {
		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("variables", wrapVariables(variables));
		return safeVoid(() -> camunda.post()
				.uri("task/{id}/complete", taskId)
				.contentType(MediaType.APPLICATION_JSON)
				.body(payload)
				.retrieve()
				.toBodilessEntity());
	}

	@PostMapping(path = "/tasks/{id}/assignee", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Void> assignTask(@PathVariable("id") String taskId, @RequestBody Map<String, Object> payload) {
		return safeVoid(() -> camunda.post()
				.uri("task/{id}/assignee", taskId)
				.contentType(MediaType.APPLICATION_JSON)
				.body(payload)
				.retrieve()
				.toBodilessEntity());
	}

	private ResponseEntity<JsonNode> safeJson(Supplier<String> call) {
		try {
			return ResponseEntity.ok(toJson(call.get()));
		} catch (ResourceAccessException e) {
			return ResponseEntity.status(503).body(errorJson("Camunda Engine unreachable", e));
		} catch (RestClientResponseException e) {
			return ResponseEntity.status(e.getStatusCode()).body(errorJson("Camunda Engine error", e));
		} catch (Exception e) {
			return ResponseEntity.status(500).body(errorJson("Unexpected error", e));
		}
	}

	private ResponseEntity<Void> safeVoid(Runnable call) {
		try {
			call.run();
			return ResponseEntity.noContent().build();
		} catch (ResourceAccessException e) {
			return ResponseEntity.status(503).build();
		} catch (RestClientResponseException e) {
			return ResponseEntity.status(e.getStatusCode()).build();
		} catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}

	private JsonNode errorJson(String message, Exception e) {
		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("status", "DOWN");
		payload.put("message", message);
		payload.put("error", e.getClass().getSimpleName());
		return objectMapper.valueToTree(payload);
	}

	private JsonNode toJson(String json) {
		try {
			return objectMapper.readTree(json);
		} catch (Exception e) {
			throw new IllegalStateException("Invalid JSON from Camunda Engine", e);
		}
	}

	private Map<String, Object> wrapVariables(Map<String, Object> rawVariables) {
		Map<String, Object> wrapped = new LinkedHashMap<>();
		if (rawVariables == null) {
			return wrapped;
		}
		for (Map.Entry<String, Object> entry : rawVariables.entrySet()) {
			Map<String, Object> variable = new LinkedHashMap<>();
			Object value = entry.getValue();
			variable.put("value", value);
			variable.put("type", inferCamundaType(value));
			wrapped.put(entry.getKey(), variable);
		}
		return wrapped;
	}

	private String inferCamundaType(Object value) {
		if (value == null) {
			return "String";
		}
		if (value instanceof Integer || value instanceof Long) {
			return "Long";
		}
		if (value instanceof Float || value instanceof Double) {
			return "Double";
		}
		if (value instanceof Boolean) {
			return "Boolean";
		}
		return "String";
	}
}
