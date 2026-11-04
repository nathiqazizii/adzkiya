-- CRM Warmindo Adzkiya Database Schema & Seed Data
-- Database: crm_adzkiya
-- Compatible with MySQL 8.x / MariaDB

CREATE DATABASE IF NOT EXISTS `crm_adzkiya` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `crm_adzkiya`;

-- 1. Tabel Users (Pengguna Sistem CRM)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `role` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`username`, `password`, `nama_lengkap`, `role`) VALUES
('admin', 'admin123', 'Admin Adzkiya', 'Admin'),
('pemilik', 'pemilik123', 'Pemilik Warmindo', 'Pemilik'),
('koki', 'koki123', 'Koki Utama', 'Koki'),
('pembeli', 'pembeli123', 'Pelanggan Adzkiya (Meja 03)', 'Pembeli');

-- 2. Tabel Pelanggan
DROP TABLE IF EXISTS `pelanggan`;
CREATE TABLE `pelanggan` (
  `id` VARCHAR(20) NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `no_wa` VARCHAR(30) NOT NULL,
  `asal_kanal` VARCHAR(50) NOT NULL,
  `segmen` VARCHAR(50) NOT NULL,
  `label_wa` VARCHAR(50) NOT NULL,
  `opt_in` TINYINT(1) NOT NULL DEFAULT 1,
  `tgl_daftar` VARCHAR(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `pelanggan` (`id`, `nama`, `no_wa`, `asal_kanal`, `segmen`, `label_wa`, `opt_in`, `tgl_daftar`) VALUES
('P01', 'Dimas', '62812****0100', 'Dine-in', 'Mahasiswa', 'Pelanggan Tetap', 1, '2026-09-01'),
('P02', 'Raka', '62812****0107', 'WhatsApp', 'Mahasiswa', 'Pelanggan', 1, '2026-09-02'),
('P03', 'Nadia', '62812****0114', 'Google Maps', 'Mahasiswa', 'Pelanggan', 1, '2026-09-03'),
('P04', 'Ayu', '62812****0121', 'Dine-in', 'Warga sekitar', 'Pelanggan Tetap', 0, '2026-09-04'),
('P05', 'Bagas', '62812****0128', 'WhatsApp', 'Pesanan besar', 'Pemesanan', 1, '2026-09-05'),
('P06', 'Fikri', '62812****0135', 'Dine-in', 'Mahasiswa', 'Pelanggan', 1, '2026-09-06'),
('P07', 'Salsa', '62812****0142', 'WhatsApp', 'Mahasiswa', 'Pelanggan Tetap', 1, '2026-09-07'),
('P08', 'Rizal', '62812****0149', 'Google Maps', 'Warga sekitar', 'Pelanggan', 0, '2026-09-08'),
('P09', 'Putri', '62812****0156', 'Dine-in', 'Mahasiswa', 'Pelanggan', 1, '2026-09-09'),
('P10', 'Andi', '62812****0163', 'WhatsApp', 'Pesanan besar', 'Pelanggan Tetap', 1, '2026-09-10'),
('P11', 'Tegar', '62812****0170', 'Dine-in', 'Mahasiswa', 'Pelanggan', 1, '2026-09-11'),
('P12', 'Maya', '62812****0177', 'WhatsApp', 'Warga sekitar', 'Pelanggan', 0, '2026-09-12'),
('P13', 'Wahyu', '62812****0184', 'Google Maps', 'Mahasiswa', 'Pelanggan Tetap', 1, '2026-09-13'),
('P14', 'Dewi', '62812****0191', 'Dine-in', 'Mahasiswa', 'Pelanggan', 1, '2026-09-14'),
('P15', 'Hafiz', '62812****0198', 'WhatsApp', 'Pesanan besar', 'Pemesanan', 1, '2026-09-15'),
('P16', 'Citra', '62812****0205', 'Dine-in', 'Warga sekitar', 'Pelanggan Tetap', 0, '2026-09-16'),
('P17', 'Yoga', '62812****0212', 'WhatsApp', 'Mahasiswa', 'Pelanggan', 1, '2026-09-17'),
('P18', 'Laras', '62812****0219', 'Google Maps', 'Mahasiswa', 'Pelanggan', 1, '2026-09-18'),
('P19', 'Fajar', '62812****0226', 'Dine-in', 'Mahasiswa', 'Pelanggan Tetap', 1, '2026-09-19'),
('P20', 'Intan', '62812****0233', 'WhatsApp', 'Pesanan besar', 'Pemesanan', 0, '2026-09-20');

-- 3. Tabel Pesanan
DROP TABLE IF EXISTS `pesanan`;
CREATE TABLE `pesanan` (
  `id` VARCHAR(20) NOT NULL,
  `pelanggan_id` VARCHAR(20) NOT NULL,
  `waktu_pesan` VARCHAR(30) NOT NULL,
  `saluran` VARCHAR(50) NOT NULL,
  `nama_menu` VARCHAR(150) NOT NULL,
  `nominal` DOUBLE NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'Selesai',
  PRIMARY KEY (`id`),
  KEY `fk_pesanan_pelanggan` (`pelanggan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `pesanan` (`id`, `pelanggan_id`, `waktu_pesan`, `saluran`, `nama_menu`, `nominal`) VALUES
('O01', 'P01', '2026-10-02 19:10', 'Dine-in', 'Indomie telor kornet', 12000),
('O02', 'P02', '2026-10-05 19:11', 'Dine-in', 'Magelangan', 13000),
('O03', 'P02', '2026-10-14 19:11', 'WhatsApp', 'Nasi telur', 8000),
('O04', 'P03', '2026-10-08 19:12', 'Dine-in', 'Nasi telur', 8000),
('O05', 'P03', '2026-10-17 19:12', 'WhatsApp', 'Paket VIP (nasi telur + minum)', 10000),
('O06', 'P03', '2026-10-26 19:12', 'Dine-in', 'Indomie telor kornet', 12000),
('O07', 'P04', '2026-10-11 19:13', 'Dine-in', 'Paket VIP (nasi telur + minum)', 10000),
('O08', 'P05', '2026-10-14 19:14', 'Dine-in', 'Indomie telor kornet', 120000),
('O09', 'P05', '2026-10-23 19:14', 'WhatsApp', 'Magelangan', 130000),
('O10', 'P06', '2026-10-17 19:15', 'Dine-in', 'Magelangan', 13000),
('O11', 'P06', '2026-10-26 19:15', 'WhatsApp', 'Nasi telur', 8000),
('O12', 'P06', '2026-10-07 19:15', 'Dine-in', 'Paket VIP (nasi telur + minum)', 10000),
('O13', 'P07', '2026-10-20 19:16', 'Dine-in', 'Nasi telur', 8000),
('O14', 'P08', '2026-10-23 19:17', 'Dine-in', 'Paket VIP (nasi telur + minum)', 10000),
('O15', 'P08', '2026-10-04 19:17', 'WhatsApp', 'Indomie telor kornet', 12000),
('O16', 'P09', '2026-10-26 19:18', 'Dine-in', 'Indomie telor kornet', 12000),
('O17', 'P09', '2026-10-07 19:18', 'WhatsApp', 'Magelangan', 13000),
('O18', 'P09', '2026-10-16 19:18', 'Dine-in', 'Nasi telur', 8000),
('O19', 'P10', '2026-10-01 19:19', 'Dine-in', 'Magelangan', 130000),
('O20', 'P11', '2026-10-04 19:20', 'Dine-in', 'Nasi telur', 8000),
('O21', 'P11', '2026-10-13 19:20', 'WhatsApp', 'Paket VIP (nasi telur + minum)', 10000),
('O22', 'P12', '2026-10-07 19:21', 'Dine-in', 'Paket VIP (nasi telur + minum)', 10000),
('O23', 'P12', '2026-10-16 19:21', 'WhatsApp', 'Indomie telor kornet', 12000),
('O24', 'P12', '2026-10-25 19:21', 'Dine-in', 'Magelangan', 13000),
('O25', 'P13', '2026-10-10 19:22', 'Dine-in', 'Indomie telor kornet', 12000),
('O26', 'P14', '2026-10-13 19:23', 'Dine-in', 'Magelangan', 13000),
('O27', 'P14', '2026-10-22 19:23', 'WhatsApp', 'Nasi telur', 8000),
('O28', 'P15', '2026-10-16 19:24', 'Dine-in', 'Nasi telur', 80000),
('O29', 'P15', '2026-10-25 19:24', 'WhatsApp', 'Paket VIP (nasi telur + minum)', 100000),
('O30', 'P15', '2026-10-06 19:24', 'Dine-in', 'Indomie telor kornet', 120000),
('O31', 'P16', '2026-10-19 19:25', 'Dine-in', 'Paket VIP (nasi telur + minum)', 10000),
('O32', 'P17', '2026-10-22 19:26', 'Dine-in', 'Indomie telor kornet', 12000),
('O33', 'P17', '2026-10-03 19:26', 'WhatsApp', 'Magelangan', 13000),
('O34', 'P18', '2026-10-25 19:27', 'Dine-in', 'Magelangan', 13000),
('O35', 'P18', '2026-10-06 19:27', 'WhatsApp', 'Nasi telur', 8000),
('O36', 'P18', '2026-10-15 19:27', 'Dine-in', 'Paket VIP (nasi telur + minum)', 10000),
('O37', 'P19', '2026-10-28 19:28', 'Dine-in', 'Nasi telur', 8000),
('O38', 'P20', '2026-10-03 19:29', 'Dine-in', 'Paket VIP (nasi telur + minum)', 100000),
('O39', 'P20', '2026-10-12 19:29', 'WhatsApp', 'Indomie telor kornet', 120000);

-- 4. Tabel Masukan & Keluhan
DROP TABLE IF EXISTS `masukan_keluhan`;
CREATE TABLE `masukan_keluhan` (
  `id` VARCHAR(20) NOT NULL,
  `pelanggan_id` VARCHAR(20) DEFAULT NULL,
  `asal_kanal` VARCHAR(50) NOT NULL,
  `kategori` VARCHAR(50) NOT NULL,
  `isi_keluhan` TEXT NOT NULL,
  `pic` VARCHAR(50) NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `waktu_masuk` VARCHAR(30) NOT NULL,
  `waktu_respons` VARCHAR(30) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `masukan_keluhan` (`id`, `pelanggan_id`, `asal_kanal`, `kategori`, `isi_keluhan`, `pic`, `status`, `waktu_masuk`, `waktu_respons`) VALUES
('M01', 'P02', 'WhatsApp', 'Waktu tunggu', 'Pesanan datang sekitar 40 menit saat ramai.', 'Admin', 'Selesai', '2026-10-12 20:05', '2026-10-12 20:20'),
('M02', 'P04', 'Google Maps', 'Bahan habis', 'Telur habis jam 21.00.', 'Pemilik', 'Diproses', '2026-10-15 21:10', '2026-10-15 21:40'),
('M03', 'P07', 'Dine-in', 'Kebersihan', 'Menanyakan kebersihan alat masak.', 'Koki', 'Selesai', '2026-10-18 19:30', '2026-10-18 19:35'),
('M04', 'P09', 'WhatsApp', 'Tempat/fasilitas', 'Tempat duduk penuh dan panas.', 'Admin', 'Baru', '2026-10-20 20:00', '');
