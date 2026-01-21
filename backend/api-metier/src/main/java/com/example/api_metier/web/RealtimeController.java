package com.example.api_metier.web;

import com.example.api_metier.service.MeasurementService;
import com.example.api_metier.service.MeasurementService.PointRealtimeView;
import com.example.api_metier.repo.PointRefRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/realtime")
public class RealtimeController {

	private final MeasurementService measurementService;
	private final PointRefRepository pointRefs;

	public RealtimeController(MeasurementService measurementService, PointRefRepository pointRefs) {
		this.measurementService = measurementService;
		this.pointRefs = pointRefs;
	}

	@GetMapping("/points")
	public List<PointRealtimeView> points(
			@RequestParam(name = "pointIds", required = false) List<String> pointIds) {
		List<String> ids;
		if (pointIds != null && !pointIds.isEmpty()) {
			ids = pointIds;
		} else {
			ids = pointRefs.findByActiveTrueOrderByIdAsc().stream().map(p -> p.getId()).toList();
			if (ids.isEmpty()) {
				ids = List.of("POINT-001");
			}
		}
		return measurementService.realtimePoints(ids);
	}
}
