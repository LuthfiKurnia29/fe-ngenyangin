<script setup>
import { ref } from 'vue'

const terms = `
# Syarat & Ketentuan NGENYANGIN

## 1. Layanan
Pengguna dapat memesan makanan surplus yang tersedia di platform. Platform tidak bertanggung jawab atas kualitas makanan setelah diterima.

## 2. Akun
Setiap pengguna harus mendaftar dengan data yang akurat. Penyalahgunaan akun dapat menyebabkan penangguhan.

## 3. Pembayaran
Pembayaran dilakukan melalui integrasi pembayaran mock (tanpa transaksi nyata). Semua transaksi bersifat simulasi.

## 4. Hak Cipta
Desain UI, logo, dan konten visual dimiliki oleh NGENYANGIN. Dilarang menyalin atau mendistribusikan tanpa izin.

## 5. Kebijakan Privasi
Data pribadi hanya disimpan dalam localStorage untuk demo. Tidak ada pengiriman data ke server.

## 6. Batasan Tanggung Jawab
NGENYANGIN tidak bertanggung jawab atas kerusakan, kehilangan, atau sengketa antara konsumen dan supplier.

## 7. Perubahan Layanan
Kami berhak mengubah syarat, ketentuan, atau layanan tanpa pemberitahuan sebelumnya.

Terima kasih telah menggunakan NGENYANGIN!
`
</script>

<template>
  <div class="section-container py-6 md:py-10">
    <h1 class="font-poppins font-bold text-headline text-primary-dark mb-4">Syarat & Ketentuan</h1>
    <pre class="whitespace-pre-wrap font-inter text-text-primary leading-relaxed">{{ terms }}</pre>
  </div>
</template>
