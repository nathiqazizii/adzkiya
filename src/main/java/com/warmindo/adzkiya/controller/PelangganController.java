package com.warmindo.adzkiya.controller;

import com.warmindo.adzkiya.model.Pelanggan;
import com.warmindo.adzkiya.model.Pesanan;
import com.warmindo.adzkiya.repository.PelangganRepository;
import com.warmindo.adzkiya.repository.PesananRepository;
import com.warmindo.adzkiya.service.DataService;
import com.warmindo.adzkiya.model.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/pelanggan")
public class PelangganController {

    @Autowired
    private PelangganRepository pelangganRepository;

    @Autowired
    private PesananRepository pesananRepository;

    @Autowired
    private DataService dataService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getPelangganList(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String label,
            @RequestParam(required = false) String kanal) {

        List<Pelanggan> list = pelangganRepository.searchPelanggan(q, label, kanal);

        // Preload latest order date for each customer
        List<Pesanan> allOrders = pesananRepository.findAll();
        Map<String, String> lastOrderMap = new HashMap<>();
        for (Pesanan o : allOrders) {
            String existing = lastOrderMap.get(o.getPid());
            String dateOnly = o.getTgl() != null && o.getTgl().length() >= 10 ? o.getTgl().substring(0, 10) : "";
            if (existing == null || dateOnly.compareTo(existing) > 0) {
                lastOrderMap.put(o.getPid(), dateOnly);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Pelanggan p : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("nama", p.getNama());
            map.put("wa", p.getWa());
            map.put("kanal", p.getKanal());
            map.put("seg", p.getSeg());
            map.put("label", p.getLabel());
            map.put("optin", p.getOptin());
            map.put("tgl", p.getTgl());
            map.put("pesananTerakhir", lastOrderMap.getOrDefault(p.getId(), "—"));
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPelangganById(@PathVariable String id) {
        return pelangganRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPelanggan(@RequestBody Pelanggan payload) {
        if (payload.getNama() == null || payload.getNama().trim().isEmpty() ||
            payload.getWa() == null || payload.getWa().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama dan No WhatsApp wajib diisi."));
        }

        String nextId = dataService.getNextPelangganId();
        payload.setId(nextId);
        if (payload.getTgl() == null || payload.getTgl().isEmpty()) {
            payload.setTgl(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        }
        if (payload.getKanal() == null || payload.getKanal().isEmpty()) payload.setKanal("WhatsApp");
        if (payload.getSeg() == null || payload.getSeg().isEmpty()) payload.setSeg("Mahasiswa");
        if (payload.getLabel() == null || payload.getLabel().isEmpty()) payload.setLabel("Pelanggan");
        if (payload.getOptin() == null) payload.setOptin(true);

        Pelanggan saved = pelangganRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePelanggan(@PathVariable String id, @RequestBody Pelanggan payload) {
        Optional<Pelanggan> existingOpt = pelangganRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Pelanggan p = existingOpt.get();
        if (payload.getNama() != null) p.setNama(payload.getNama().trim());
        if (payload.getWa() != null) p.setWa(payload.getWa().trim());
        if (payload.getKanal() != null) p.setKanal(payload.getKanal());
        if (payload.getSeg() != null) p.setSeg(payload.getSeg());
        if (payload.getLabel() != null) p.setLabel(payload.getLabel());
        if (payload.getOptin() != null) p.setOptin(payload.getOptin());

        Pelanggan saved = pelangganRepository.save(p);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePelanggan(@PathVariable String id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null && !"Admin".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "message", "Akses ditolak: Hanya peran Admin yang diizinkan menghapus data pelanggan."
            ));
        }
        if (!pelangganRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pelangganRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Pelanggan " + id + " berhasil dihapus."));
    }

    @PostMapping("/reset-demo")
    public ResponseEntity<?> resetDemo(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null && !"Admin".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "message", "Akses ditolak: Hanya peran Admin yang diizinkan mereset data demo."
            ));
        }
        dataService.seedDemoData();
        return ResponseEntity.ok(Map.of("message", "Data demo berhasil direset ke kondisi awal."));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        List<Pelanggan> list = pelangganRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("id,nama,no_wa,asal_kanal,segmen,label,opt_in,tgl_daftar\n");
        for (Pelanggan p : list) {
            sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    p.getId(),
                    p.getNama().replace("\"", "\"\""),
                    p.getWa().replace("\"", "\"\""),
                    p.getKanal(),
                    p.getSeg(),
                    p.getLabel(),
                    Boolean.TRUE.equals(p.getOptin()) ? "ya" : "tidak",
                    p.getTgl() != null ? p.getTgl() : ""));
        }

        byte[] bytes = sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"data_pelanggan_samaran.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
