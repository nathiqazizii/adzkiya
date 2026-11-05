package com.warmindo.adzkiya.repository;

import com.warmindo.adzkiya.model.Pesanan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PesananRepository extends JpaRepository<Pesanan, String> {
    List<Pesanan> findByPid(String pid);

    @Query("SELECT o FROM Pesanan o ORDER BY o.tgl DESC")
    List<Pesanan> findAllOrderByTglDesc();

    @Query("SELECT o FROM Pesanan o WHERE o.pid = :pid ORDER BY o.tgl DESC")
    List<Pesanan> findLatestByPid(String pid);

    @Query("SELECT SUM(o.nominal) FROM Pesanan o")
    Double calculateTotalOmset();
}
