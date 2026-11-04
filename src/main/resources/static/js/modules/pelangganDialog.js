import { $, toast } from '../utils.js';
import { state } from '../state.js';
import { loadPelanggan } from './pelanggan.js';

export function openAddPelangganDialog() {
  if (state.currentRole !== 'Admin') return alert('Hanya Admin yang dapat menambah data.');
  const form = $('#form-pelanggan');
  if (!form) return;
  form.reset();
  $('#dlg-pelanggan-title').textContent = 'Tambah Pelanggan Baru';
  let maxId = 0;
  state.customersCache.forEach(p => {
    if (p.id?.startsWith('P')) {
      const n = parseInt(p.id.substring(1), 10);
      if (!isNaN(n) && n > maxId) maxId = n;
    }
  });
  $('#ep-id').value = 'P' + String(maxId + 1).padStart(2, '0');
  $('#ep-opt').value = 'true';
  $('#dlg-pelanggan').showModal();
}

export function openEditPelangganDialog(id) {
  if (state.currentRole !== 'Admin') return;
  const cust = state.customersCache.find(p => p.id === id);
  if (!cust) return;
  $('#dlg-pelanggan-title').textContent = `Ubah Data Pelanggan (${id})`;
  ['id', 'nama', 'wa', 'kanal', 'seg', 'label'].forEach(k => {
    const el = $('#ep-' + (k === 'label' ? 'lab' : k));
    if (el) el.value = cust[k];
  });
  $('#ep-opt').value = cust.optin ? 'true' : 'false';
  $('#dlg-pelanggan').showModal();
}

export async function handlePelangganSubmit(e) {
  e.preventDefault();
  const id = $('#ep-id').value;
  const isEdit = state.customersCache.some(p => p.id === id);
  const payload = {
    nama: $('#ep-nama').value.trim(),
    wa: $('#ep-wa').value.trim(),
    kanal: $('#ep-kanal').value,
    seg: $('#ep-seg').value,
    label: $('#ep-lab').value,
    optin: $('#ep-opt').value === 'true'
  };

  try {
    const res = await fetch(isEdit ? `/api/pelanggan/${id}` : '/api/pelanggan', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Gagal simpan');
    const saved = await res.json();
    state.lastSavedId = saved.id;
    $('#dlg-pelanggan').close();
    toast(`Pelanggan ${saved.nama} (${saved.id}) berhasil disimpan`);
    loadPelanggan();
  } catch (err) { alert(err.message); }
}

export async function deletePelanggan(id) {
  if (state.currentRole !== 'Admin') return alert('Hanya Admin yang dapat menghapus data.');
  if (!confirm(`Hapus pelanggan ${id}?`)) return;
  try {
    const res = await fetch(`/api/pelanggan/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Gagal menghapus');
    toast(`Pelanggan ${id} berhasil dihapus`);
    loadPelanggan();
  } catch (err) { alert(err.message); }
}

export async function resetDemoData() {
  if (state.currentRole !== 'Admin') return alert('Hanya Admin yang dapat mereset data.');
  if (!confirm('Kembalikan 20 data master pelanggan demo?')) return;
  try {
    await fetch('/api/pelanggan/reset-demo', { method: 'POST' });
    toast('Data demo berhasil direset');
    loadPelanggan();
  } catch (err) { alert(err.message); }
}
