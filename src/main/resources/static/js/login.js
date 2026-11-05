/**
 * Authentication & Self-Registration Page Logic
 */

const tabLogin = document.getElementById('tab-btn-login');
const tabRegister = document.getElementById('tab-btn-register');
const formLogin = document.getElementById('login-form');
const formRegister = document.getElementById('register-form');
const msgBox = document.getElementById('msg-box');
const subtitle = document.getElementById('auth-subtitle');

function showMsg(text, isError = true) {
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.className = 'msg-banner ' + (isError ? 'error' : 'success');
  msgBox.style.display = 'block';
}

function clearMsg() {
  if (!msgBox) return;
  msgBox.style.display = 'none';
  msgBox.textContent = '';
}

tabLogin.onclick = () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  formLogin.style.display = 'block';
  formRegister.style.display = 'none';
  subtitle.textContent = 'Masuk ke Sistem Operasional & Dapur';
  clearMsg();
};

tabRegister.onclick = () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  formLogin.style.display = 'none';
  formRegister.style.display = 'block';
  subtitle.textContent = 'Pendaftaran Akun Pelanggan Meja Baru';
  clearMsg();
};

document.querySelectorAll('[data-u]').forEach(b => {
  b.onclick = () => {
    tabLogin.click();
    document.getElementById('username').value = b.dataset.u;
    document.getElementById('password').value = b.dataset.p;
    formLogin.requestSubmit();
  };
});

formLogin.onsubmit = async (e) => {
  e.preventDefault();
  clearMsg();
  const btn = document.getElementById('btn-login-submit');
  btn.disabled = true;
  btn.textContent = 'Memverifikasi...';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      window.location.href = '/';
    } else {
      const data = await res.json().catch(() => ({}));
      showMsg(data.message || 'Username atau password tidak sesuai.');
    }
  } catch (err) {
    showMsg('Tidak dapat menghubungi server backend. Pastikan server Java aktif.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Masuk ke Sistem`;
  }
};

formRegister.onsubmit = async (e) => {
  e.preventDefault();
  clearMsg();
  const btn = document.getElementById('btn-register-submit');
  btn.disabled = true;
  btn.textContent = 'Mendaftarkan akun...';

  const namaLengkap = document.getElementById('reg-nama').value.trim();
  const noWa = document.getElementById('reg-wa').value.trim();
  const username = document.getElementById('reg-username').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value.trim();

  if (password.length < 4) {
    showMsg('Kata sandi minimal 4 karakter.');
    btn.disabled = false;
    btn.textContent = 'Daftar & Masuk ke Warung';
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namaLengkap, noWa, username, password })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      showMsg('Pendaftaran berhasil! Mengalihkan ke meja Anda...', false);
      setTimeout(() => { window.location.href = '/'; }, 600);
    } else {
      showMsg(data.message || 'Gagal melakukan pendaftaran. Silakan coba lagi.');
    }
  } catch (err) {
    showMsg('Tidak dapat menghubungi server backend. Silakan periksa koneksi.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Daftar & Masuk ke Warung';
  }
};
