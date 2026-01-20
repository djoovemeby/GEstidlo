package com.example.api_metier.service;

import com.example.api_metier.domain.AlertEntity;
import com.example.api_metier.domain.AlertSeverity;
import com.example.api_metier.domain.AlertStatus;
import com.example.api_metier.domain.MeasurementEntity;
import com.example.api_metier.domain.MeasurementType;
import com.example.api_metier.repo.AlertRepository;
import com.example.api_metier.repo.MeasurementRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeasurementService {

	private final MeasurementRepository measurements;
	private final AlertRepository alerts;
	private final double minPressureWarn;
	private final double minPressureCrit;
	private final double minLevelCrit;

	public MeasurementService(
			MeasurementRepository measurements,
			AlertRepository alerts,
			@Value("${gestidlo.threshold.pressure.minWarn}") double minPressureWarn,
			@Value("${gestidlo.threshold.pressure.minCrit}") double minPressureCrit,
			@Value("${gestidlo.threshold.level.minCrit}") double minLevelCrit) {
		this.measurements = measurements;
		this.alerts = alerts;
		this.minPressureWarn = minPressureWarn;
		this.minPressureCrit = minPressureCrit;
		this.minLevelCrit = minLevelCrit;
	}

	@Transactional
	public IngestResult ingest(IngestRequest request) {
		Instant ts = request.timestamp() != null ? request.timestamp() : Instant.now();
		MeasurementEntity measurement = new MeasurementEntity(
				request.pointId(),
				request.sensorId(),
				request.type(),
				request.value(),
				request.unit(),
				ts);
		measurement = measurements.save(measurement);

		List<Long> createdOrUpdatedAlerts = new ArrayList<>();
		AlertDecision decision = decideAlert(request.type(), request.value(), request.unit());
		if (decision != null) {
			AlertEntity alert = alerts.findFirstByPointIdAndTypeAndStatusOrderByOpenedAtDesc(
					request.pointId(), request.type(), AlertStatus.ACTIVE)
					.orElse(null);
			Instant now = Instant.now();
			if (alert == null) {
				alert = new AlertEntity(
						request.pointId(),
						request.sensorId(),
						request.type(),
						decision.severity(),
						AlertStatus.ACTIVE,
						decision.message(),
						now,
						now);
			} else {
				alert.setSeverity(decision.severity());
				alert.setMessage(decision.message());
				alert.setUpdatedAt(now);
			}
			alert = alerts.save(alert);
			createdOrUpdatedAlerts.add(alert.getId());
		}

		return new IngestResult(measurement.getId(), createdOrUpdatedAlerts);
	}

	@Transactional(readOnly = true)
	public List<PointRealtimeView> realtimePoints(List<String> pointIds) {
		List<PointRealtimeView> result = new ArrayList<>();
		for (String pointId : pointIds) {
			Map<MeasurementType, MeasurementEntity> last = new EnumMap<>(MeasurementType.class);
			for (MeasurementType type : MeasurementType.values()) {
				measurements.findTop1ByPointIdAndTypeOrderByTimestampDesc(pointId, type)
						.ifPresent(m -> last.put(type, m));
			}

			result.add(PointRealtimeView.from(pointId, last));
		}
		return result;
	}

	@Transactional(readOnly = true)
	public List<MeasurementEntity> history(String pointId, MeasurementType type, Instant from, Instant to) {
		return measurements.findByPointIdAndTypeAndTimestampBetweenOrderByTimestampAsc(pointId, type, from, to);
	}

	private AlertDecision decideAlert(MeasurementType type, double value, String unit) {
		return switch (type) {
			case PRESSURE -> decidePressureAlert(value, unit);
			case LEVEL -> decideLevelAlert(value, unit);
			case FLOW -> null;
		};
	}

	private AlertDecision decidePressureAlert(double value, String unit) {
		if (value < minPressureCrit) {
			return new AlertDecision(AlertSeverity.CRIT,
					"Sous-pression critique: " + value + " " + unit + " (min " + minPressureCrit + ")");
		}
		if (value < minPressureWarn) {
			return new AlertDecision(AlertSeverity.WARN,
					"Sous-pression: " + value + " " + unit + " (min " + minPressureWarn + ")");
		}
		return null;
	}

	private AlertDecision decideLevelAlert(double value, String unit) {
		if (value < minLevelCrit) {
			return new AlertDecision(AlertSeverity.CRIT,
					"Niveau critique: " + value + " " + unit + " (min " + minLevelCrit + ")");
		}
		return null;
	}

	private record AlertDecision(AlertSeverity severity, String message) {
	}

	public record IngestRequest(
			String pointId,
			String sensorId,
			MeasurementType type,
			double value,
			String unit,
			Instant timestamp) {
	}

	public record IngestResult(Long measurementId, List<Long> alertIds) {
	}

	public record PointRealtimeView(String pointId, Map<String, Object> lastMeasurements) {
		public static PointRealtimeView from(String pointId, Map<MeasurementType, MeasurementEntity> last) {
			Map<String, Object> m = new LinkedHashMap<>();
			for (Map.Entry<MeasurementType, MeasurementEntity> entry : last.entrySet()) {
				MeasurementEntity me = entry.getValue();
				Map<String, Object> dto = new LinkedHashMap<>();
				dto.put("value", me.getValue());
				dto.put("unit", me.getUnit());
				dto.put("timestamp", me.getTimestamp());
				m.put(entry.getKey().name(), dto);
			}
			return new PointRealtimeView(pointId, m);
		}
	}
}
