package com.example.api_metier.web;

import com.example.api_metier.domain.MeasurementType;
import com.example.api_metier.domain.PointRefEntity;
import com.example.api_metier.domain.PointType;
import com.example.api_metier.domain.ReferenceCodeItemEntity;
import com.example.api_metier.domain.ReferenceCodeItemId;
import com.example.api_metier.domain.ThresholdConfigEntity;
import com.example.api_metier.repo.PointRefRepository;
import com.example.api_metier.repo.ReferenceCodeItemRepository;
import com.example.api_metier.repo.ThresholdConfigRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reference")
public class ReferenceController {

	private final PointRefRepository points;
	private final ThresholdConfigRepository thresholds;
	private final ReferenceCodeItemRepository codeItems;

	public ReferenceController(
			PointRefRepository points,
			ThresholdConfigRepository thresholds,
			ReferenceCodeItemRepository codeItems) {
		this.points = points;
		this.thresholds = thresholds;
		this.codeItems = codeItems;
	}

	@GetMapping("/points")
	public List<PointDto> points() {
		return points.findAll().stream().map(PointDto::from).toList();
	}

	@PutMapping("/points/{id}")
	public PointDto upsertPoint(@PathVariable("id") String id, @RequestBody PointUpsertRequest body) {
		PointRefEntity entity = points.findById(id).orElseGet(() -> new PointRefEntity(
				id,
				id,
				PointType.KIOSK,
				null,
				true));

		entity.setName(body.name() == null || body.name().isBlank() ? id : body.name());
		entity.setType(body.type() == null ? entity.getType() : body.type());
		entity.setDescription(body.description());
		entity.setActive(body.active() == null ? entity.isActive() : body.active());

		return PointDto.from(points.save(entity));
	}

	@DeleteMapping("/points/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deletePoint(@PathVariable("id") String id) {
		points.deleteById(id);
	}

	@GetMapping("/thresholds")
	public List<ThresholdDto> thresholds() {
		return thresholds.findAll().stream().map(ThresholdDto::from).toList();
	}

	@PutMapping("/thresholds/{type}")
	public ThresholdDto upsertThreshold(
			@PathVariable("type") MeasurementType type,
			@RequestBody ThresholdUpsertRequest body) {
		ThresholdConfigEntity entity = thresholds.findById(type)
				.orElseGet(() -> new ThresholdConfigEntity(type, null, null));
		entity.setMinWarn(body.minWarn());
		entity.setMinCrit(body.minCrit());
		return ThresholdDto.from(thresholds.save(entity));
	}

	@GetMapping("/codelists")
	public List<CodeListDto> codeLists() {
		return codeItems.findDistinctListNames().stream().map(CodeListDto::new).toList();
	}

	@GetMapping("/codelists/{listName}")
	public List<CodeItemDto> codeList(@PathVariable("listName") String listName) {
		return codeItems.findByIdListNameOrderBySortOrderAscIdCodeAsc(listName)
				.stream()
				.map(CodeItemDto::from)
				.toList();
	}

	@PutMapping("/codelists/{listName}/{code}")
	public CodeItemDto upsertCodeItem(
			@PathVariable("listName") String listName,
			@PathVariable("code") String code,
			@RequestBody CodeItemUpsertRequest body) {
		ReferenceCodeItemEntity entity = codeItems.findById(new ReferenceCodeItemId(listName, code))
				.orElseGet(() -> new ReferenceCodeItemEntity(listName, code, null, null, null, null, 0, true));

		entity.setLabelFr(body.labelFr());
		entity.setLabelHt(body.labelHt());
		entity.setLabelEn(body.labelEn());
		entity.setColor(body.color());
		entity.setSortOrder(body.sortOrder());
		entity.setActive(body.active() == null || body.active());

		return CodeItemDto.from(codeItems.save(entity));
	}

	@DeleteMapping("/codelists/{listName}/{code}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteCodeItem(@PathVariable("listName") String listName, @PathVariable("code") String code) {
		codeItems.deleteById(new ReferenceCodeItemId(listName, code));
	}

	public record PointUpsertRequest(String name, PointType type, String description, Boolean active) {
	}

	public record PointDto(String id, String name, PointType type, String description, boolean active) {
		public static PointDto from(PointRefEntity e) {
			return new PointDto(e.getId(), e.getName(), e.getType(), e.getDescription(), e.isActive());
		}
	}

	public record ThresholdUpsertRequest(Double minWarn, Double minCrit) {
	}

	public record ThresholdDto(MeasurementType type, Double minWarn, Double minCrit) {
		public static ThresholdDto from(ThresholdConfigEntity e) {
			return new ThresholdDto(e.getType(), e.getMinWarn(), e.getMinCrit());
		}
	}

	public record CodeListDto(String name) {
	}

	public record CodeItemUpsertRequest(
			String labelFr,
			String labelHt,
			String labelEn,
			String color,
			Integer sortOrder,
			Boolean active) {
	}

	public record CodeItemDto(
			String listName,
			String code,
			String labelFr,
			String labelHt,
			String labelEn,
			String color,
			Integer sortOrder,
			boolean active) {
		public static CodeItemDto from(ReferenceCodeItemEntity e) {
			return new CodeItemDto(
				e.getListName(),
				e.getCode(),
				e.getLabelFr(),
				e.getLabelHt(),
				e.getLabelEn(),
				e.getColor(),
				e.getSortOrder(),
				e.isActive());
		}
	}
}
