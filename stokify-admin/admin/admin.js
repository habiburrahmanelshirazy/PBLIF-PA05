/* Stokify Admin - helper bersama. Data disimpan di localStorage (demo tanpa backend). */
const DB = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem('stokify_' + k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { localStorage.setItem('stokify_' + k, JSON.stringify(v)); }
};
const SEED = {
  stok: [
    { id: 1, nama: 'Beras', kategori: 'Bahan Makanan', jumlah: 2, satuan: 'kg', min: 5, catatan: '' },
    { id: 2, nama: 'Minyak Goreng', kategori: 'Bahan Makanan', jumlah: 3, satuan: 'liter', min: 2, catatan: '' },
    { id: 3, nama: 'Sabun Cuci Piring', kategori: 'Kebersihan', jumlah: 1, satuan: 'botol', min: 2, catatan: '' },
    { id: 4, nama: 'Gula Pasir', kategori: 'Bahan Makanan', jumlah: 5, satuan: 'kg', min: 3, catatan: '' },
    { id: 5, nama: 'Mie Instan', kategori: 'Bahan Makanan', jumlah: 8, satuan: 'bungkus', min: 10, catatan: '' },
    { id: 6, nama: 'Telor Ayam', kategori: 'Bahan Makanan', jumlah: 25, satuan: 'butir', min: 20, catatan: '' }
  ],
  belanja: [
    { id: 1, nama: 'Beras', kategori: 'Bahan Makanan', jumlah: 5, satuan: 'kg', harga: 75000, dibeli: false },
    { id: 2, nama: 'Sabun Cuci Piring', kategori: 'Kebersihan', jumlah: 2, satuan: 'botol', harga: 24000, dibeli: false },
    { id: 3, nama: 'Telur', kategori: 'Bahan Makanan', jumlah: 1, satuan: 'kg', harga: 30000, dibeli: false },
    { id: 4, nama: 'Sabun Mandi', kategori: 'Perlengkapan Mandi', jumlah: 3, satuan: 'pcs', harga: 15000, dibeli: false }
  ],
  pengguna: [
    { id: 1, username: 'admin', nama: 'Administrator', peran: 'Admin', status: 'Aktif' },
    { id: 2, username: 'habibur', nama: 'Habiburrahman Elshirazy', peran: 'Anggota', status: 'Aktif' },
    { id: 3, username: 'nadine', nama: 'Nadine Aulia Putri', peran: 'Anggota', status: 'Aktif' }
  ],
  notif: []
};
const KATEGORI = ['Bahan Makanan', 'Minuman', 'Kebersihan', 'Perlengkapan Mandi', 'Lainnya'];
const SATUAN = ['kg', 'liter', 'botol', 'bungkus', 'butir', 'pcs'];

function load(k) { let v = DB.get(k, null); if (v === null) { v = SEED[k]; DB.set(k, v); } return v; }
function nextId(a) { return a.reduce((m, x) => Math.max(m, x.id), 0) + 1; }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function rupiah(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
function opts(list, sel) { return list.map(x => `<option ${x === sel ? 'selected' : ''}>${esc(x)}</option>`).join(''); }
function logNotif(judul, pesan, tipe) {
  const n = load('notif');
  n.unshift({ id: nextId(n), judul, pesan, tipe: tipe || 'info', waktu: new Date().toISOString(), baca: false });
  DB.set('notif', n.slice(0, 50));
}
function guard() { if (sessionStorage.getItem('stokify_admin') !== '1') location.href = 'login.html'; }
function logout() { sessionStorage.removeItem('stokify_admin'); location.href = 'login.html'; }

function layout(active) {
  const unread = load('notif').filter(n => !n.baca).length;
  const user = sessionStorage.getItem('stokify_user') || 'admin';
  document.getElementById('topnav').innerHTML = `
  <nav class="navbar navbar-dark fixed-top"><div class="container-fluid">
    <a class="navbar-brand fw-bold" href="index.html"><i class="fas fa-house me-2"></i>STOKIFY ADMIN</a>
    <div class="text-white d-flex align-items-center gap-3">
      <a href="notifikasi.html" class="text-white text-decoration-none position-relative" title="Notifikasi"><i class="fas fa-bell"></i>
        ${unread ? `<span class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">${unread}</span>` : ''}</a>
      <span class="small d-none d-md-inline"><i class="fas fa-user me-1"></i>${esc(user)}</span>
      <button class="btn btn-sm btn-outline-light" onclick="logout()">Keluar</button>
    </div></div></nav>`;
  const items = [['index', 'Dashboard', 'fa-gauge'], ['stok', 'Kelola Stok', 'fa-boxes'], ['belanja', 'Kelola Belanja', 'fa-cart-plus'],
    ['pengguna', 'Pengguna', 'fa-users'], ['notifikasi', 'Notifikasi', 'fa-bell']];
  document.getElementById('side').innerHTML = '<div class="side-title">MENU ADMIN</div>' +
    items.map(([k, l, i]) => `<a href="${k}.html" class="${k === active ? 'active' : ''}"><i class="fas ${i} fa-fw me-2"></i>${l}</a>`).join('') +
    '<hr class="border-secondary"><a href="../layout.html" target="_blank"><i class="fas fa-arrow-up-right-from-square fa-fw me-2"></i>Lihat situs</a>';
}
function toast(msg, type) {
  let box = document.getElementById('toastbox');
  if (!box) { box = document.createElement('div'); box.id = 'toastbox'; box.className = 'toast-container position-fixed bottom-0 end-0 p-3'; document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${type || 'success'} border-0`;
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(msg)}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  box.appendChild(el); const t = new bootstrap.Toast(el, { delay: 2500 }); t.show(); el.addEventListener('hidden.bs.toast', () => el.remove());
}
const HEAD = (title) => `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} - Stokify Admin</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><link rel="stylesheet" href="admin.css">`;
