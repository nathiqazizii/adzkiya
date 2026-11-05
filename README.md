# CRM Warmindo Adzkiya

Sistem Operasional, Kitchen Display System (KDS), dan Manajemen Hubungan Pelanggan (CRM) untuk Warmindo Adzkiya. Aplikasi dibangun menggunakan arsitektur monorepo berbasis Java 17, Spring Boot 3.2.5, MySQL, dan Semantic Web Modern.

---

## Panduan Cepat Menjalankan Aplikasi

### 1. Jalankan MySQL
Pastikan layanan MySQL aktif pada port 3306 dengan basis data `crm_adzkiya`:
- Jika menggunakan Laragon / XAMPP: klik tombol Start pada modul MySQL.
- Skrip inisialisasi tabel dan data awal tersedia di `crm_adzkiya.sql`.

### 2. Jalankan Server Aplikasi
Jalankan skrip peluncur otomatis dari terminal workspace:
```cmd
.\run.bat
```
Atau jalankan langsung melalui Maven Wrapper:
```cmd
.\mvnw.cmd spring-boot:run
```
Aplikasi akan aktif dan dapat diakses di: **http://localhost:8080**

### 3. Pengujian Otomatis
Untuk memvalidasi seluruh endpoint backend, autentikasi, dan hak akses CRUD per peran:
```powershell
powershell -ExecutionPolicy Bypass -File .\test_suite.ps1
```

---

## Akun Demo & Kredensial

Tersedia 4 akun bawaan untuk menguji alur kerja setiap peran. Pada halaman `login.html`, tersedia tombol akses cepat 1-klik untuk setiap peran:

| Peran | Username | Password | Modul Utama |
|---|---|---|---|
| Admin | admin | admin123 | Data Pelanggan UTS 3a (CRUD Penuh), Kasir, Masukan SLA, Dashboard Analitik, Sapa Hangat WA |
| Pemilik | pemilik | pemilik123 | Dashboard Omset Finansial, Audit Kepatuhan SLA, Direktori Pelanggan (Hanya Baca) |
| Koki | koki | koki123 | Antrean Dapur KDS (Mulai Masak, Siap Saji, Selesai), Evaluasi Kualitas Rasa & Higienitas |
| Pembeli | pembeli | pembeli123 | Buku Menu Digital Meja, Pelacak Status Pesanan Meja, Kotak Masukan Pelanggan |

---

## Fitur Registrasi Pembeli Baru

Pelanggan meja dapat mendaftar akun baru secara mandiri:
1. Buka `http://localhost:8080/login.html`.
2. Klik tab **Daftar Pembeli Baru**.
3. Isi Nama Lengkap, Nomor WhatsApp, Username, dan Kata Sandi.
4. Klik **Daftar & Masuk ke Warung**.
5. Sistem otomatis membuat akun login dan menyinkronkan data pelanggan baru ke tabel master `pelanggan` di database CRM.
6. Sesi langsung aktif dan dialihkan ke portal pemesanan menu meja.

---

## Hak Akses & Pembagian Halaman Per Peran

Navbar didesain bersih tanpa pengalih peran publik. Konten halaman dan hak akses CRUD diisolasi secara ketat berdasarkan pengguna yang masuk:

### 1. Peran Admin
- **Data Pelanggan (UTS 3a):** Tambah pelanggan baru, edit data, hapus data, pencarian nama/WA, filter label dan kanal, unduh berkas CSV, serta tombol reset demo data.
- **Kasir & Antrean Dapur:** Mencatat transaksi pesanan kasir, mengubah status pesanan, dan memantau antrean.
- **Masukan & Keluhan SLA:** Menanggapi komplain pelanggan dalam batas waktu SLA (< 2 jam) dan menugaskan staf PIC.
- **Dashboard Analitik:** Melihat ringkasan performa omset, volume pesanan, dan opt-in promosi.
- **Sapa Hangat WhatsApp (P12):** Generator pesan sapaan personal untuk pelanggan tetap yang belum transaksi lebih dari 14 hari.

### 2. Peran Pemilik (Owner)
- **Dashboard Eksekutif & Omset:** Memantau metrik finansial omset, target penjualan, kepatuhan SLA penanganan keluhan, serta grafik distribusi kanal dan segmen pasar.
- **Audit Kinerja Staf & SLA:** Mengevaluasi kecepatan respon keluhan oleh staf (Admin, Pemilik, Koki).
- **Direktori Pelanggan (Read-Only):** Membaca dan mencari data pelanggan untuk analisa pasar. Tombol Tambah, Hapus, dan Reset Demo disembunyikan dan dibatasi (HTTP 403 Forbidden).

### 3. Peran Koki (Kitchen)
- **Antrean Dapur (KDS Live):** Tampilan tiket pesanan masuk dapur secara real-time dengan tombol status tahapan: Mulai Masak (Dimasak) -> Siap Saji -> Tandai Selesai Diantar.
- **Catatan Rasa & Higienitas:** Membaca ulasan pelanggan khusus kategori kualitas rasa dan kebersihan dapur, serta menandai konfirmasi perbaikan dapur.
- Koki tidak memiliki akses ke database kontak pribadi pelanggan maupun laporan keuangan omset.

### 4. Peran Pembeli (Customer)
- **Buku Menu & Pesan Meja:** Memilih nomor meja (Meja 01 s/d 10), memilih kartu menu favorit (Indomie Telur Kornet, Magelangan Spesial, Nasi Telur Pontianak, Paket VIP), memasukkan porsi dan catatan khusus koki, melihat total biaya, dan mengirim pesanan langsung ke dapur.
- **Status Pesanan Meja Saya:** Linimasa pelacakan status pesanan meja secara langsung (Menunggu -> Sedang Dimasak -> Siap Saji -> Selesai).
- **Kotak Masukan Meja:** Formulir saran dan keluhan langsung dari meja makan ke pihak pengelola.

---

## Struktur Direktori Monorepo

```text
web-bj/
├── apps/
│   ├── backend/                 # Package Spring Boot (@adzkiya/backend)
│   │   └── package.json
│   └── web/                     # Package Frontend Web (@adzkiya/web)
│       ├── index.html           # Dashboard operasional multi-peran
│       ├── login.html           # Halaman login & registrasi pembeli baru
│       ├── css/style.css        # Desain antarmuka Atelier Warung
│       └── js/app.js            # Logika aplikasi dan klien REST API
├── packages/
│   └── database/                # Skema DDL basis data (@adzkiya/database)
│       └── crm_adzkiya.sql      # DDL 4 tabel relasional & seed awal
├── src/
│   ├── main/java/com/warmindo/adzkiya/
│   │   ├── AdzkiyaApplication.java
│   │   ├── config/WebConfig.java
│   │   ├── model/               # User, Pelanggan, Pesanan, Masukan
│   │   ├── repository/          # Spring Data JPA Repository
│   │   ├── service/DataService.java # Logika database & seeding
│   │   └── controller/          # Controller REST API
│   └── main/resources/
│       ├── application.properties # Konfigurasi port 8080 & MySQL port 3306
│       └── static/              # Sumber daya statis Spring Boot
├── crm_adzkiya.sql              # Skema database MySQL
├── pom.xml                      # Konfigurasi Maven (Java 17, Spring Boot 3.2.5)
├── turbo.json                   # Konfigurasi build pipeline Turborepo
├── run.bat                      # Skrip peluncuran Windows 1-klik
└── test_suite.ps1               # Skrip pengujian otomatis 7 modul
```

---

## Build dan Pemeliharaan

- **Build Monorepo (Turborepo):**
  ```bash
  npx turbo build
  ```
- **Kompilasi Ulang Backend:**
  ```cmd
  .\mvnw.cmd compile
  ```
- **Port yang Digunakan:**
  - Backend Web Server: Port 8080
  - Database MySQL: Port 3306
