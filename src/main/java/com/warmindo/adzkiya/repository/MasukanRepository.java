package com.warmindo.adzkiya.repository;

import com.warmindo.adzkiya.model.Masukan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MasukanRepository extends JpaRepository<Masukan, String> {
    List<Masukan> findByStatus(String status);
    long countByStatus(String status);

    @Query("SELECT m FROM Masukan m ORDER BY m.masuk DESC")
    List<Masukan> findAllOrderByMasukDesc();
}
