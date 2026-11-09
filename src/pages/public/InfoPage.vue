<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pages = {
  tentang: {
    title: 'Tentang Kami',
    content: 'NGENYANGIN membantu menyelamatkan makanan surplus dari UMKM kuliner agar tetap bermanfaat bagi konsumen dengan harga yang lebih terjangkau.'
  },
  'cara-kerja': {
    title: 'Cara Kerja',
    content: 'Pilih makanan surplus, lakukan pemesanan, lalu ambil di outlet atau gunakan layanan pengantaran sesuai pilihan yang tersedia.'
  },
  misi: {
    title: 'Misi Kami',
    content: 'Kami membangun ekosistem kuliner yang lebih hemat dan berkelanjutan dengan mengurangi pemborosan pangan serta membantu UMKM.'
  }
}
const page = computed(() => pages[route.params.slug] || pages.tentang)
</script>

<template>
  <div class="section-container py-10 md:py-16">
    <article class="max-w-3xl mx-auto bg-surface rounded-lg border border-border shadow-card p-8 md:p-12">
      <h1 class="font-poppins font-bold text-headline text-primary-dark">{{ page.title }}</h1>
      <p class="text-text-primary text-lg leading-relaxed mt-5">{{ page.content }}</p>
      <RouterLink to="/daftar" class="inline-flex mt-8 text-primary font-medium hover:underline">Mulai bergabung</RouterLink>
    </article>
  </div>
</template>
