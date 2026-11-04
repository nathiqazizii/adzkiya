import { $, $$, toast } from './utils.js';
import { state } from './state.js';
import { checkAuth, initAuthListeners } from './modules/auth.js';
import { loadPelanggan, initPelangganListeners } from './modules/pelanggan.js';
import { loadPesanan, initPesananListeners } from './modules/pesanan.js';
import { loadKokiEval, resolveKokiTicket, initKokiListeners } from './modules/koki.js';
import { loadMasukan, initMasukanListeners } from './modules/masukan.js';
import { loadDashboard, initDashboardListeners } from './modules/dashboard.js';
import { loadSapaHangat, initSapaListeners } from './modules/sapa.js';
import { initBuyerOrderView, loadBuyerOrderStatus, initBuyerListeners } from './modules/pembeli.js';

const TAB_PARTIALS = [
  '/partials/tab-c.html',
  '/partials/tab-o.html',
  '/partials/tab-m.html',
  '/partials/tab-d.html',
  '/partials/tab-s.html',
  '/partials/tab-koki.html',
  '/partials/tab-buyer.html'
];

const DLG_PARTIALS = [
  '/partials/dlg-pelanggan.html',
  '/partials/dlg-pesanan.html',
  '/partials/dlg-switch.html'
];

async function loadViewPartials() {
  const [tabs, dlgs] = await Promise.all([
    Promise.all(TAB_PARTIALS.map(u => fetch(u).then(r => r.text()))),
    Promise.all(DLG_PARTIALS.map(u => fetch(u).then(r => r.text())))
  ]);

  const appEl = $('#app');
  if (appEl) appEl.innerHTML = tabs.join('\n');

  const dlgEl = $('#dialogs-container');
  if (dlgEl) dlgEl.innerHTML = dlgs.join('\n');
}

export function switchTab(tabKey) {
  state.activeTab = tabKey;

  $$('#nav button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabKey);
  });

  $$('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabKey}`);
  });

  if (tabKey === 'c') loadPelanggan();
  if (tabKey === 'o') loadPesanan();
  if (tabKey === 'm') loadMasukan();
  if (tabKey === 'd') loadDashboard();
  if (tabKey === 's') loadSapaHangat();
  if (tabKey === 'koki-eval') loadKokiEval();
  if (tabKey === 'buyer-order') initBuyerOrderView();
  if (tabKey === 'buyer-status') loadBuyerOrderStatus();
}

window.switchTab = switchTab;
window.resolveKokiTicket = resolveKokiTicket;

function initTheme() {
  const themeBtn = $('#btn-theme');
  const savedTheme = localStorage.getItem('adz_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeBtn) {
    themeBtn.onclick = () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const nxt = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nxt);
      localStorage.setItem('adz_theme', nxt);
      toast(`Mode: ${nxt === 'dark' ? 'Gelap' : 'Terang'}`);
    };
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await loadViewPartials();

  initAuthListeners(switchTab);
  initPelangganListeners();
  initPesananListeners();
  initKokiListeners();
  initMasukanListeners();
  initDashboardListeners();
  initSapaListeners();
  initBuyerListeners();

  checkAuth(switchTab);
});
