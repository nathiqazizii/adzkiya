package com.warmindo.adzkiya.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pesanan")
public class Pesanan {
    @Id
    @Column(length = 20)
    private String id; // O01, O02, etc.

    @Column(name = "pelanggan_id", nullable = false, length = 20)
    private String pid; // References Pelanggan.id

    @Column(name = "waktu_pesan", nullable = false, length = 30)
    private String tgl; // YYYY-MM-DD HH:mm

    @Column(name = "saluran", nullable = false, length = 50)
    private String saluran; // Dine-in, WhatsApp, Pesan antar, Pesanan besar

    @Column(name = "nama_menu", nullable = false, length = 150)
    private String menu;

    @Column(name = "nominal", nullable = false)
    private Double nominal;

    @Column(name = "status", length = 30)
    private String status = "Selesai";

    public Pesanan() {
    }

    public Pesanan(String id, String pid, String tgl, String saluran, String menu, Double nominal) {
        this(id, pid, tgl, saluran, menu, nominal, "Selesai");
    }

    public Pesanan(String id, String pid, String tgl, String saluran, String menu, Double nominal, String status) {
        this.id = id;
        this.pid = pid;
        this.tgl = tgl;
        this.saluran = saluran;
        this.menu = menu;
        this.nominal = nominal;
        this.status = status != null ? status : "Menunggu";
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

    public String getTgl() {
        return tgl;
    }

    public void setTgl(String tgl) {
        this.tgl = tgl;
    }

    public String getSaluran() {
        return saluran;
    }

    public void setSaluran(String saluran) {
        this.saluran = saluran;
    }

    public String getMenu() {
        return menu;
    }

    public void setMenu(String menu) {
        this.menu = menu;
    }

    public Double getNominal() {
        return nominal;
    }

    public void setNominal(Double nominal) {
        this.nominal = nominal;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
