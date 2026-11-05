import { $, esc, rp, toast } from '../utils.js';
import { state } from '../state.js';
import { renderKitchenBoard } from './koki.js';

const ST_TAGS = {
  Menunggu: '<span class="tag amber"><span class="status-dot"></span> Menunggu</span>',
  Dimasak: '<span class="tag primary"><span class="status-dot"></span> Dimasak</span>',
  'Siap Saji': '<span class="tag green"><span class="status-dot"></span> Siap Saji</span>',
  Selesai: '<span class="tag green"><span class="status-dot"></span> Selesai</span>'
};

export async function loadPesanan() {
  try {
    const res = await fetch('/api/pesanan');
    if (!res.ok) throw new Error('Gagal mengambil data pesanan');
    const data = await res.json();
    state.ordersCache = data.rows || [];

    renderKitchenBoard(state.ordersCache);
    renderPesananTable(state.ordersCache);
  } catch (err) {
    console.error('Error loadPesanan:', err);
  }
}

export function renderPesananTable(orders) {
  const tbody = $('#pesanan-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Belum ada catatan pesanan kasir.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const st = o.status || 'Selesai';
    const stTag = ST_TAGS[st] || ST_TAGS.Selesai;
    const opts = ['Menunggu', 'Dimasak', 'Siap Saji', 'Selesai']
      .map(v => `<option value="${v}" ${st === v ? 'selected' : ''}>${v}</option>`).join('');

    return `
      <tr>
        <td class="num"><b>${esc(o.id)}</b></td>
        <td class="num">${esc(o.tgl)}</td>
        <td><b>${esc(o.pelangganNama)}</b> <span class="num" style="color:var(--mu); font-size:11px;">(${esc(o.pid)})</span></td>
        <td><span class="tag">${esc(o.saluran)}</span></td>
        <td>${esc(o.menu)}</td>
        <td class="num" style="text-align: right; font-weight: 700;">${rp(o.nominal)}</td>
        <td style="text-align: center;">${stTag}</td>
        <td style="text-align: right;">
          <select class="order-status-select" data-order-id="${esc(o.id)}" style="padding: 2px 6px; font-size: 11px;">${opts}</select>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('.order-status-select').forEach(sel => {
    sel.onchange = () => updateOrderStatus(sel.dataset.orderId, sel.value);
  });
}

export async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/pesanan/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Gagal memperbarui status');
    toast(`Pesanan ${orderId} diubah ke: ${newStatus}`);
    loadPesanan();
  } catch (err) {
    alert('Gagal update status: ' + err.message);
  }
}

export function openAddOrderDialog() {
  const dlg = $('#dlg-pesanan');
  const form = $('#form-pesanan');
  if (!dlg || !form) return;
  form.reset();
  $('#oq').value = 1;
  calculateOrderNominal();
  dlg.showModal();
}

export function calculateOrderNominal() {
  const menuSel = $('#om');
  const qtyInput = $('#oq');
  const nomInput = $('#on');
  if (!menuSel || !qtyInput || !nomInput) return;
  const opt = menuSel.options[menuSel.selectedIndex];
  const unitPrice = parseFloat(opt?.dataset.price || '12000');
  const qty = parseInt(qtyInput.value, 10) || 1;
  nomInput.value = unitPrice * qty;
}

export async function handleOrderSubmit(e) {
  e.preventDefault();
  const pid = $('#op').value;
  const menuSel = $('#om');
  const menuName = menuSel.options[menuSel.selectedIndex].text;
  const saluran = $('#os').value;
  const nominal = parseFloat($('#on').value);

  if (!pid || !nominal) {
    alert('Pelanggan dan nominal wajib diisi.');
    return;
  }

  try {
    const res = await fetch('/api/pesanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid, saluran, menu: menuName, nominal, status: 'Menunggu' })
    });
    if (!res.ok) throw new Error('Gagal mencatat pesanan');
    const saved = await res.json();

    $('#dlg-pesanan').close();
    toast(`Pesanan ${saved.id} berhasil diterbitkan dan masuk antrean dapur`);
    loadPesanan();
  } catch (err) {
    alert('Gagal simpan pesanan: ' + err.message);
  }
}

export function initPesananListeners() {
  if ($('#btn-open-order-modal')) $('#btn-open-order-modal').onclick = openAddOrderDialog;
  if ($('#btn-refresh-orders')) $('#btn-refresh-orders').onclick = () => { loadPesanan(); toast('Antrean pesanan diperbarui'); };
  if ($('#om')) $('#om').onchange = calculateOrderNominal;
  if ($('#oq')) $('#oq').oninput = calculateOrderNominal;
  if ($('#form-pesanan')) $('#form-pesanan').onsubmit = handleOrderSubmit;
  if ($('#btn-close-pesanan-dlg')) $('#btn-close-pesanan-dlg').onclick = () => $('#dlg-pesanan').close();
  if ($('#btn-cancel-pesanan-dlg')) $('#btn-cancel-pesanan-dlg').onclick = () => $('#dlg-pesanan').close();
}
