package com.example.api_metier.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ReferenceCodeItemId implements Serializable {

	@Column(nullable = false, length = 80)
	private String listName;

	@Column(nullable = false, length = 80)
	private String code;

	protected ReferenceCodeItemId() {
	}

	public ReferenceCodeItemId(String listName, String code) {
		this.listName = listName;
		this.code = code;
	}

	public String getListName() {
		return listName;
	}

	public String getCode() {
		return code;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		ReferenceCodeItemId that = (ReferenceCodeItemId) o;
		return Objects.equals(listName, that.listName) && Objects.equals(code, that.code);
	}

	@Override
	public int hashCode() {
		return Objects.hash(listName, code);
	}
}

