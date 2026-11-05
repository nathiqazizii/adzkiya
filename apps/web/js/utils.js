/**
 * Shared DOM Selectors & Formatting Utilities
 */

export const $ = sel => document.querySelector(sel);
export const $$ = sel => document.querySelectorAll(sel);

export const esc = str => String(str ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

export const rp = num => 'Rp' + Number(num || 0).toLocaleString('id-ID');

export function toast(message, duration = 2800) {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), duration);
}
