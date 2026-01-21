package com.example.api_metier.repo;

import com.example.api_metier.domain.ReferenceCodeItemEntity;
import com.example.api_metier.domain.ReferenceCodeItemId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReferenceCodeItemRepository extends JpaRepository<ReferenceCodeItemEntity, ReferenceCodeItemId> {
	long countByIdListName(String listName);

	List<ReferenceCodeItemEntity> findByIdListNameOrderBySortOrderAscIdCodeAsc(String listName);

	@Query("select distinct r.id.listName from ReferenceCodeItemEntity r order by r.id.listName")
	List<String> findDistinctListNames();

	@Query(
			"select r from ReferenceCodeItemEntity r where r.id.listName = :listName and r.active = true order by r.sortOrder asc, r.id.code asc")
	List<ReferenceCodeItemEntity> findActiveByListName(@Param("listName") String listName);
}

