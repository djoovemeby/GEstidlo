package com.example.api_metier.repo;

import com.example.api_metier.domain.ThresholdConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThresholdConfigRepository extends JpaRepository<ThresholdConfigEntity, String> {
}
