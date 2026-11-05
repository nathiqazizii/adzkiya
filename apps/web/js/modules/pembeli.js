import { $, $$, esc, rp, toast } from '../utils.js';
import { state } from '../state.js';

const PRICES = {
  'Indomie telor kornet': 12000, 'Magelangan': 13000, 'Nasi telur': 8000, 'Paket VIP (nasi telur + minum)': 10000
};
const getPrice = m => PRICES[m] || 12000;

export function initBuyerOrderView() {
  updateBuyerTotal();
  $$('.menu-select-card').forEach(card => {
    card.onclick = () => {
      $$('.menu-select-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      if ($('#buyer-menu')) $('#buyer-menu').value = card.dataset.menu;
      updateBuyerTotal();
    };
  });
}

export function updateBuyerTotal() {
  const menu = $('#buyer-menu')?.value || 'Indomie telor kornet';
  const qty = parseInt($('#buyer-qty')?.value || '1', 10);
  const total = getPrice(menu) * qty;

  if ($('#buyer-total-display')) $('#buyer-total-display').textContent = rp(total);
  if ($('#buyer-order-summary-text')) $('#buyer-order-summary-text').textContent = `${qty}x ${menu}`;
}

export async function handleBuyerOrder() {
  const table = $('#buyer-table')?.value || 'Meja 03';
  const menu = $('#buyer-menu')?.value || 'Indomie telor kornet';
  const qty = parseInt($('#buyer-qty')?.value || '1', 10);
  const notes = $('#buyer-notes')?.value.trim();
  const nominal = getPrice(menu) * qty;
  const fullMenu = `${qty}x ${menu}${notes ? ' (' + notes + ')' : ''}`;
  const pid = state.currentUser?.pelangganId || 'P03';

  try {
    const res = await fetch('/api/pesanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid, saluran: `Dine-in (${table})`, menu: fullMenu, nominal, status: 'Menunggu' })
    });
    if (!res.ok) throw new Error('Gagal mengirim pesanan');
    const saved = await res.json();
    toast(`Pesanan Anda berhasil dikirim ke Koki! ID: ${saved.id}`);
    if ($('#buyer-notes')) $('#buyer-notes').value = '';
    if (window.switchTab) window.switchTab('buyer-status');
  } catch (err) {
    alert('Gagal mengirim pesanan: ' + err.message);
  }
}

export async function loadBuyerOrderStatus() {
  const container = $('#buyer-status-container');
  if (!container) return;

  try {
    const res = await fetch('/api/pesanan');
    if (!res.ok) throw new Error('Gagal memuat pesanan');
    const data = await res.json();
    const rows = data.rows || [];
    const table = $('#buyer-table')?.value || 'Meja 03';
    const cu = state.currentUser || {};

    const myOrders = rows.filter(r => 
      (cu.pelangganId && r.pid === cu.pelangganId) ||
      (r.saluran && r.saluran.includes(table)) ||
      (r.pelangganNama && r.pelangganNama.toLowerCase().includes((cu.namaLengkap || '').toLowerCase()))
    );

    if (myOrders.length === 0) {
      container.innerHTML = `
        <div class="panel-card empty-state">
          <svg class="icon icon-lg" viewBox="0 0 24 24" style="color: var(--mu);"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p style="margin-top: 10px;">Belum ada pesanan aktif untuk meja Anda saat ini.</p>
          <button type="button" class="btn" onclick="window.switchTab('buyer-order')" style="margin-top: 12px;">Pesan Menu Sekarang</button>
        </div>`;
      return;
    }

    const STEPS = ['Menunggu Antrean', 'Sedang Dimasak', 'Siap Saji', 'Selesai'];
    const STEP_MAP = { Menunggu: 0, Dimasak: 1, 'Siap Saji': 2, Selesai: 3 };

    container.innerHTML = myOrders.map(o => {
      const st = o.status || 'Menunggu';
      const curIdx = STEP_MAP[st] ?? 0;
      const tagCls = st === 'Menunggu' ? 'amber' : (st === 'Dimasak' ? 'primary' : 'green');
      const timeline = STEPS.map((s, i) => {
        const cls = i < curIdx ? 'done' : (i === curIdx ? 'current done' : '');
        return `<div class="status-step ${cls}">${i + 1}. ${s}</div>`;
      }).join('');

      return `
        <div class="status-tracker-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="tag primary">${esc(o.saluran || 'Dine-in')}</span>
              <h3 style="font-size: 15px; font-weight: 700; color: var(--tx); margin-top: 6px;">${esc(o.menu)}</h3>
              <div class="num" style="font-size: 11.5px; color: var(--mu); margin-top: 2px;">Tiket: ${esc(o.id)} · Waktu: ${esc(o.tgl)} · ${rp(o.nominal)}</div>
            </div>
            <span class="tag ${tagCls}">${esc(st)}</span>
          </div>
          <div class="status-timeline">${timeline}</div>
        </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Gagal memuat status pesanan: ${err.message}</div>`;
  }
}

export async function handleBuyerFeedback() {
  const isi = $('#buyer-fb-text')?.value.trim();
  if (!isi) {
    alert('Silakan tuliskan masukan Anda terlebih dahulu.');
    $('#buyer-fb-text')?.focus();
    return;
  }

  const kat = $('#buyer-fb-kat')?.value || 'Kualitas Rasa';
  const table = $('#buyer-table')?.value || 'Meja 03';
  const pid = state.currentUser?.pelangganId || 'P03';
  const pic = (kat === 'Kualitas Rasa' || kat === 'Kebersihan') ? 'Koki' : 'Admin';

  try {
    const res = await fetch('/api/masukan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid, kanal: `Dine-in (${table})`, kat, pic, isi })
    });
    if (!res.ok) throw new Error('Gagal mengirim masukan');
    $('#buyer-fb-text').value = '';
    toast('Terima kasih! Masukan Anda telah kami teruskan langsung ke tim warung & koki.');
  } catch (err) {
    alert('Gagal mengirim masukan: ' + err.message);
  }
}

export function initBuyerListeners() {
  if ($('#buyer-qty')) $('#buyer-qty').oninput = updateBuyerTotal;
  if ($('#btn-buyer-order')) $('#btn-buyer-order').onclick = handleBuyerOrder;
  if ($('#btn-buyer-send-fb')) $('#btn-buyer-send-fb').onclick = handleBuyerFeedback;
  if ($('#btn-refresh-buyer-status')) {
    $('#btn-refresh-buyer-status').onclick = () => { loadBuyerOrderStatus(); toast('Status pesanan diperbarui'); };
  }
}
