package com.example.api_metier;

import com.example.api_metier.domain.PointRefEntity;
import com.example.api_metier.domain.ReferenceCodeItemEntity;
import com.example.api_metier.domain.ThresholdConfigEntity;
import com.example.api_metier.domain.UserAccountEntity;
import com.example.api_metier.repo.PointRefRepository;
import com.example.api_metier.repo.ReferenceCodeItemRepository;
import com.example.api_metier.repo.ThresholdConfigRepository;
import com.example.api_metier.repo.UserAccountRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ApiMetierApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiMetierApplication.class, args);
	}

	@Bean
	CommandLineRunner seedReferenceData(
			PointRefRepository points,
			ThresholdConfigRepository thresholds,
			ReferenceCodeItemRepository codeItems,
			UserAccountRepository users,
			PasswordEncoder passwordEncoder) {
		return args -> {
			seedUserIfMissing(users, passwordEncoder, "admin", "admin", "ADMIN");
			seedUserIfMissing(users, passwordEncoder, "tech", "tech", "TECH");
			seedUserIfMissing(users, passwordEncoder, "operator", "operator", "OPERATOR");

			if (points.count() == 0) {
				points.save(new PointRefEntity("POINT-001", "KIOSK-01", "KIOSK", "Kiosque principal", true));
				points.save(new PointRefEntity("POINT-002", "SCHOOL", "SCHOOL", "École / point critique", true));
				points.save(new PointRefEntity("POINT-003", "TANK", "TANK", "Réservoir", true));
			}

			if (thresholds.count() == 0) {
				thresholds.save(new ThresholdConfigEntity("PRESSURE", 2.0, 1.0));
				thresholds.save(new ThresholdConfigEntity("LEVEL", null, 10.0));
			}

			seedCodeList(codeItems, "ALERT_SEVERITY", List.of(
					new ReferenceCodeItemEntity("ALERT_SEVERITY", "INFO", "Info", "Info", "Info", "#16a34a", 10, true),
					new ReferenceCodeItemEntity("ALERT_SEVERITY", "WARN", "Avertissement", "Avètisman", "Warning", "#f59e0b", 20, true),
					new ReferenceCodeItemEntity("ALERT_SEVERITY", "CRIT", "Critique", "Kritik", "Critical", "#dc2626", 30, true)));

			seedCodeList(codeItems, "ALERT_STATUS", List.of(
					new ReferenceCodeItemEntity("ALERT_STATUS", "ACTIVE", "Active", "Aktif", "Active", "#dc2626", 10, true),
					new ReferenceCodeItemEntity("ALERT_STATUS", "ACK", "Acquittée", "Asepte", "Acknowledged", "#f59e0b", 20, true),
					new ReferenceCodeItemEntity("ALERT_STATUS", "CLOSED", "Clôturée", "Fèmen", "Closed", "#16a34a", 30, true)));

			seedCodeList(codeItems, "TICKET_STATUS", List.of(
					new ReferenceCodeItemEntity("TICKET_STATUS", "OPEN", "À traiter", "Pou trete", "Open", "#f59e0b", 10, true),
					new ReferenceCodeItemEntity("TICKET_STATUS", "ASSIGNED", "Assignée", "Bay", "Assigned", "#f59e0b", 20, true),
					new ReferenceCodeItemEntity("TICKET_STATUS", "IN_PROGRESS", "En cours", "An kour", "In progress", "#dc2626", 30, true),
					new ReferenceCodeItemEntity("TICKET_STATUS", "CLOSED", "Clôturée", "Fèmen", "Closed", "#16a34a", 40, true)));

			seedCodeList(codeItems, "MEASUREMENT_TYPE", List.of(
					new ReferenceCodeItemEntity("MEASUREMENT_TYPE", "PRESSURE", "Pression", "Presyon", "Pressure", "#2563eb", 10, true),
					new ReferenceCodeItemEntity("MEASUREMENT_TYPE", "LEVEL", "Niveau", "Nivo", "Level", "#2563eb", 20, true),
					new ReferenceCodeItemEntity("MEASUREMENT_TYPE", "FLOW", "Débit", "Debi", "Flow", "#2563eb", 30, true)));

			seedCodeList(codeItems, "POINT_TYPE", List.of(
					new ReferenceCodeItemEntity("POINT_TYPE", "KIOSK", "Kiosque", "Kiosk", "Kiosk", "#2563eb", 10, true),
					new ReferenceCodeItemEntity("POINT_TYPE", "SCHOOL", "École", "Lekòl", "School", "#2563eb", 20, true),
					new ReferenceCodeItemEntity("POINT_TYPE", "TANK", "Réservoir", "Tank", "Tank", "#2563eb", 30, true),
					new ReferenceCodeItemEntity("POINT_TYPE", "SOURCE", "Source", "Sous", "Source", "#2563eb", 40, true)));
		};
	}

	private void seedCodeList(ReferenceCodeItemRepository repo, String listName, List<ReferenceCodeItemEntity> items) {
		if (repo.countByIdListName(listName) > 0) {
			return;
		}
		repo.saveAll(items);
	}

	private void seedUserIfMissing(
			UserAccountRepository repo,
			PasswordEncoder passwordEncoder,
			String username,
			String rawPassword,
			String roles) {
		if (repo.existsById(username)) {
			return;
		}
		repo.save(new UserAccountEntity(
				username,
				passwordEncoder.encode(rawPassword),
				roles,
				true));
	}

}
