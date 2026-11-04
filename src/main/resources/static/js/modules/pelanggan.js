import { $, esc } from '../utils.js';
import { state } from '../state.js';
import {
  openAddPelangganDialog,
  openEditPelangganDialog,
  handlePelangganSubmit,
  deletePelanggan,
  resetDemoData
} from './pelangganDialog.js';

export async function loadPelanggan() {
  const q = ($('#q')?.value || '').trim();
  const fl = $('#fl')?.value || '';
  const fk = $('#fk')?.value || '';

  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (fl) params.set('label', fl);
  if (fk) params.set('kanal', fk);

  try {
    const res = await fetch('/api/pelanggan?' + params.toString());
    if (!res.ok) throw new Error('Gagal memuat data');
    state.customersCache = await res.json();
    renderPelangganTable(state.customersCache);
    updateCustomerKPIs(state.customersCache);
    populateCustomerDropdowns(state.customersCache);
  } catch (err) {
    const tbody = $('#pelanggan-tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--red);">Gagal terhubung ke MySQL.</td></tr>`;
  }
}

export function renderPelangganTable(rows) {
  const tbody = $('#pelanggan-tbody');
  if (!tbody) return;

  const isAdmin = state.currentRole === 'Admin';
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Tidak ada data pelanggan yang cocok.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(p => {
    const isHighlight = (p.id === state.lastSavedId);
    const optinBadge = p.optin 
      ? `<span class="tag green"><span class="status-dot"></span> Ya (Opt-in)</span>`
      : `<span class="tag red"><span class="status-dot"></span> Tidak</span>`;
    const labelBadge = p.label === 'Pelanggan Tetap' 
      ? `<span class="tag primary">${esc(p.label)}</span>`
      : `<span class="tag">${esc(p.label)}</span>`;

    const actionCell = isAdmin ? `
      <td style="text-align: right;">
        <button type="button" class="btn g s" data-edit="${esc(p.id)}" title="Ubah data">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Ubah
        </button>
        <button type="button" class="btn g s danger" data-del="${esc(p.id)}" title="Hapus pelanggan" style="margin-left: 4px;">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Hapus
        </button>
      </td>` : `<td style="text-align: right;"><span class="tag" style="font-size: 11px;">Hanya Baca</span></td>`;

    return `
      <tr class="${isHighlight ? 'highlight' : ''}">
        <td class="num"><b>${esc(p.id)}</b></td>
        <td><b>${esc(p.nama)}</b></td>
        <td class="num">${esc(p.wa)}</td>
        <td><span class="tag">${esc(p.kanal)}</span></td>
        <td>${esc(p.seg)}</td>
        <td>${labelBadge}</td>
        <td style="text-align: center;">${optinBadge}</td>
        <td class="num">${esc(p.pesananTerakhir || '—')}</td>
        ${actionCell}
      </tr>`;
  }).join('');

  if (isAdmin) {
    tbody.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => openEditPelangganDialog(btn.dataset.edit));
    tbody.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => deletePelanggan(btn.dataset.del));
  }
}

export function updateCustomerKPIs(data) {
  const now = new Date();
  let sapa = 0;
  data.forEach(p => {
    if (!p.pesananTerakhir || p.pesananTerakhir === '—') sapa++;
    else if ((now - new Date(p.pesananTerakhir)) / (86400000) >= 14) sapa++;
  });

  if ($('#cust-kpi-total')) $('#cust-kpi-total').textContent = data.length;
  if ($('#cust-kpi-tetap')) $('#cust-kpi-tetap').textContent = data.filter(p => p.label === 'Pelanggan Tetap').length;
  if ($('#cust-kpi-optin')) $('#cust-kpi-optin').textContent = data.filter(p => p.optin).length;
  if ($('#cust-kpi-sapa')) $('#cust-kpi-sapa').textContent = sapa;
}

export function populateCustomerDropdowns(customers) {
  [$('#op'), $('#mp')].forEach(sel => {
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = customers.map(p => `<option value="${esc(p.id)}">${esc(p.id)} — ${esc(p.nama)} (${esc(p.seg)})</option>`).join('');
    if (cur) sel.value = cur;
  });
}

export function initPelangganListeners() {
  let debounce;
  if ($('#q')) $('#q').oninput = () => { clearTimeout(debounce); debounce = setTimeout(loadPelanggan, 250); };
  if ($('#fl')) $('#fl').onchange = loadPelanggan;
  if ($('#fk')) $('#fk').onchange = loadPelanggan;
  if ($('#btn-add')) $('#btn-add').onclick = openAddPelangganDialog;
  if ($('#btn-rst')) $('#btn-rst').onclick = resetDemoData;
  if ($('#form-pelanggan')) $('#form-pelanggan').onsubmit = handlePelangganSubmit;
  if ($('#btn-close-pelanggan-dlg')) $('#btn-close-pelanggan-dlg').onclick = () => $('#dlg-pelanggan').close();
  if ($('#btn-cancel-pelanggan-dlg')) $('#btn-cancel-pelanggan-dlg').onclick = () => $('#dlg-pelanggan').close();
}
