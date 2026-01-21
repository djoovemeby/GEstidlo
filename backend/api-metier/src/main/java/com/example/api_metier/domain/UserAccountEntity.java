package com.example.api_metier.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_accounts")
public class UserAccountEntity {

	@Id
	@Column(nullable = false, length = 80)
	private String username;

	@Column(nullable = false)
	private String passwordHash;

	@Column(nullable = false)
	private String roles;

	@Column(nullable = false)
	private boolean active = true;

	protected UserAccountEntity() {
	}

	public UserAccountEntity(String username, String passwordHash, String roles, boolean active) {
		this.username = username;
		this.passwordHash = passwordHash;
		this.roles = roles;
		this.active = active;
	}

	public String getUsername() {
		return username;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public String getRoles() {
		return roles;
	}

	public void setRoles(String roles) {
		this.roles = roles;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}
}

