package com.warmindo.adzkiya.controller;

import com.warmindo.adzkiya.model.Masukan;
import com.warmindo.adzkiya.model.Pelanggan;
import com.warmindo.adzkiya.model.Pesanan;
import com.warmindo.adzkiya.repository.MasukanRepository;
import com.warmindo.adzkiya.repository.PelangganRepository;
import com.warmindo.adzkiya.repository.PesananRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private PelangganRepository pelangganRepository;

    @Autowired
    private PesananRepository pesananRepository;

    @Autowired
    private MasukanRepository masukanRepository;

    private static final DateTimeFormatter DTO_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @GetMapping(value = {"", "/", "/stats"})
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<Pelanggan> customers = pelangganRepository.findAll();
        List<Pesanan> orders = pesananRepository.findAll();
        List<Masukan> complaints = masukanRepository.findAll();

        long totalPelanggan = customers.size();
        long totalPesanan = orders.size();
        double totalOmset = 0.0;
        for (Pesanan o : orders) {
            if (o.getNominal() != null) totalOmset += o.getNominal();
        }

        // Segments breakdown
        Map<String, Integer> segmenMap = new LinkedHashMap<>();
        segmenMap.put("Mahasiswa", 0);
        segmenMap.put("Warga sekitar", 0);
        segmenMap.put("Pesanan besar", 0);
        for (Pelanggan p : customers) {
            String s = p.getSeg() != null ? p.getSeg() : "Mahasiswa";
            segmenMap.put(s, segmenMap.getOrDefault(s, 0) + 1);
        }

        // Channels breakdown
        Map<String, Integer> kanalMap = new LinkedHashMap<>();
        kanalMap.put("Dine-in", 0);
        kanalMap.put("WhatsApp", 0);
        kanalMap.put("Google Maps", 0);
        kanalMap.put("Instagram", 0);
        for (Pelanggan p : customers) {
            String k = p.getKanal() != null ? p.getKanal() : "Dine-in";
            kanalMap.put(k, kanalMap.getOrDefault(k, 0) + 1);
        }

        // SLA Compliance calculation (≤ 1 hour)
        int totalWithResponse = 0;
        int respondedOnTime = 0;
        for (Masukan m : complaints) {
            if (m.getResp() != null && !m.getResp().trim().isEmpty() && m.getMasuk() != null) {
                try {
                    LocalDateTime masuk = LocalDateTime.parse(m.getMasuk().trim(), DTO_FMT);
                    LocalDateTime resp = LocalDateTime.parse(m.getResp().trim(), DTO_FMT);
                    long minutes = ChronoUnit.MINUTES.between(masuk, resp);
                    totalWithResponse++;
                    if (minutes <= 60) {
                        respondedOnTime++;
                    }
                } catch (Exception ignored) {}
            }
        }

        double slaRate = totalWithResponse > 0 ? ((double) respondedOnTime / totalWithResponse) * 100.0 : 100.0;
        long optInCount = customers.stream().filter(p -> Boolean.TRUE.equals(p.getOptin())).count();
        double optInRate = totalPelanggan > 0 ? ((double) optInCount / totalPelanggan) * 100.0 : 75.0;

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalPelanggan", totalPelanggan);
        resp.put("totalPesanan", totalPesanan);
        resp.put("totalOmset", totalOmset);
        resp.put("optInRate", Math.round(optInRate));
        resp.put("optInCount", optInCount);
        resp.put("slaComplianceRate", Math.round(slaRate * 10.0) / 10.0);
        resp.put("respondedOnTime", respondedOnTime);
        resp.put("totalResponded", totalWithResponse);
        resp.put("totalComplaints", complaints.size());
        resp.put("segmenDistribution", segmenMap);
        resp.put("kanalDistribution", kanalMap);

        return ResponseEntity.ok(resp);
    }
}
