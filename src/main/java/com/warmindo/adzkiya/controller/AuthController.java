package com.warmindo.adzkiya.controller;

import com.warmindo.adzkiya.model.Pelanggan;
import com.warmindo.adzkiya.model.User;
import com.warmindo.adzkiya.repository.PelangganRepository;
import com.warmindo.adzkiya.repository.UserRepository;
import com.warmindo.adzkiya.service.DataService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PelangganRepository pelangganRepository;

    @Autowired
    private DataService dataService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload, HttpSession session) {
        String username = payload.get("username");
        String password = payload.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username dan password wajib diisi."));
        }

        Optional<User> userOpt = userRepository.findByUsernameAndPassword(username.trim(), password.trim());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            session.setAttribute("user", user);

            Map<String, Object> resp = new HashMap<>();
            resp.put("authenticated", true);
            resp.put("username", user.getUsername());
            resp.put("namaLengkap", user.getNamaLengkap());
            resp.put("role", user.getRole());
            resp.put("pelangganId", user.getPelangganId());
            return ResponseEntity.ok(resp);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "authenticated", false,
                "message", "Username atau password salah."
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload, HttpSession session) {
        String username = payload.get("username");
        String password = payload.get("password");
        String namaLengkap = payload.get("namaLengkap");
        String noWa = payload.get("noWa");

        if (username == null || username.trim().isEmpty() ||
            password == null || password.trim().isEmpty() ||
            namaLengkap == null || namaLengkap.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama lengkap, username, dan password wajib diisi."));
        }

        username = username.trim().toLowerCase();
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "message", "Username '" + username + "' sudah digunakan. Silakan gunakan username lain."
            ));
        }

        // 1. Generate new Pelanggan in CRM database so customer appears in master records
        String newPid = dataService.getNextPelangganId();
        String cleanPhone = (noWa != null && !noWa.trim().isEmpty()) ? noWa.trim() : "0812****0000";
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        Pelanggan p = new Pelanggan(
            newPid,
            namaLengkap.trim(),
            cleanPhone,
            "Dine-in",
            "Mahasiswa",
            "Pelanggan",
            true,
            today
        );
        pelangganRepository.save(p);

        // 2. Save User account with role 'Pembeli'
        User newUser = new User(username, password.trim(), namaLengkap.trim(), "Pembeli", newPid);
        userRepository.save(newUser);

        // 3. Authenticate session immediately
        session.setAttribute("user", newUser);

        Map<String, Object> resp = new HashMap<>();
        resp.put("authenticated", true);
        resp.put("username", newUser.getUsername());
        resp.put("namaLengkap", newUser.getNamaLengkap());
        resp.put("role", newUser.getRole());
        resp.put("pelangganId", newPid);
        resp.put("message", "Pendaftaran berhasil! Selamat datang di Warmindo Adzkiya.");
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "authenticated", false,
                "message", "Sesi belum aktif. Silakan masuk terlebih dahulu."
            ));
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("authenticated", true);
        resp.put("username", user.getUsername());
        resp.put("namaLengkap", user.getNamaLengkap());
        resp.put("role", user.getRole());
        resp.put("pelangganId", user.getPelangganId());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/switch-role")
    public ResponseEntity<?> switchRole(@RequestBody Map<String, String> payload, HttpSession session) {
        String role = payload.get("role");
        if (role == null || role.trim().isEmpty()) role = "Admin";
        role = role.trim();

        String finalRole = role;
        Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> u.getRole().equalsIgnoreCase(finalRole))
                .findFirst();

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            String nama = "Admin".equalsIgnoreCase(role) ? "Admin Adzkiya" :
                          "Pemilik".equalsIgnoreCase(role) ? "Pemilik Warmindo" :
                          "Koki".equalsIgnoreCase(role) ? "Koki Utama" : "Pelanggan Adzkiya";
            user = new User(role.toLowerCase(), role.toLowerCase() + "123", nama, role, "P03");
        }
        session.setAttribute("user", user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("authenticated", true);
        resp.put("username", user.getUsername());
        resp.put("namaLengkap", user.getNamaLengkap());
        resp.put("role", user.getRole());
        resp.put("pelangganId", user.getPelangganId());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Berhasil logout."));
    }
}
