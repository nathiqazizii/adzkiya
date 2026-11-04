import { $, esc, toast } from '../utils.js';

export async function loadMasukan() {
  try {
    const res = await fetch('/api/masukan');
    if (!res.ok) throw new Error('Gagal memuat masukan');
    const data = await res.json();

    if ($('#cnt-m-baru')) $('#cnt-m-baru').textContent = data.cntBaru || 0;
    if ($('#cnt-m-diproses')) $('#cnt-m-diproses').textContent = data.cntDiproses || 0;
    if ($('#cnt-m-selesai')) $('#cnt-m-selesai').textContent = data.cntSelesai || 0;

    renderMasukanTable(data.rows || []);
  } catch (err) {
    console.error('Error loadMasukan:', err);
  }
}

export function renderMasukanTable(rows) {
  const tbody = $('#masukan-tbody');
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Tidak ada tiket keluhan tercatat.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(m => {
    let stTag = `<span class="tag green">Selesai</span>`;
    if (m.status === 'Baru') stTag = `<span class="tag red">Baru</span>`;
    if (m.status === 'Diproses') stTag = `<span class="tag amber">Diproses</span>`;

    const canRespond = (m.status !== 'Selesai');

    return `
      <tr>
        <td class="num"><b>${esc(m.id)}</b></td>
        <td><b>${esc(m.pelangganNama)}</b> <span class="num" style="color:var(--mu); font-size:11px;">(${esc(m.pid)})</span></td>
        <td><span class="tag">${esc(m.kanal)}</span></td>
        <td><span class="tag primary">${esc(m.kat)}</span></td>
        <td style="max-width: 280px;">${esc(m.isi)}</td>
        <td><b>${esc(m.pic)}</b></td>
        <td class="num">${esc(m.masuk)}</td>
        <td>${stTag}</td>
        <td style="text-align: right;">
          ${canRespond ? `
            <button type="button" class="btn success s" data-mresp="${esc(m.id)}" title="Selesaikan tiket dalam batas waktu SLA">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Selesaikan
            </button>
          ` : `
            <span class="num" style="font-size:11px; color:var(--green); font-weight:600;">Terpenuhi (${esc(m.resp || 'Selesai')})</span>
          `}
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-mresp]').forEach(btn => {
    btn.onclick = () => markMasukanResponded(btn.dataset.mresp);
  });
}

export async function markMasukanResponded(id) {
  try {
    const res = await fetch(`/api/masukan/${id}/respond`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Gagal memperbarui SLA');
    toast(`Tiket keluhan ${id} berhasil diselesaikan sesuai SLA`);
    loadMasukan();
  } catch (err) {
    alert('Gagal update respons: ' + err.message);
  }
}

export async function handleMasukanSubmit() {
  const isi = $('#mi')?.value.trim();
  if (!isi) {
    alert('Rincian keluhan / saran wajib diisi.');
    $('#mi')?.focus();
    return;
  }

  const payload = {
    pid: $('#mp').value,
    kanal: $('#mk').value,
    kat: $('#mt').value,
    pic: $('#mc').value,
    isi
  };

  try {
    const res = await fetch('/api/masukan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Gagal menyimpan tiket keluhan');
    const saved = await res.json();

    $('#mi').value = '';
    toast(`Tiket keluhan ${saved.id} berhasil dicatat dengan PIC ${payload.pic}`);
    loadMasukan();
  } catch (err) {
    alert('Gagal simpan masukan: ' + err.message);
  }
}

export function initMasukanListeners() {
  const btnSaveM = $('#btn-save-m');
  if (btnSaveM) btnSaveM.onclick = handleMasukanSubmit;
}
