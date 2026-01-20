package com.example.api_metier.web;

import com.example.api_metier.domain.AlertEntity;
import com.example.api_metier.domain.AlertStatus;
import com.example.api_metier.repo.AlertRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

	private final AlertRepository alerts;

	public AlertController(AlertRepository alerts) {
		this.alerts = alerts;
	}

	@GetMapping
	public List<AlertEntity> list(@RequestParam(name = "status", defaultValue = "ACTIVE") AlertStatus status) {
		return alerts.findByStatus(status);
	}

	@PostMapping("/{id}/ack")
	public AlertEntity ack(@PathVariable("id") Long id) {
		AlertEntity alert = alerts.findById(id).orElseThrow();
		alert.setStatus(AlertStatus.ACK);
		alert.setUpdatedAt(Instant.now());
		return alerts.save(alert);
	}
}

