package com.example.bff.web;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api")
public class BffController {

	private final RestClient metier;
	private final RestClient camundaApi;

	public BffController(
			@Qualifier("metierRestClient") RestClient metierRestClient,
			@Qualifier("camundaApiRestClient") RestClient camundaApiRestClient) {
		this.metier = metierRestClient;
		this.camundaApi = camundaApiRestClient;
	}

	@GetMapping("/health")
	public Map<String, Object> health() {
		Map<String, Object> res = new LinkedHashMap<>();
		res.put("bff", "UP");
		res.put("apiMetier", safeGetJson(metier, "/actuator/health"));
		res.put("camundaApi", safeGetJson(camundaApi, "/actuator/health"));
		return res;
	}

	@GetMapping("/dashboard")
	public Map<String, Object> dashboard() {
		Map<String, Object> res = new LinkedHashMap<>();
		res.put("realtime", safeGetJson(metier, "/api/realtime/points"));
		res.put("alerts", safeGetJson(metier, "/api/alerts?status=ACTIVE"));
		res.put("tickets", safeGetJson(metier, "/api/tickets"));
		res.put("processDefinitions", safeGetJson(camundaApi, "/api/process-definitions"));
		return res;
	}

	@PostMapping("/iot/measurements")
	public JsonNode ingest(@RequestBody Map<String, Object> body) {
		return metier.post().uri("/api/iot/measurements").body(body).retrieve().body(JsonNode.class);
	}

	@GetMapping("/realtime/points")
	public JsonNode realtime() {
		return metier.get().uri("/api/realtime/points").retrieve().body(JsonNode.class);
	}

	@GetMapping("/history/points/{pointId}")
	public JsonNode history(
			@PathVariable("pointId") String pointId,
			@RequestParam("type") String type,
			@RequestParam("from") String from,
			@RequestParam("to") String to) {
		String uri = "/api/history/points/" + pointId + "?type=" + type + "&from=" + from + "&to=" + to;
		return metier.get().uri(uri).retrieve().body(JsonNode.class);
	}

	@GetMapping("/alerts")
	public JsonNode alerts(@RequestParam(name = "status", defaultValue = "ACTIVE") String status) {
		return metier.get().uri("/api/alerts?status={status}", status).retrieve().body(JsonNode.class);
	}

	@PostMapping("/alerts/{id}/ack")
	public JsonNode ack(@PathVariable("id") Long id) {
		return metier.post().uri("/api/alerts/{id}/ack", id).retrieve().body(JsonNode.class);
	}

	@GetMapping("/tickets")
	public JsonNode tickets() {
		return metier.get().uri("/api/tickets").retrieve().body(JsonNode.class);
	}

	@PostMapping("/tickets")
	public JsonNode createTicket(@RequestBody Map<String, Object> body) {
		return metier.post().uri("/api/tickets").body(body).retrieve().body(JsonNode.class);
	}

	@PostMapping("/tickets/{id}/advance")
	public JsonNode advanceTicket(@PathVariable("id") Long id) {
		return metier.post().uri("/api/tickets/{id}/advance", id).retrieve().body(JsonNode.class);
	}

	@GetMapping("/process-definitions")
	public JsonNode processDefinitions() {
		return camundaApi.get().uri("/api/process-definitions").retrieve().body(JsonNode.class);
	}

	@PostMapping("/process-instances/{key}/start")
	public JsonNode startProcess(@PathVariable("key") String key, @RequestBody(required = false) Map<String, Object> body) {
		return camundaApi.post()
				.uri("/api/process-instances/{key}/start", key)
				.body(body == null ? Map.of() : body)
				.retrieve()
				.body(JsonNode.class);
	}

	@GetMapping("/tasks")
	public JsonNode tasks(@RequestParam("processInstanceId") String processInstanceId) {
		return camundaApi.get()
				.uri("/api/tasks?processInstanceId={id}", processInstanceId)
				.retrieve()
				.body(JsonNode.class);
	}

	@PostMapping("/tasks/{id}/complete")
	public void completeTask(@PathVariable("id") String taskId, @RequestBody(required = false) Map<String, Object> body) {
		camundaApi.post()
				.uri("/api/tasks/{id}/complete", taskId)
				.body(body == null ? Map.of() : body)
				.retrieve()
				.toBodilessEntity();
	}

	private Object safeGetJson(RestClient client, String uri) {
		try {
			return client.get().uri(uri).retrieve().body(JsonNode.class);
		} catch (Exception e) {
			return Map.of("status", "DOWN", "error", e.getClass().getSimpleName());
		}
	}
}
