package com.example.api_metier.repo;

import com.example.api_metier.domain.PointRefEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointRefRepository extends JpaRepository<PointRefEntity, String> {
	List<PointRefEntity> findByActiveTrueOrderByIdAsc();

	long countByType(String type);
}
