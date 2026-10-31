# NGENYANGIN Front‑End Project

**NGENYANGIN** adalah aplikasi web responsif yang menghubungkan supplier makanan surplus (UMKM kuliner) dengan konsumen. Aplikasi ini dibangun dengan **Vue 3**, **Vite**, **Tailwind CSS**, **Pinia** dan **Vue Router**. Semua teks antarmuka berbahasa Indonesia.

---

## 📦 Prasyarat

- **Node.js** (versi 20 atau lebih baru) dan **npm**
- Git (optional, untuk cloning repository)
- Koneksi internet untuk mengunduh dependensi npm

> **Catatan:** Pada Windows pastikan `npm` berada di PATH. Jika Anda menggunakan PowerShell, jalankan perintah di dalam folder proyek.

---

## 🚀 Menjalankan proyek secara Lokal

1. **Clone atau buka folder proyek**
   ```bash
   cd C:\Users\Huawei\Ngenyangin
   ```

2. **Pasang dependensi**
   ```bash
   npm install
   ```
   Proses ini akan menginstal semua paket yang terdaftar di `package.json` termasuk:
   - `vue@^3.5.13`
   - `vue-router@^4.5.0`
   - `pinia@^2.3.0`
   - `tailwindcss@^3.4.17`
   - `lucide-vue-next` (akan menampilkan peringatan deprecation; tetap dapat dipakai)
   - `vite@^6.0.7`

3. **Mulai server pengembangan**
   ```bash
   npm run dev
   ```
   Setelah beberapa detik, Vite akan menampilkan alamat lokal, biasanya:
   ```
   ➜  Local:   http://localhost:5173/
   ```
   Buka URL tersebut di browser untuk melihat aplikasi.

4. **Membangun versi produksi** (opsional)
   ```bash
   npm run build   # menghasilkan folder dist
   npm run preview # menjalankan server preview produksi
   ```

---

## 🎨 Styling & UI

- **Tailwind CSS** dipakai untuk semua styling, jadi tidak ada file CSS terpisah kecuali yang berada di dalam komponen dengan `scoped`.
- **Desain warna, tipografi, radius** diatur via `tailwind.config.js` sesuai token yang didefinisikan dalam `DESIGN.md`.
- **Ikon** menggunakan paket `lucide-vue-next` (atau dapat diganti ke `@lucide/vue` bila di‑upgrade).
- **Logo** berada di `src/assets/ngenyangin.svg` dan dipanggil langsung di layout.

---

## 📂 Struktur Utama

```
src/
├─ assets/               # logo & assets statis
├─ components/           # komponen UI yang dapat dipakai ulang
├─ layouts/              # layout wrapper (Public, Consumer, Dashboard)
├─ pages/                # setiap view halaman (public, consumer, supplier, courier, admin)
├─ router/               # konfigurasi Vue Router (src/router/index.js)
├─ services/             # service layer (mis. deliveryService.js)
├─ stores/               # Pinia stores (auth, cart, dll.)
├─ data/                 # data contoh JSON (foods.json, deliveries.json)
├─ main.js               # entry point Vue app
└─ App.vue               # root component
```

---

## 🛠️ Pengembangan Lanjutan

- **Menambah halaman atau komponen**: buat file `.vue` di dalam `src/pages/` atau `src/components/` dan daftarkan rutenya di `src/router/index.js`.
- **State management**: gunakan Pinia stores di `src/stores/`.
- **Deploy**: setelah `npm run build`, folder `dist/` dapat di‑hosting di layanan statis seperti Netlify, Vercel, atau GitHub Pages.

---

## 💡 Tips Debugging

- Jika `npm run dev` mengeluarkan error *ENOENT* terkait file Vue yang tidak ditemukan, pastikan file tersebut memang ada pada jalur yang di‑import (contoh: `src/pages/courier/UploadProofPage.vue`).
- Jalankan `npm audit` untuk memeriksa kerentanan paket.
- Untuk memperbarui ikon, ganti dependensi `lucide-vue-next` dengan `@lucide/vue` dan perbarui import di komponen.

---

## 📄 Lisensi

Proyek ini dibuat untuk tujuan demonstrasi front‑end dan tidak memiliki lisensi komersial. Anda dapat memodifikasinya sesuai kebutuhan.

---

**Selamat mengembangkan!** 🎉
