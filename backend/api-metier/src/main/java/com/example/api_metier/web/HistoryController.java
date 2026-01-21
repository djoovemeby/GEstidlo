package com.example.api_metier.web;

import com.example.api_metier.domain.MeasurementEntity;
import com.example.api_metier.service.MeasurementService;
import java.time.Instant;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

	private final MeasurementService measurementService;

	public HistoryController(MeasurementService measurementService) {
		this.measurementService = measurementService;
	}

	@GetMapping("/points/{pointId}")
	public List<MeasurementEntity> history(
			@PathVariable("pointId") String pointId,
			@RequestParam("type") String type,
			@RequestParam("from") Instant from,
			@RequestParam("to") Instant to) {
		return measurementService.history(pointId, type, from, to);
	}
}
