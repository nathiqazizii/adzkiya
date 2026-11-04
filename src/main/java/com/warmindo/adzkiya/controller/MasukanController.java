package com.warmindo.adzkiya.controller;

import com.warmindo.adzkiya.model.Masukan;
import com.warmindo.adzkiya.model.Pelanggan;
import com.warmindo.adzkiya.repository.MasukanRepository;
import com.warmindo.adzkiya.repository.PelangganRepository;
import com.warmindo.adzkiya.service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/masukan")
public class MasukanController {

    @Autowired
    private MasukanRepository masukanRepository;

    @Autowired
    private PelangganRepository pelangganRepository;

    @Autowired
    private DataService dataService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMasukanList() {
        List<Masukan> all = masukanRepository.findAllOrderByMasukDesc();
        List<Pelanggan> customers = pelangganRepository.findAll();
        Map<String, Pelanggan> custMap = new HashMap<>();
        for (Pelanggan p : customers) {
            custMap.put(p.getId(), p);
        }

        long cntBaru = 0, cntDiproses = 0, cntSelesai = 0;
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Masukan m : all) {
            if ("Baru".equalsIgnoreCase(m.getStatus())) cntBaru++;
            else if ("Diproses".equalsIgnoreCase(m.getStatus())) cntDiproses++;
            else if ("Selesai".equalsIgnoreCase(m.getStatus())) cntSelesai++;

            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("pid", m.getPid());
            map.put("kanal", m.getKanal());
            map.put("kat", m.getKat());
            map.put("isi", m.getIsi());
            map.put("pic", m.getPic());
            map.put("status", m.getStatus());
            map.put("masuk", m.getMasuk());
            map.put("resp", m.getResp());

            if (m.getPid() != null && custMap.containsKey(m.getPid())) {
                Pelanggan p = custMap.get(m.getPid());
                map.put("pelangganNama", p.getNama());
                map.put("pelangganWa", p.getWa());
            } else {
                map.put("pelangganNama", "Tanpa data pelanggan");
                map.put("pelangganWa", "");
            }

            rows.add(map);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("cntBaru", cntBaru);
        resp.put("cntDiproses", cntDiproses);
        resp.put("cntSelesai", cntSelesai);
        resp.put("rows", rows);

        return ResponseEntity.ok(resp);
    }

    @PostMapping
    public ResponseEntity<?> createMasukan(@RequestBody Map<String, String> payload) {
        String isi = payload.get("isi");
        if (isi == null || isi.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Isi masukan/keluhan wajib diisi."));
        }

        String nextId = dataService.getNextMasukanId();
        String pid = payload.get("pid");
        String kanal = payload.getOrDefault("kanal", "WhatsApp");
        String kat = payload.getOrDefault("kat", "Lainnya");
        String pic = payload.getOrDefault("pic", "Admin");
        String masuk = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        Masukan m = new Masukan(nextId, pid, kanal, kat, isi.trim(), pic, "Baru", masuk, "");
        Masukan saved = masukanRepository.save(m);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        Optional<Masukan> opt = masukanRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        String status = payload.get("status");
        if (status != null) {
            Masukan m = opt.get();
            m.setStatus(status);
            masukanRepository.save(m);
        }
        return ResponseEntity.ok(Map.of("message", "Status berhasil diubah."));
    }

    @PatchMapping("/{id}/respond")
    public ResponseEntity<?> markResponded(@PathVariable String id) {
        Optional<Masukan> opt = masukanRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Masukan m = opt.get();
        m.setResp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        m.setStatus("Selesai");
        masukanRepository.save(m);
        return ResponseEntity.ok(Map.of(
            "id", m.getId(),
            "status", m.getStatus(),
            "resp", m.getResp(),
            "message", "Keluhan ditandai telah direspons dan selesai."
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMasukan(@PathVariable String id) {
        if (!masukanRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        masukanRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Tiket keluhan " + id + " berhasil dihapus."));
    }
}
