package com.example.api_metier.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "threshold_configs")
public class ThresholdConfigEntity {

	@Id
	@Column(nullable = false)
	private String type;

	@Column
	private Double minWarn;

	@Column
	private Double minCrit;

	protected ThresholdConfigEntity() {
	}

	public ThresholdConfigEntity(String type, Double minWarn, Double minCrit) {
		this.type = type;
		this.minWarn = minWarn;
		this.minCrit = minCrit;
	}

	public String getType() {
		return type;
	}

	public Double getMinWarn() {
		return minWarn;
	}

	public void setMinWarn(Double minWarn) {
		this.minWarn = minWarn;
	}

	public Double getMinCrit() {
		return minCrit;
	}

	public void setMinCrit(Double minCrit) {
		this.minCrit = minCrit;
	}
}
