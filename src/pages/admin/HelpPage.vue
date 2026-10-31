<script setup>
import { ref } from 'vue'

const helpTopics = ref([
  { title: 'Cara Memesan', content: 'Pilih makanan, tambahkan ke keranjang, pilih metode pengambilan atau pengantaran, lalu checkout.' },
  { title: 'Cara Menjadi Supplier', content: 'Daftar, verifikasi, lalu unggah produk surplus melalui dashboard supplier.' },
  { title: 'Cara Menjadi Kurir', content: 'Daftar, lengkapi data kendaraan, dan mulai menerima tugas pengiriman.' },
])
</script>

<template>
  <div class="section-container py-6 md:py-10">
    <h1 class="font-poppins font-bold text-headline text-primary-dark mb-4">Bantuan & Panduan</h1>
    <div class="space-y-6">
      <div v-for="topic in helpTopics" :key="topic.title" class="bg-surface rounded-md border border-border p-5">
        <h2 class="font-semibold text-text-primary mb-2">{{ topic.title }}</h2>
        <p class="text-text-secondary leading-relaxed">{{ topic.content }}</p>
      </div>
    </div>
  </div>
</template>
