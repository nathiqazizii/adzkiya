package com.warmindo.adzkiya.controller;

import com.warmindo.adzkiya.model.Pelanggan;
import com.warmindo.adzkiya.model.Pesanan;
import com.warmindo.adzkiya.repository.PelangganRepository;
import com.warmindo.adzkiya.repository.PesananRepository;
import com.warmindo.adzkiya.service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/pesanan")
public class PesananController {

    @Autowired
    private PesananRepository pesananRepository;

    @Autowired
    private PelangganRepository pelangganRepository;

    @Autowired
    private DataService dataService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPesananList() {
        List<Pesanan> all = pesananRepository.findAllOrderByTglDesc();
        List<Pelanggan> customers = pelangganRepository.findAll();
        Map<String, Pelanggan> custMap = new HashMap<>();
        for (Pelanggan p : customers) {
            custMap.put(p.getId(), p);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        int limit = Math.min(all.size(), 40);
        for (int i = 0; i < limit; i++) {
            Pesanan o = all.get(i);
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("pid", o.getPid());
            map.put("tgl", o.getTgl());
            map.put("saluran", o.getSaluran());
            map.put("menu", o.getMenu());
            map.put("nominal", o.getNominal());
            map.put("status", o.getStatus() != null ? o.getStatus() : "Selesai");

            Pelanggan p = custMap.get(o.getPid());
            if (p != null) {
                map.put("pelangganNama", p.getNama());
                map.put("pelangganWa", p.getWa());
            } else {
                map.put("pelangganNama", "Tanpa data");
                map.put("pelangganWa", "");
            }
            rows.add(map);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("total", all.size());
        resp.put("rows", rows);
        return ResponseEntity.ok(resp);
    }

    @PostMapping
    public ResponseEntity<?> createPesanan(@RequestBody Map<String, Object> payload) {
        String pid = (String) payload.get("pid");
        String saluran = (String) payload.get("saluran");
        String menu = (String) payload.get("menu");
        String status = (String) payload.get("status");
        Object nominalObj = payload.get("nominal");

        if (pid == null || menu == null || nominalObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Pelanggan, menu, dan nominal wajib diisi."));
        }

        double nominal = 0.0;
        try {
            nominal = Double.parseDouble(nominalObj.toString());
        } catch (Exception e) {
            nominal = 0.0;
        }

        String nextId = dataService.getNextPesananId();
        String tgl = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        if (saluran == null || saluran.isEmpty()) saluran = "Dine-in";
        if (status == null || status.isEmpty()) status = "Menunggu";

        Pesanan order = new Pesanan(nextId, pid, tgl, saluran, menu, nominal, status);
        Pesanan saved = pesananRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePesanan(@PathVariable String id) {
        if (!pesananRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pesananRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Pesanan " + id + " berhasil dihapus."));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        Optional<Pesanan> opt = pesananRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Pesanan o = opt.get();
        String st = payload.get("status");
        if (st != null && !st.trim().isEmpty()) {
            o.setStatus(st.trim());
            pesananRepository.save(o);
        }
        return ResponseEntity.ok(o);
    }
}
