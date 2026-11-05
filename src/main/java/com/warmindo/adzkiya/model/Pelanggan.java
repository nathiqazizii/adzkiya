package com.warmindo.adzkiya.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pelanggan")
public class Pelanggan {
    @Id
    @Column(length = 20)
    private String id; // P01, P02, etc.

    @Column(nullable = false, length = 100)
    private String nama;

    @Column(name = "no_wa", nullable = false, length = 30)
    private String wa;

    @Column(name = "asal_kanal", nullable = false, length = 50)
    private String kanal; // Dine-in, WhatsApp, Google Maps, Instagram

    @Column(name = "segmen", nullable = false, length = 50)
    private String seg; // Mahasiswa, Warga sekitar, Pesanan besar

    @Column(name = "label_wa", nullable = false, length = 50)
    private String label; // Pelanggan, Pemesanan, Masukan, Pelanggan Tetap

    @Column(name = "opt_in", nullable = false)
    private Boolean optin = true;

    @Column(name = "tgl_daftar", length = 30)
    private String tgl; // YYYY-MM-DD

    public Pelanggan() {
    }

    public Pelanggan(String id, String nama, String wa, String kanal, String seg, String label, Boolean optin, String tgl) {
        this.id = id;
        this.nama = nama;
        this.wa = wa;
        this.kanal = kanal;
        this.seg = seg;
        this.label = label;
        this.optin = optin;
        this.tgl = tgl;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNama() {
        return nama;
    }

    public void setNama(String nama) {
        this.nama = nama;
    }

    public String getWa() {
        return wa;
    }

    public void setWa(String wa) {
        this.wa = wa;
    }

    public String getKanal() {
        return kanal;
    }

    public void setKanal(String kanal) {
        this.kanal = kanal;
    }

    public String getSeg() {
        return seg;
    }

    public void setSeg(String seg) {
        this.seg = seg;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Boolean getOptin() {
        return optin;
    }

    public void setOptin(Boolean optin) {
        this.optin = optin;
    }

    public String getTgl() {
        return tgl;
    }

    public void setTgl(String tgl) {
        this.tgl = tgl;
    }
}
