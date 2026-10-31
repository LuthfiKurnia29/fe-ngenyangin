<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { foodService } from '@/services/foodService'
import FoodCard from '@/components/food/FoodCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const featuredFoods = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const all = await foodService.getAll()
    featuredFoods.value = all.slice(0, 4)
  } finally {
    isLoading.value = false
  }
})

const howItWorks = [
  { step: '1', title: 'Pilih Makanan', desc: 'Jelajahi surplus makanan dari UMKM kuliner terdekat dengan harga diskon hingga 70%.', emoji: '🔍' },
  { step: '2', title: 'Pesan & Bayar', desc: 'Pilih metode: ambil di outlet atau diantar kurir rekanan. Bayar mudah dan cepat.', emoji: '🛒' },
  { step: '3', title: 'Nikmati & Selamatkan', desc: 'Nikmati makanan lezat, hemat uang, dan bantu kurangi pemborosan pangan Indonesia!', emoji: '🌱' },
]

const testimonials = [
  { name: 'Dewi S.', role: 'Mahasiswa UI', text: 'Sangat membantu! Bisa dapat makan enak dengan harga mahasiswa. Nasi bebek Bu Siti jadi langganan saya.', rating: 5 },
  { name: 'Raka P.', role: 'Pekerja Kantoran', text: 'Konsep yang luar biasa. Saya bisa hemat belanja makan malam dan sekaligus membantu pedagang di pasar.', rating: 5 },
  { name: 'Bu Ani', role: 'Pemilik Warung', text: 'Sebagai supplier, NGENYANGIN membantu saya menjual makanan yang biasanya terbuang. Pendapatan jadi lebih stabil.', rating: 5 },
]

const categories = [
  { label: 'Makanan Berat', emoji: '🍛' },
  { label: 'Jajanan', emoji: '🍢' },
  { label: 'Roti & Kue', emoji: '🍞' },
  { label: 'Minuman', emoji: '🥤' },
  { label: 'Sayur & Buah', emoji: '🥬' },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-gradient relative overflow-hidden">
      <div class="section-container py-16 md:py-24 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <div class="chip bg-accent-soft text-accent">
              🌿 Selamatkan makanan, hemat lebih banyak
            </div>
            <h1 class="font-poppins font-bold text-primary-dark text-3xl md:text-display leading-tight">
              Surplus Makanan
              <span class="text-accent">Segar</span>,
              Harga Lebih
              <span class="text-primary">Hemat</span>
            </h1>
            <p class="text-text-secondary text-lg leading-relaxed max-w-lg">
              Temukan makanan lezat dari UMKM kuliner terdekat dengan diskon hingga 70%. Ambil di outlet atau diantar kurir rekanan.
            </p>
            <div class="flex flex-wrap gap-3">
              <BaseButton variant="primary" size="lg" @click="router.push('/daftar')">
                Mulai Jelajahi
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </BaseButton>
              <BaseButton variant="outline" size="lg" @click="router.push('/masuk')">
                Sudah Punya Akun
              </BaseButton>
            </div>

            <!-- Stats -->
            <div class="flex gap-6 pt-4">
              <div>
                <p class="font-poppins font-bold text-2xl text-primary-dark">1.842+</p>
                <p class="text-xs text-text-secondary">Porsi diselamatkan hari ini</p>
              </div>
              <div class="w-px bg-border"></div>
              <div>
                <p class="font-poppins font-bold text-2xl text-primary-dark">247</p>
                <p class="text-xs text-text-secondary">Mitra UMKM kuliner</p>
              </div>
              <div class="w-px bg-border"></div>
              <div>
                <p class="font-poppins font-bold text-2xl text-primary-dark">4.9★</p>
                <p class="text-xs text-text-secondary">Rating pengguna</p>
              </div>
            </div>
          </div>

          <!-- Hero image -->
          <div class="hidden lg:block relative">
            <div class="rounded-lg overflow-hidden shadow-card-hover rotate-2 hover:rotate-0 transition-transform duration-500">
              <img src="https://picsum.photos/seed/hero-food/600/400" alt="Makanan surplus segar" class="w-full" />
            </div>
            <div class="absolute -bottom-6 -left-6 bg-white rounded-md shadow-card p-4 rotate-[-3deg]">
              <p class="text-sm font-semibold text-primary-dark">Hemat s/d 70%</p>
              <p class="text-xs text-text-secondary">Dari UMKM terpercaya</p>
            </div>
            <div class="absolute -top-4 -right-4 bg-accent text-white rounded-full w-20 h-20 flex items-center justify-center rotate-12 shadow-lg">
              <div class="text-center">
                <p class="text-xs font-bold">SURPLUS</p>
                <p class="text-lg font-bold">-70%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Decorative shapes -->
      <div class="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
    </section>

    <!-- Categories -->
    <section class="py-12 md:py-section">
      <div class="section-container">
        <div class="text-center mb-8">
          <h2 class="font-poppins font-semibold text-headline text-primary-dark">Kategori Makanan</h2>
          <p class="text-text-secondary mt-2">Pilih kategori favoritmu dan temukan surplus terbaik</p>
        </div>
        <div class="flex justify-center gap-4 flex-wrap">
          <button
            v-for="cat in categories"
            :key="cat.label"
            @click="router.push('/daftar')"
            class="flex flex-col items-center gap-2 p-4 bg-surface rounded-md border border-border hover:border-primary hover:shadow-card hover:-translate-y-1 transition-all min-w-[100px] cursor-pointer"
          >
            <span class="text-3xl">{{ cat.emoji }}</span>
            <span class="text-xs font-medium text-text-primary">{{ cat.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Surplus -->
    <section class="py-12 md:py-section bg-surface-mint">
      <div class="section-container">
        <div class="flex items-end justify-between mb-8">
          <div>
            <h2 class="font-poppins font-semibold text-headline text-primary-dark">Surplus Hari Ini 🔥</h2>
            <p class="text-text-secondary mt-1">Makanan segar dengan diskon terbaik, segera habis!</p>
          </div>
          <button @click="router.push('/daftar')" class="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Lihat semua
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-surface rounded-md border border-border animate-pulse">
            <div class="h-44 bg-border/30 rounded-t-md"></div>
            <div class="p-4 space-y-3">
              <div class="h-4 bg-border/30 rounded w-20"></div>
              <div class="h-5 bg-border/30 rounded w-full"></div>
              <div class="h-3 bg-border/30 rounded w-32"></div>
              <div class="h-6 bg-border/30 rounded w-24"></div>
            </div>
          </div>
        </div>

        <!-- Food grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FoodCard v-for="food in featuredFoods" :key="food.id" :food="food" />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-12 md:py-section">
      <div class="section-container">
        <div class="text-center mb-12">
          <h2 class="font-poppins font-semibold text-headline text-primary-dark">Cara Kerja NGENYANGIN</h2>
          <p class="text-text-secondary mt-2">Tiga langkah mudah untuk menyelamatkan makanan</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="item in howItWorks"
            :key="item.step"
            class="text-center bg-surface rounded-md border border-border p-8 hover:shadow-card hover:-translate-y-1 transition-all"
          >
            <div class="w-16 h-16 mx-auto mb-4 bg-primary-soft rounded-full flex items-center justify-center text-3xl">
              {{ item.emoji }}
            </div>
            <div class="w-8 h-8 mx-auto -mt-2 mb-3 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold font-poppins">
              {{ item.step }}
            </div>
            <h3 class="font-poppins font-semibold text-title text-text-primary mb-2">{{ item.title }}</h3>
            <p class="text-sm text-text-secondary leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-12 md:py-section bg-surface-mint">
      <div class="section-container">
        <div class="text-center mb-10">
          <h2 class="font-poppins font-semibold text-headline text-primary-dark">Apa Kata Mereka</h2>
          <p class="text-text-secondary mt-2">Ribuan pengguna sudah merasakan manfaat NGENYANGIN</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="t in testimonials"
            :key="t.name"
            class="bg-surface rounded-md border border-border p-6 hover:shadow-card transition-shadow"
          >
            <div class="flex gap-1 mb-3">
              <svg v-for="s in t.rating" :key="s" class="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <p class="text-sm text-text-primary leading-relaxed mb-4">"{{ t.text }}"</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-soft rounded-full flex items-center justify-center">
                <span class="text-sm font-bold text-primary">{{ t.name[0] }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-text-primary">{{ t.name }}</p>
                <p class="text-xs text-text-secondary">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Supplier CTA Banner -->
    <section class="py-12 md:py-section">
      <div class="section-container">
        <div class="bg-primary-dark rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div class="relative z-10">
            <h2 class="font-poppins font-bold text-2xl md:text-3xl text-white">Punya Surplus Makanan?</h2>
            <p class="text-white/70 mt-2 max-w-md text-sm leading-relaxed">
              Bergabunglah sebagai supplier NGENYANGIN. Jual sisa makanan segar, kurangi kerugian, dan bantu sesama.
            </p>
          </div>
          <BaseButton variant="primary" size="lg" @click="router.push('/daftar')" class="relative z-10 flex-shrink-0">
            Daftar sebagai Supplier
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </BaseButton>
          <div class="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  </div>
</template>
