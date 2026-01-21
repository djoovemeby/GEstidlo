package com.example.api_metier.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "reference_code_items")
public class ReferenceCodeItemEntity {

	@EmbeddedId
	private ReferenceCodeItemId id;

	@Column
	private String labelFr;

	@Column
	private String labelHt;

	@Column
	private String labelEn;

	@Column
	private String color;

	@Column(nullable = false)
	private Integer sortOrder = 0;

	@Column(nullable = false)
	private boolean active = true;

	protected ReferenceCodeItemEntity() {
	}

	public ReferenceCodeItemEntity(
			String listName,
			String code,
			String labelFr,
			String labelHt,
			String labelEn,
			String color,
			Integer sortOrder,
			boolean active) {
		this.id = new ReferenceCodeItemId(listName, code);
		this.labelFr = labelFr;
		this.labelHt = labelHt;
		this.labelEn = labelEn;
		this.color = color;
		this.sortOrder = sortOrder == null ? 0 : sortOrder;
		this.active = active;
	}

	public ReferenceCodeItemId getId() {
		return id;
	}

	public String getListName() {
		return id.getListName();
	}

	public String getCode() {
		return id.getCode();
	}

	public String getLabelFr() {
		return labelFr;
	}

	public void setLabelFr(String labelFr) {
		this.labelFr = labelFr;
	}

	public String getLabelHt() {
		return labelHt;
	}

	public void setLabelHt(String labelHt) {
		this.labelHt = labelHt;
	}

	public String getLabelEn() {
		return labelEn;
	}

	public void setLabelEn(String labelEn) {
		this.labelEn = labelEn;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public Integer getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(Integer sortOrder) {
		this.sortOrder = sortOrder == null ? 0 : sortOrder;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}
}

