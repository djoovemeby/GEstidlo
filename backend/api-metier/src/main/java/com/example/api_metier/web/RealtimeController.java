package com.example.api_metier.web;

import com.example.api_metier.service.MeasurementService;
import com.example.api_metier.service.MeasurementService.PointRealtimeView;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/realtime")
public class RealtimeController {

	private final MeasurementService measurementService;

	public RealtimeController(MeasurementService measurementService) {
		this.measurementService = measurementService;
	}

	@GetMapping("/points")
	public List<PointRealtimeView> points(
			@RequestParam(name = "pointIds", required = false) List<String> pointIds) {
		List<String> ids = pointIds == null || pointIds.isEmpty() ? List.of("POINT-001") : pointIds;
		return measurementService.realtimePoints(ids);
	}
}

