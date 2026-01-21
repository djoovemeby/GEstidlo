package com.example.api_metier.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "measurements", indexes = {
		@Index(name = "idx_measurements_point_type_ts", columnList = "pointId,type,ts")
})
public class MeasurementEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String pointId;

	@Column(nullable = false)
	private String sensorId;

	@Column(nullable = false)
	private String type;

	@Column(name = "val", nullable = false)
	private double value;

	@Column(nullable = false)
	private String unit;

	@Column(name = "ts", nullable = false)
	private Instant timestamp;

	protected MeasurementEntity() {
	}

	public MeasurementEntity(String pointId, String sensorId, String type, double value, String unit,
			Instant timestamp) {
		this.pointId = pointId;
		this.sensorId = sensorId;
		this.type = type;
		this.value = value;
		this.unit = unit;
		this.timestamp = timestamp;
	}

	public Long getId() {
		return id;
	}

	public String getPointId() {
		return pointId;
	}

	public String getSensorId() {
		return sensorId;
	}

	public String getType() {
		return type;
	}

	public double getValue() {
		return value;
	}

	public String getUnit() {
		return unit;
	}

	public Instant getTimestamp() {
		return timestamp;
	}
}
