package com.warmindo.adzkiya.controller;

import com.warmindo.adzkiya.model.Pelanggan;
import com.warmindo.adzkiya.model.Pesanan;
import com.warmindo.adzkiya.repository.PelangganRepository;
import com.warmindo.adzkiya.repository.PesananRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/sapa-hangat")
public class SapaHangatController {

    @Autowired
    private PelangganRepository pelangganRepository;

    @Autowired
    private PesananRepository pesananRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getSapaHangatList(
            @RequestParam(defaultValue = "10") int dormantDays,
            @RequestParam(required = false) Boolean optinOnly) {

        List<Pelanggan> customers = pelangganRepository.findAll();
        List<Pesanan> allOrders = pesananRepository.findAll();

        // Group orders by customer
        Map<String, List<Pesanan>> ordersByCust = new HashMap<>();
        for (Pesanan o : allOrders) {
            ordersByCust.computeIfAbsent(o.getPid(), k -> new ArrayList<>()).add(o);
        }

        LocalDate referenceDate = LocalDate.now();
        List<Map<String, Object>> candidates = new ArrayList<>();

        for (Pelanggan p : customers) {
            if (Boolean.TRUE.equals(optinOnly) && !Boolean.TRUE.equals(p.getOptin())) {
                continue;
            }

            List<Pesanan> pOrders = ordersByCust.getOrDefault(p.getId(), Collections.emptyList());
            pOrders.sort((a, b) -> b.getTgl().compareTo(a.getTgl()));

            String lastOrderDateStr = "—";
            String lastMenu = "menu favorit";
            long daysAgo = 999;

            if (!pOrders.isEmpty()) {
                Pesanan latest = pOrders.get(0);
                if (latest.getTgl() != null && latest.getTgl().length() >= 10) {
                    lastOrderDateStr = latest.getTgl().substring(0, 10);
                    try {
                        LocalDate lastDate = LocalDate.parse(lastOrderDateStr);
                        daysAgo = ChronoUnit.DAYS.between(lastDate, referenceDate);
                    } catch (Exception ignored) {
                        daysAgo = 20; // fallback default
                    }
                }
                if (latest.getMenu() != null) {
                    lastMenu = latest.getMenu();
                }
            }

            // Generate clean personalized greeting without emojis
            String rawMessage = String.format(
                "Halo Kak %s, salam hangat dari Warmindo Adzkiya. Kami rindu kehadiran Anda, terakhir menikmati %s ya? " +
                "Kebetulan hari ini kami menyiapkan menu spesial untuk pelanggan setia kami. Silakan mampir dine-in atau pesan via WhatsApp!",
                p.getNama(), lastMenu
            );

            String cleanWa = p.getWa().replaceAll("[^0-9]", "");
            if (cleanWa.startsWith("0")) {
                cleanWa = "62" + cleanWa.substring(1);
            }
            String waLink = "https://wa.me/" + cleanWa + "?text=" + URLEncoder.encode(rawMessage, StandardCharsets.UTF_8);

            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("pelangganId", p.getId());
            map.put("nama", p.getNama());
            map.put("pelangganNama", p.getNama());
            map.put("wa", p.getWa());
            map.put("pelangganWa", p.getWa());
            map.put("seg", p.getSeg());
            map.put("pelangganSeg", p.getSeg());
            map.put("label", p.getLabel());
            map.put("optin", p.getOptin());
            map.put("pesananTerakhir", lastOrderDateStr);
            map.put("menuTerakhir", lastMenu);
            map.put("totalPesanan", pOrders.size());
            map.put("hariSejakPesan", daysAgo);
            map.put("hariSejakPesananTerakhir", daysAgo);
            map.put("draftPesan", rawMessage);
            map.put("waLink", waLink);

            candidates.add(map);
        }

        // Sort descending by days since last order (most dormant first)
        candidates.sort((a, b) -> Long.compare((Long) b.get("hariSejakPesan"), (Long) a.get("hariSejakPesan")));

        return ResponseEntity.ok(candidates);
    }
}
