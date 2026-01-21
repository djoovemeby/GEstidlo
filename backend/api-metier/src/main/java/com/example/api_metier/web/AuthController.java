package com.example.api_metier.web;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final JwtEncoder jwtEncoder;

	public AuthController(AuthenticationManager authenticationManager, JwtEncoder jwtEncoder) {
		this.authenticationManager = authenticationManager;
		this.jwtEncoder = jwtEncoder;
	}

	@PostMapping("/login")
	public LoginResponse login(@RequestBody LoginRequest request) {
		Authentication auth;
		try {
			auth = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(request.username(), request.password()));
		} catch (BadCredentialsException e) {
			throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials");
		}

		Instant now = Instant.now();
		Instant exp = now.plus(8, ChronoUnit.HOURS);
		List<String> roles = auth.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.filter(a -> a.startsWith("ROLE_"))
				.map(a -> a.substring("ROLE_".length()))
				.sorted()
				.collect(Collectors.toList());

		JwtClaimsSet claims = JwtClaimsSet.builder()
				.subject(auth.getName())
				.issuedAt(now)
				.expiresAt(exp)
				.claim("roles", roles)
				.build();

		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
		return new LoginResponse(token, auth.getName(), roles, exp);
	}

	@GetMapping("/me")
	public MeResponse me(Authentication auth) {
		List<String> roles = auth.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.filter(a -> a.startsWith("ROLE_"))
				.map(a -> a.substring("ROLE_".length()))
				.sorted()
				.toList();
		return new MeResponse(auth.getName(), roles);
	}

	@PostMapping("/logout")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void logout() {
		// stateless JWT => no server-side logout
	}

	public record LoginRequest(String username, String password) {
	}

	public record LoginResponse(String token, String username, List<String> roles, Instant expiresAt) {
	}

	public record MeResponse(String username, List<String> roles) {
	}
}
