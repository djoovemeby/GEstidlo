package com.example.api_metier.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "tickets")
public class TicketEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TicketStatus status;

	@Column
	private Long alertId;

	@Column(nullable = false)
	private String pointId;

	@Column(nullable = false)
	private String sensorId;

	@Column
	private String assignee;

	@Column
	private String camundaProcessInstanceId;

	@Column(nullable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	protected TicketEntity() {
	}

	public TicketEntity(TicketStatus status, Long alertId, String pointId, String sensorId, String assignee,
			Instant createdAt, Instant updatedAt) {
		this.status = status;
		this.alertId = alertId;
		this.pointId = pointId;
		this.sensorId = sensorId;
		this.assignee = assignee;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public Long getId() {
		return id;
	}

	public TicketStatus getStatus() {
		return status;
	}

	public void setStatus(TicketStatus status) {
		this.status = status;
	}

	public Long getAlertId() {
		return alertId;
	}

	public String getPointId() {
		return pointId;
	}

	public String getSensorId() {
		return sensorId;
	}

	public String getAssignee() {
		return assignee;
	}

	public void setAssignee(String assignee) {
		this.assignee = assignee;
	}

	public String getCamundaProcessInstanceId() {
		return camundaProcessInstanceId;
	}

	public void setCamundaProcessInstanceId(String camundaProcessInstanceId) {
		this.camundaProcessInstanceId = camundaProcessInstanceId;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
}

