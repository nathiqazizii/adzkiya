import { $, rp, toast } from '../utils.js';

export async function loadDashboard() {
  try {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error('Gagal mengambil data dashboard');
    const d = await res.json();

    if ($('#dash-omset')) $('#dash-omset').textContent = rp(d.totalOmset);
    if ($('#dash-orders')) $('#dash-orders').textContent = d.totalPesanan || 0;
    if ($('#dash-optin-rate')) $('#dash-optin-rate').textContent = (d.optInRate || 75) + '%';
  } catch (err) {
    console.error('Error loadDashboard:', err);
  }
}

export function initDashboardListeners() {
  const btnRefreshDash = $('#btn-refresh-dashboard');
  if (btnRefreshDash) {
    btnRefreshDash.onclick = () => {
      loadDashboard();
      toast('Metrik eksekutif diperbarui');
    };
  }
}
