/**
 * Role Definitions & Navigation Configuration
 */

export const ROLE_CONFIG = {
  Admin: {
    tag: 'Akses Administrator Penuh',
    desc: 'Akses menyeluruh ke manajemen master data pelanggan UTS 3a, pesanan kasir, respon keluhan SLA, dashboard analitik, dan sapa hangat WA.',
    quickNavKey: 'c',
    quickNavText: 'Buka Data Pelanggan',
    defaultTab: 'c',
    tabs: [
      { key: 'c', label: 'Data Pelanggan (UTS 3a)', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
      { key: 'o', label: 'Kasir & Antrean Dapur', icon: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/>' },
      { key: 'm', label: 'Masukan & Keluhan SLA', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
      { key: 'd', label: 'Dashboard Analitik', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
      { key: 's', label: 'Sapa Hangat WhatsApp (P12)', icon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>' }
    ]
  },
  Pemilik: {
    tag: 'Portal Eksekutif Pemilik',
    desc: 'Pemantauan performa finansial omset, pencapaian target SLA penanganan komplain (< 2 Jam 100%), dan audit direktori pelanggan.',
    quickNavKey: 'd',
    quickNavText: 'Buka Dashboard Eksekutif',
    defaultTab: 'd',
    tabs: [
      { key: 'd', label: 'Dashboard Eksekutif & Omset', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
      { key: 'm', label: 'Audit Kinerja PIC & Kepatuhan SLA', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
      { key: 'c', label: 'Direktori Pelanggan (Read-Only)', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' }
    ]
  },
  Koki: {
    tag: 'Kitchen Display System (KDS)',
    desc: 'Fokus antrean dapur real-time: tiket pesanan hangat masuk, status racikan kompor, dan evaluasi kepuasan rasa masakan.',
    quickNavKey: 'o',
    quickNavText: 'Buka Antrean Dapur',
    defaultTab: 'o',
    tabs: [
      { key: 'o', label: 'Antrean Dapur (KDS Live)', icon: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>' },
      { key: 'koki-eval', label: 'Catatan Rasa & Higienitas Dapur', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' }
    ]
  },
  Pembeli: {
    tag: 'Portal Mandiri Pelanggan Meja',
    desc: 'Pesan menu Warmindo favorit langsung dari meja Anda, pantau status racikan koki secara langsung, dan sampaikan ulasan meja.',
    quickNavKey: 'buyer-order',
    quickNavText: 'Pesan Menu Hangat',
    defaultTab: 'buyer-order',
    tabs: [
      { key: 'buyer-order', label: 'Buku Menu & Pesan Meja', icon: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>' },
      { key: 'buyer-status', label: 'Status Pesanan Meja Saya', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
      { key: 'buyer-feedback', label: 'Kotak Masukan Meja', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' }
    ]
  }
};
