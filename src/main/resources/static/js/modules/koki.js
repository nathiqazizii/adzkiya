import { $, esc, rp, toast } from '../utils.js';
import { updateOrderStatus } from './pesanan.js';

const KITCHEN_CFG = {
  Menunggu: {
    cls: 'status-menunggu',
    pill: '<span class="tag amber"><span class="status-dot"></span> Menunggu</span>',
    btn: id => `<button type="button" class="btn s" data-kitchen-cook="${esc(id)}"><svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/></svg> Mulai Masak</button>`
  },
  Dimasak: {
    cls: 'status-dimasak',
    pill: '<span class="tag primary"><span class="status-dot"></span> Sedang Dimasak</span>',
    btn: id => `<button type="button" class="btn success s" data-kitchen-ready="${esc(id)}"><svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Siap Saji</button>`
  },
  'Siap Saji': {
    cls: 'status-siap',
    pill: '<span class="tag green"><span class="status-dot"></span> Siap Dihidangkan</span>',
    btn: id => `<button type="button" class="btn g s" data-kitchen-done="${esc(id)}"><svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Tandai Selesai Diantar</button>`
  }
};

export function renderKitchenBoard(orders) {
  const board = $('#kitchen-board');
  if (!board) return;

  const activeOrders = orders.filter(o => o.status !== 'Selesai');
  if ($('#badge-antrean-menunggu')) $('#badge-antrean-menunggu').textContent = `Menunggu: ${orders.filter(o => o.status === 'Menunggu').length}`;
  if ($('#badge-antrean-dimasak')) $('#badge-antrean-dimasak').textContent = `Dimasak: ${orders.filter(o => o.status === 'Dimasak').length}`;
  if ($('#badge-antrean-siap')) $('#badge-antrean-siap').textContent = `Siap Saji: ${orders.filter(o => o.status === 'Siap Saji').length}`;

  if (activeOrders.length === 0) {
    board.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; background: var(--sf); border: 1px dashed var(--bd); border-radius: var(--radius-md);">
        <svg class="icon icon-lg" style="margin-bottom:8px; color: var(--green);" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3 style="font-size:14px; color:var(--tx);">Semua Pesanan Dapur Selesai</h3>
        <p>Tidak ada antrean pesanan aktif saat ini. Pesanan baru dari meja pelanggan akan langsung muncul di sini.</p>
      </div>`;
    return;
  }

  board.innerHTML = activeOrders.slice(0, 16).map(o => {
    const cfg = KITCHEN_CFG[o.status] || KITCHEN_CFG.Menunggu;
    return `
      <div class="kitchen-card ${cfg.cls}" id="kcard-${esc(o.id)}">
        <div>
          <div class="kitchen-ticket-top">
            <span class="num" style="font-weight:700; color:var(--mu); font-size:13px;">${esc(o.id)}</span>
            ${cfg.pill}
          </div>
          <div class="kitchen-menu-title" style="margin-top: 8px;">${esc(o.menu)}</div>
          <div class="kitchen-meta">
            <span>Pelanggan: <b>${esc(o.pelangganNama)}</b></span>
            <span>Posisi: <b>${esc(o.saluran)}</b></span>
            <span class="num">Jam: ${esc(o.tgl)}</span>
          </div>
        </div>
        <div class="kitchen-actions">
          ${cfg.btn(o.id)}
          <span class="num" style="font-size:12px; font-weight:700; margin-left: auto; color: var(--brand);">${rp(o.nominal)}</span>
        </div>
      </div>`;
  }).join('');

  board.querySelectorAll('[data-kitchen-cook]').forEach(btn => {
    btn.onclick = () => updateOrderStatus(btn.dataset.kitchenCook, 'Dimasak');
  });
  board.querySelectorAll('[data-kitchen-ready]').forEach(btn => {
    btn.onclick = () => updateOrderStatus(btn.dataset.kitchenReady, 'Siap Saji');
  });
  board.querySelectorAll('[data-kitchen-done]').forEach(btn => {
    btn.onclick = () => updateOrderStatus(btn.dataset.kitchenDone, 'Selesai');
  });
}

export async function loadKokiEval() {
  const container = $('#koki-eval-list');
  if (!container) return;

  try {
    const res = await fetch('/api/masukan');
    if (!res.ok) throw new Error('Gagal memuat catatan dapur');
    const data = await res.json();
    const rows = (data.rows || []).filter(m => m.kat === 'Kualitas Rasa' || m.kat === 'Kebersihan' || m.pic === 'Koki');

    if (rows.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; background: var(--sf); border: 1px dashed var(--bd); border-radius: var(--radius-md);">
          <svg class="icon icon-lg" style="margin-bottom:8px; color: var(--green);" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <h3 style="font-size:14px; color:var(--tx);">Dapur Bersih &amp; Rasa Terjaga</h3>
          <p>Belum ada komplain rasa makanan atau kebersihan dari meja pelanggan.</p>
        </div>`;
      return;
    }

    container.innerHTML = rows.map(m => {
      const isDone = m.status === 'Selesai';
      const actionHtml = !isDone
        ? `<button type="button" class="btn success s" onclick="window.resolveKokiTicket('${esc(m.id)}')"><svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Konfirmasi Perbaikan Siap</button>`
        : `<span style="font-size: 11px; color: var(--green); font-weight: 600;">Sudah Ditangani Dapur (${esc(m.resp || 'Selesai')})</span>`;

      return `
        <div class="panel-card" style="border-left: 3px solid ${isDone ? 'var(--green)' : 'var(--amber)'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <span class="tag ${m.kat === 'Kualitas Rasa' ? 'primary' : 'amber'}">${esc(m.kat)}</span>
              <span class="num" style="font-size: 11px; color: var(--mu); margin-left: 6px;">ID: ${esc(m.id)} · ${esc(m.kanal)}</span>
            </div>
            <span class="tag ${isDone ? 'green' : 'amber'}">${esc(m.status)}</span>
          </div>
          <p style="font-size: 13px; font-weight: 500; color: var(--tx); margin-bottom: 10px;">"${esc(m.isi)}"</p>
          <div style="font-size: 11px; color: var(--mu); margin-bottom: 12px;">Masuk: ${esc(m.masuk)} · PIC: ${esc(m.pic || 'Koki')}</div>
          ${actionHtml}
        </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Gagal memuat catatan dapur: ${err.message}</div>`;
  }
}

export async function resolveKokiTicket(id) {
  try {
    const res = await fetch(`/api/masukan/${id}/respond`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Gagal menandai respon');
    toast(`Catatan dapur ${id} berhasil dikonfirmasi selesai`);
    loadKokiEval();
  } catch (err) {
    alert('Gagal update catatan: ' + err.message);
  }
}

export function initKokiListeners() {
  const btn = $('#btn-refresh-koki-eval');
  if (btn) btn.onclick = () => { loadKokiEval(); toast('Catatan evaluasi dapur diperbarui'); };
}
