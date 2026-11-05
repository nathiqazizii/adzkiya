import { $, $$, esc, toast } from '../utils.js';
import { state } from '../state.js';
import { ROLE_CONFIG } from './roles.js';

export async function checkAuth(onTabSwitch) {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        state.currentUser = data;
        state.currentRole = data.role || 'Admin';
        updateUserUI(onTabSwitch);
        renderRoleNavigation(state.currentRole, onTabSwitch);
        const conf = ROLE_CONFIG[state.currentRole] || ROLE_CONFIG.Admin;
        if (typeof onTabSwitch === 'function') onTabSwitch(conf.defaultTab);
        return true;
      }
    }
  } catch (err) {
    console.warn('Auth check error:', err);
  }
  window.location.href = '/login.html';
  return false;
}

export function updateUserUI(onTabSwitch) {
  const nameEl = $('#user-display');
  const roleEl = $('#user-role-tag');
  if (nameEl) nameEl.textContent = state.currentUser.namaLengkap || 'Admin Adzkiya';
  if (roleEl) roleEl.textContent = state.currentUser.role || 'Admin';

  const role = state.currentUser.role || 'Admin';
  const conf = ROLE_CONFIG[role] || ROLE_CONFIG.Admin;
  const tag = $('#context-tag');
  const desc = $('#context-desc');
  const actionBtn = $('#btn-role-quick-nav');

  if (tag) {
    tag.className = 'context-strip-tag ' + role.toLowerCase();
    tag.textContent = conf.tag;
  }
  if (desc) desc.textContent = conf.desc;
  if (actionBtn) {
    actionBtn.textContent = conf.quickNavText;
    actionBtn.onclick = () => { if (typeof onTabSwitch === 'function') onTabSwitch(conf.quickNavKey); };
  }
}

export function renderRoleNavigation(role, onTabSwitch) {
  const conf = ROLE_CONFIG[role] || ROLE_CONFIG.Admin;
  const nav = $('#nav');
  if (!nav) return;

  nav.innerHTML = conf.tabs.map(t => `
    <button type="button" class="${t.key === state.activeTab ? 'active' : ''}" data-tab="${esc(t.key)}" id="nav-tab-${esc(t.key)}">
      <svg class="icon" viewBox="0 0 24 24">${t.icon}</svg>
      <span>${esc(t.label)}</span>
    </button>
  `).join('');

  nav.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => { if (typeof onTabSwitch === 'function') onTabSwitch(btn.dataset.tab); };
  });

  applyRolePermissions(role);
}

export function applyRolePermissions(role) {
  const isAdmin = role === 'Admin';
  if ($('#btn-add')) $('#btn-add').style.display = isAdmin ? 'inline-flex' : 'none';
  if ($('#btn-rst')) $('#btn-rst').style.display = isAdmin ? 'inline-flex' : 'none';
  if ($('#btn-open-order-modal')) $('#btn-open-order-modal').style.display = isAdmin ? 'inline-flex' : 'none';
}

export function initAuthListeners(onTabSwitch) {
  const logoutBtn = $('#btn-logout');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (err) {}
      window.location.href = '/login.html';
    };
  }

  const switchAccBtn = $('#btn-switch-account');
  const switchAccDlg = $('#dlg-switch-account');
  const formSwitchLogin = $('#form-login-switch');

  if (switchAccBtn && switchAccDlg) {
    switchAccBtn.onclick = () => {
      if ($('#sw-err')) $('#sw-err').style.display = 'none';
      if (formSwitchLogin) formSwitchLogin.reset();
      switchAccDlg.showModal();
    };
  }

  if ($('#btn-close-switch-account') && switchAccDlg) {
    $('#btn-close-switch-account').onclick = () => switchAccDlg.close();
  }

  $$('[data-quick-user]').forEach(btn => {
    btn.onclick = async () => {
      const u = btn.dataset.quickUser;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: u + '123' })
        });
        if (res.ok) {
          state.currentUser = await res.json();
          state.currentRole = state.currentUser.role;
          updateUserUI(onTabSwitch);
          renderRoleNavigation(state.currentRole, onTabSwitch);
          const conf = ROLE_CONFIG[state.currentRole] || ROLE_CONFIG.Admin;
          if (typeof onTabSwitch === 'function') onTabSwitch(conf.defaultTab);
          toast(`Masuk sebagai: ${state.currentUser.namaLengkap} (${state.currentUser.role})`);
          if (switchAccDlg) switchAccDlg.close();
        }
      } catch (e) {
        toast('Gagal beralih akun');
      }
    };
  });
}
