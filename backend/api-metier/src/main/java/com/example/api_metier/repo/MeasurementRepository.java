package com.example.api_metier.repo;

import com.example.api_metier.domain.MeasurementEntity;
import com.example.api_metier.domain.MeasurementType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeasurementRepository extends JpaRepository<MeasurementEntity, Long> {
	Optional<MeasurementEntity> findTop1ByPointIdAndTypeOrderByTimestampDesc(String pointId, MeasurementType type);

	List<MeasurementEntity> findByPointIdAndTypeAndTimestampBetweenOrderByTimestampAsc(
			String pointId,
			MeasurementType type,
			Instant from,
			Instant to);

	List<MeasurementEntity> findTop100ByPointIdOrderByTimestampDesc(String pointId);
}
