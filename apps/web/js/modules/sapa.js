import { $, esc, toast } from '../utils.js';

export async function loadSapaHangat() {
  const segFilter = $('#sapa-filter-seg')?.value || '';
  try {
    const res = await fetch('/api/sapa-hangat');
    if (!res.ok) throw new Error('Gagal memuat rekomendasi sapa hangat');
    const list = await res.json();

    const filtered = segFilter ? list.filter(item => item.pelangganSeg === segFilter) : list;
    renderSapaCards(filtered);
  } catch (err) {
    console.error('Error loadSapaHangat:', err);
  }
}

export function renderSapaCards(cards) {
  const container = $('#sapa-grid');
  if (!container) return;

  if (cards.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; background: var(--sf); border: 1px dashed var(--bd); border-radius: var(--radius-md);">
        <svg class="icon icon-lg" style="margin-bottom:8px; color: var(--brand);" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        <h3 style="font-size:14px; color:var(--tx);">Tidak Ada Target Sapaan</h3>
        <p>Semua pelanggan aktif bertransaksi dalam 14 hari terakhir.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cards.map(item => {
    const pid = item.pelangganId || item.id;
    const nama = item.pelangganNama || item.nama;
    const seg = item.pelangganSeg || item.seg;
    const wa = item.pelangganWa || item.wa;
    const days = item.hariSejakPesananTerakhir ?? item.hariSejakPesan ?? 14;
    const lastDate = item.pesananTerakhir || '—';
    const draft = item.draftPesan || '';

    const waClean = (wa || '').replace(/[^0-9]/g, '');
    const waUrl = item.waLink || `https://api.whatsapp.com/send?phone=${encodeURIComponent(waClean)}&text=${encodeURIComponent(draft)}`;

    return `
      <div class="sapa-card">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
            <b style="font-size:14px; color:var(--tx);">${esc(nama)}</b>
            <span class="tag primary">${esc(seg)}</span>
          </div>
          <div class="num" style="font-size:12px; color:var(--mu); margin-bottom: 10px;">
            ID: ${esc(pid)} · Terakhir beli: ${esc(lastDate)} (${days} hari lalu)
          </div>
          <div class="sapa-draft" id="draft-${esc(pid)}">${esc(draft)}</div>
        </div>
        <div style="display:flex; gap: 8px; margin-top: 12px;">
          <button type="button" class="btn g s" data-copy-draft="${esc(pid)}" style="flex: 1;">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Salin Pesan
          </button>
          <a class="btn success s" href="${waUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1;">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Kirim WhatsApp
          </a>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-copy-draft]').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.copyDraft;
      const draftEl = $(`#draft-${pid}`);
      if (draftEl) {
        navigator.clipboard.writeText(draftEl.textContent).then(() => {
          btn.innerHTML = `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Tersalin!`;
          toast('Draft pesan WhatsApp berhasil disalin ke clipboard');
          setTimeout(() => {
            btn.innerHTML = `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Salin Pesan`;
          }, 2000);
        });
      }
    };
  });
}

export function initSapaListeners() {
  const sapaSegFilter = $('#sapa-filter-seg');
  if (sapaSegFilter) sapaSegFilter.onchange = loadSapaHangat;

  const btnRefreshSapa = $('#btn-refresh-sapa');
  if (btnRefreshSapa) {
    btnRefreshSapa.onclick = () => {
      loadSapaHangat();
      toast('Daftar sapa hangat diperbarui');
    };
  }
}
