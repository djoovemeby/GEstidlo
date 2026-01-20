package com.example.api_metier.web;

import com.example.api_metier.service.MeasurementService;
import com.example.api_metier.service.MeasurementService.IngestRequest;
import com.example.api_metier.service.MeasurementService.IngestResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/iot")
public class IotController {

	private final MeasurementService measurementService;

	public IotController(MeasurementService measurementService) {
		this.measurementService = measurementService;
	}

	@PostMapping("/measurements")
	public IngestResult ingest(@RequestBody IngestRequest request) {
		return measurementService.ingest(request);
	}
}

