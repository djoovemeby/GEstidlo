package com.example.api_metier.service;

import com.example.api_metier.domain.UserAccountEntity;
import com.example.api_metier.repo.UserAccountRepository;
import java.util.Arrays;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserAccountDetailsService implements UserDetailsService {

	private final UserAccountRepository users;

	public UserAccountDetailsService(UserAccountRepository users) {
		this.users = users;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserAccountEntity u = users.findById(username).orElseThrow(() -> new UsernameNotFoundException(username));
		String[] roles = Arrays.stream((u.getRoles() == null ? "" : u.getRoles()).split(","))
				.map(String::trim)
				.filter(s -> !s.isBlank())
				.toArray(String[]::new);
		return User.withUsername(u.getUsername())
				.password(u.getPasswordHash())
				.roles(roles)
				.disabled(!u.isActive())
				.build();
	}
}

