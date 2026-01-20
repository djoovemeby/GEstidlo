package com.example.api_metier.web;

import com.example.api_metier.domain.TicketEntity;
import com.example.api_metier.domain.TicketStatus;
import com.example.api_metier.repo.TicketRepository;
import com.example.api_metier.service.TicketService;
import com.example.api_metier.service.TicketService.CreateTicketRequest;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

	private final TicketService ticketService;
	private final TicketRepository tickets;

	public TicketController(TicketService ticketService, TicketRepository tickets) {
		this.ticketService = ticketService;
		this.tickets = tickets;
	}

	@GetMapping
	public List<TicketEntity> list(@RequestParam(name = "status", required = false) TicketStatus status) {
		return status == null ? tickets.findAll() : tickets.findByStatus(status);
	}

	@PostMapping
	public TicketEntity create(@RequestBody CreateTicketRequest request) {
		return ticketService.createTicket(request);
	}

	@PostMapping("/{id}/advance")
	public TicketEntity advance(@PathVariable("id") Long id) {
		return ticketService.advance(id);
	}
}

