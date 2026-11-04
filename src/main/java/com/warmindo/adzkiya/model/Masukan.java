package com.warmindo.adzkiya.model;

import jakarta.persistence.*;

@Entity
@Table(name = "masukan_keluhan")
public class Masukan {
    @Id
    @Column(length = 20)
    private String id; // M01, M02, etc.

    @Column(name = "pelanggan_id", length = 20)
    private String pid; // Can be empty / null or reference Pelanggan.id

    @Column(name = "asal_kanal", nullable = false, length = 50)
    private String kanal; // WhatsApp, Dine-in, Google Maps, Instagram

    @Column(name = "kategori", nullable = false, length = 50)
    private String kat; // Waktu tunggu, Bahan habis, Kebersihan, Tempat/fasilitas, Lainnya

    @Column(name = "isi_keluhan", columnDefinition = "TEXT", nullable = false)
    private String isi;

    @Column(name = "pic", nullable = false, length = 50)
    private String pic; // Admin, Pemilik, Koki

    @Column(name = "status", nullable = false, length = 30)
    private String status; // Baru, Diproses, Selesai

    @Column(name = "waktu_masuk", nullable = false, length = 30)
    private String masuk; // YYYY-MM-DD HH:mm

    @Column(name = "waktu_respons", length = 30)
    private String resp = ""; // YYYY-MM-DD HH:mm or empty

    public Masukan() {
    }

    public Masukan(String id, String pid, String kanal, String kat, String isi, String pic, String status, String masuk, String resp) {
        this.id = id;
        this.pid = pid;
        this.kanal = kanal;
        this.kat = kat;
        this.isi = isi;
        this.pic = pic;
        this.status = status;
        this.masuk = masuk;
        this.resp = resp != null ? resp : "";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPid() {
        return pid;
    }

    public void setPid(String pid) {
        this.pid = pid;
    }

    public String getKanal() {
        return kanal;
    }

    public void setKanal(String kanal) {
        this.kanal = kanal;
    }

    public String getKat() {
        return kat;
    }

    public void setKat(String kat) {
        this.kat = kat;
    }

    public String getIsi() {
        return isi;
    }

    public void setIsi(String isi) {
        this.isi = isi;
    }

    public String getPic() {
        return pic;
    }

    public void setPic(String pic) {
        this.pic = pic;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMasuk() {
        return masuk;
    }

    public void setMasuk(String masuk) {
        this.masuk = masuk;
    }

    public String getResp() {
        return resp;
    }

    public void setResp(String resp) {
        this.resp = resp != null ? resp : "";
    }
}
