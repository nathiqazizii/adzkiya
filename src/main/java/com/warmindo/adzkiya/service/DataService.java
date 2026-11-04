package com.warmindo.adzkiya.service;

import com.warmindo.adzkiya.model.*;
import com.warmindo.adzkiya.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DataService implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PelangganRepository pelangganRepository;

    @Autowired
    private PesananRepository pesananRepository;

    @Autowired
    private MasukanRepository masukanRepository;

    @Override
    public void run(String... args) throws Exception {
        initUsers();
        if (pelangganRepository.count() == 0) {
            seedDemoData();
        }
    }

    public void initUsers() {
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(new User("admin", "admin123", "Admin Adzkiya", "Admin"));
        }
        if (!userRepository.existsByUsername("pemilik")) {
            userRepository.save(new User("pemilik", "pemilik123", "Pemilik Warmindo", "Pemilik"));
        }
        if (!userRepository.existsByUsername("koki")) {
            userRepository.save(new User("koki", "koki123", "Koki Utama", "Koki"));
        }
        if (!userRepository.existsByUsername("pembeli")) {
            userRepository.save(new User("pembeli", "pembeli123", "Pelanggan Adzkiya (Meja 03)", "Pembeli", "P03"));
        } else {
            userRepository.findByUsername("pembeli").ifPresent(u -> {
                if (u.getPelangganId() == null) {
                    u.setPelangganId("P03");
                    userRepository.save(u);
                }
            });
        }
    }

    @Transactional
    public void seedDemoData() {
        pelangganRepository.deleteAll();
        pesananRepository.deleteAll();
        masukanRepository.deleteAll();

        String[][] menuList = {
            {"Indomie telor kornet", "12000"},
            {"Magelangan", "13000"},
            {"Nasi telur", "8000"},
            {"Paket VIP (nasi telur + minum)", "10000"}
        };

        String[] names = {
            "Dimas", "Raka", "Nadia", "Ayu", "Bagas", "Fikri", "Salsa", "Rizal",
            "Putri", "Andi", "Tegar", "Maya", "Wahyu", "Dewi", "Hafiz", "Citra",
            "Yoga", "Laras", "Fajar", "Intan"
        };
        String[] channels = {"Dine-in", "WhatsApp", "Google Maps", "Dine-in", "WhatsApp"};

        List<Pelanggan> pelangganList = new ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            String id = String.format("P%02d", i + 1);
            String nama = names[i];
            String wa = "62812****" + String.format("%04d", 100 + i * 7);
            String kanal = channels[i % 5];
            String seg = (i % 5 == 4) ? "Pesanan besar" : ((i % 4 == 3) ? "Warga sekitar" : "Mahasiswa");
            String label = (i % 3 == 0) ? "Pelanggan Tetap" : ((i % 5 == 4) ? "Pemesanan" : "Pelanggan");
            boolean optin = (i % 4 != 3);
            String tgl = String.format("2026-09-%02d", i + 1);

            Pelanggan p = new Pelanggan(id, nama, wa, kanal, seg, label, optin, tgl);
            pelangganList.add(p);
        }
        pelangganRepository.saveAll(pelangganList);

        // Orders
        List<Pesanan> pesananList = new ArrayList<>();
        int orderCount = 1;
        for (int i = 0; i < pelangganList.size(); i++) {
            Pelanggan p = pelangganList.get(i);
            int numOrders = (i % 3) + 1;
            for (int j = 0; j < numOrders; j++) {
                String[] m = menuList[(i + j) % 4];
                String oId = String.format("O%02d", orderCount++);
                int day = 1 + ((i * 3 + j * 9) % 28);
                String tgl = String.format("2026-10-%02d 19:%02d", day, 10 + i);
                String saluran = (j % 2 == 1) ? "WhatsApp" : "Dine-in";
                String menuNama = m[0];
                double basePrice = Double.parseDouble(m[1]);
                double nominal = basePrice * ("Pesanan besar".equals(p.getSeg()) ? 10.0 : 1.0);
                String status = (orderCount <= 3) ? "Menunggu" : ((orderCount <= 6) ? "Dimasak" : ((orderCount <= 8) ? "Siap Saji" : "Selesai"));

                Pesanan o = new Pesanan(oId, p.getId(), tgl, saluran, menuNama, nominal, status);
                pesananList.add(o);
            }
        }
        pesananRepository.saveAll(pesananList);

        // Masukan / Keluhan
        List<Masukan> masukanList = new ArrayList<>();
        masukanList.add(new Masukan("M01", "P02", "WhatsApp", "Waktu tunggu", "Pesanan datang sekitar 40 menit saat ramai.", "Admin", "Selesai", "2026-10-12 20:05", "2026-10-12 20:20"));
        masukanList.add(new Masukan("M02", "P04", "Google Maps", "Bahan habis", "Telur habis jam 21.00.", "Pemilik", "Diproses", "2026-10-15 21:10", "2026-10-15 21:40"));
        masukanList.add(new Masukan("M03", "P07", "Dine-in", "Kebersihan", "Menanyakan kebersihan alat masak.", "Koki", "Selesai", "2026-10-18 19:30", "2026-10-18 19:35"));
        masukanList.add(new Masukan("M04", "P09", "WhatsApp", "Tempat/fasilitas", "Tempat duduk penuh dan panas.", "Admin", "Baru", "2026-10-20 20:00", ""));
        masukanRepository.saveAll(masukanList);
    }

    public synchronized String getNextPelangganId() {
        List<Pelanggan> all = pelangganRepository.findAll();
        int max = 0;
        for (Pelanggan p : all) {
            try {
                if (p.getId().startsWith("P")) {
                    int val = Integer.parseInt(p.getId().substring(1));
                    if (val > max) max = val;
                }
            } catch (Exception ignored) {}
        }
        return String.format("P%02d", max + 1);
    }

    public synchronized String getNextPesananId() {
        List<Pesanan> all = pesananRepository.findAll();
        int max = 0;
        for (Pesanan o : all) {
            try {
                if (o.getId().startsWith("O")) {
                    int val = Integer.parseInt(o.getId().substring(1));
                    if (val > max) max = val;
                }
            } catch (Exception ignored) {}
        }
        return String.format("O%02d", max + 1);
    }

    public synchronized String getNextMasukanId() {
        List<Masukan> all = masukanRepository.findAll();
        int max = 0;
        for (Masukan m : all) {
            try {
                if (m.getId().startsWith("M")) {
                    int val = Integer.parseInt(m.getId().substring(1));
                    if (val > max) max = val;
                }
            } catch (Exception ignored) {}
        }
        return String.format("M%02d", max + 1);
    }
}
