package com.example.api_metier.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "points_ref")
public class PointRefEntity {

	@Id
	@Column(nullable = false, length = 80)
	private String id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private String type;

	@Column
	private String description;

	@Column(nullable = false)
	private boolean active = true;

	protected PointRefEntity() {
	}

	public PointRefEntity(String id, String name, String type, String description, boolean active) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.description = description;
		this.active = active;
	}

	public String getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}
}
