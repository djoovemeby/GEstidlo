package com.example.api_metier.service;

import com.example.api_metier.domain.AlertEntity;
import com.example.api_metier.domain.AlertStatus;
import com.example.api_metier.domain.TicketEntity;
import com.example.api_metier.domain.TicketStatus;
import com.example.api_metier.repo.AlertRepository;
import com.example.api_metier.repo.TicketRepository;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
public class TicketService {

	private final TicketRepository tickets;
	private final AlertRepository alerts;
	private final RestClient camundaApi;

	public TicketService(TicketRepository tickets, AlertRepository alerts, RestClient camundaApiRestClient) {
		this.tickets = tickets;
		this.alerts = alerts;
		this.camundaApi = camundaApiRestClient;
	}

	@Transactional
	public TicketEntity createTicket(CreateTicketRequest request) {
		AlertEntity alert = alerts.findById(request.alertId())
				.orElseThrow(() -> new IllegalArgumentException("Unknown alertId " + request.alertId()));
		if (alert.getStatus() == AlertStatus.CLOSED) {
			throw new IllegalStateException("Cannot create ticket from CLOSED alert");
		}

		// If an alert becomes a ticket, we consider it handled (acknowledged).
		if (alert.getStatus() == AlertStatus.ACTIVE) {
			alert.setStatus(AlertStatus.ACK);
			alert.setUpdatedAt(Instant.now());
			alerts.save(alert);
		}

		Instant now = Instant.now();
		TicketStatus initialStatus = request.assignee() != null && !request.assignee().isBlank()
				? TicketStatus.ASSIGNED
				: TicketStatus.OPEN;
		TicketEntity ticket = new TicketEntity(
				initialStatus,
				alert.getId(),
				alert.getPointId(),
				alert.getSensorId(),
				request.assignee(),
				now,
				now);
		ticket = tickets.saveAndFlush(ticket);

		Map<String, Object> variables = new LinkedHashMap<>();
		variables.put("ticketId", ticket.getId());
		variables.put("alertId", alert.getId());
		variables.put("assignee", request.assignee() != null ? request.assignee() : "tech");

		JsonNode started = camundaApi.post()
				.uri("/api/process-instances/{key}/start", "gestidlo_intervention")
				.body(variables)
				.retrieve()
				.body(JsonNode.class);

		String processInstanceId = started != null && started.hasNonNull("id") ? started.get("id").asText() : null;
		ticket.setCamundaProcessInstanceId(processInstanceId);
		ticket.setUpdatedAt(Instant.now());
		return tickets.save(ticket);
	}

	@Transactional
	public TicketEntity advance(Long ticketId) {
		TicketEntity ticket = tickets.findById(ticketId)
				.orElseThrow(() -> new IllegalArgumentException("Unknown ticketId " + ticketId));
		if (ticket.getCamundaProcessInstanceId() == null || ticket.getCamundaProcessInstanceId().isBlank()) {
			throw new IllegalStateException("Ticket has no Camunda process instance");
		}

		JsonNode tasks = camundaApi.get()
				.uri("/api/tasks?processInstanceId={id}", ticket.getCamundaProcessInstanceId())
				.retrieve()
				.body(JsonNode.class);
		if (tasks == null || !tasks.isArray() || tasks.isEmpty()) {
			ticket.setStatus(TicketStatus.CLOSED);
			ticket.setUpdatedAt(Instant.now());
			return tickets.save(ticket);
		}

		JsonNode first = tasks.get(0);
		String taskId = first.get("id").asText();
		camundaApi.post().uri("/api/tasks/{id}/complete", taskId).body(Map.of()).retrieve().toBodilessEntity();

		JsonNode remaining = camundaApi.get()
				.uri("/api/tasks?processInstanceId={id}", ticket.getCamundaProcessInstanceId())
				.retrieve()
				.body(JsonNode.class);
		if (remaining == null || !remaining.isArray() || remaining.isEmpty()) {
			ticket.setStatus(TicketStatus.CLOSED);
		} else {
			String name = remaining.get(0).hasNonNull("name") ? remaining.get(0).get("name").asText() : "";
			if (name.toLowerCase().contains("intervention")) {
				ticket.setStatus(TicketStatus.IN_PROGRESS);
			} else {
				ticket.setStatus(TicketStatus.ASSIGNED);
			}
		}
		ticket.setUpdatedAt(Instant.now());
		return tickets.save(ticket);
	}

	@Transactional
	public TicketEntity assign(Long ticketId, String assignee) {
		TicketEntity ticket = tickets.findById(ticketId)
				.orElseThrow(() -> new IllegalArgumentException("Unknown ticketId " + ticketId));
		if (ticket.getStatus() == TicketStatus.CLOSED) {
			return ticket;
		}
		if (assignee == null || assignee.isBlank()) {
			throw new IllegalArgumentException("assignee is required");
		}

		// Update Camunda current task assignee (best effort)
		if (ticket.getCamundaProcessInstanceId() != null && !ticket.getCamundaProcessInstanceId().isBlank()) {
			try {
				JsonNode tasks = camundaApi.get()
						.uri("/api/tasks?processInstanceId={id}", ticket.getCamundaProcessInstanceId())
						.retrieve()
						.body(JsonNode.class);
				if (tasks != null && tasks.isArray() && !tasks.isEmpty()) {
					String taskId = tasks.get(0).get("id").asText();
					camundaApi.post()
							.uri("/api/tasks/{id}/assignee", taskId)
							.body(Map.of("userId", assignee))
							.retrieve()
							.toBodilessEntity();
				}
			} catch (Exception ignored) {
				// best effort
			}
		}

		ticket.setAssignee(assignee);
		if (ticket.getStatus() == TicketStatus.OPEN) {
			ticket.setStatus(TicketStatus.ASSIGNED);
		}
		ticket.setUpdatedAt(Instant.now());
		return tickets.save(ticket);
	}

	public record CreateTicketRequest(Long alertId, String assignee) {
	}
}
