package com.warmindo.adzkiya.repository;

import com.warmindo.adzkiya.model.Pelanggan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PelangganRepository extends JpaRepository<Pelanggan, String> {
    
    @Query("SELECT p FROM Pelanggan p WHERE " +
           "(:q IS NULL OR :q = '' OR LOWER(p.nama) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.wa) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND (:label IS NULL OR :label = '' OR p.label = :label) " +
           "AND (:kanal IS NULL OR :kanal = '' OR p.kanal = :kanal) " +
           "ORDER BY p.id ASC")
    List<Pelanggan> searchPelanggan(@Param("q") String q, @Param("label") String label, @Param("kanal") String kanal);
}
