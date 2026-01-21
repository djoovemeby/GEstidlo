package com.example.api_metier.repo;

import com.example.api_metier.domain.AlertEntity;
import com.example.api_metier.domain.AlertStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<AlertEntity, Long> {
	List<AlertEntity> findByStatus(AlertStatus status);

	Optional<AlertEntity> findFirstByPointIdAndTypeAndStatusOrderByOpenedAtDesc(
			String pointId,
			String type,
			AlertStatus status);

	long countByType(String type);

	long countByPointId(String pointId);
}
