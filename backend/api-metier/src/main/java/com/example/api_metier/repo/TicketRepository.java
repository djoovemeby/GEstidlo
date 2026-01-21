package com.example.api_metier.repo;

import com.example.api_metier.domain.TicketEntity;
import com.example.api_metier.domain.TicketStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<TicketEntity, Long> {
	List<TicketEntity> findByStatus(TicketStatus status);

	long countByPointId(String pointId);
}
