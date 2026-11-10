<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { foodService } from '@/services/foodService'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import FoodSafetyBadge from '@/components/food/FoodSafetyBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const notify = useNotificationStore()

const food = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const qty = ref(1)

const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="100%" height="100%" fill="#F3F7F4"/>
    <circle cx="300" cy="200" r="60" fill="#E2EBE5"/>
    <text x="300" y="215" font-size="48" text-anchor="middle">🍽️</text>
    <text x="300" y="290" fill="#4B6354" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="16" text-anchor="middle">Foto Segera Hadir</text>
  </svg>`
)

function onImageError(event) {
  event.target.src = placeholder
}

async function loadFood() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    food.value = await foodService.getById(route.params.id)
  } catch (err) {
    console.error('Gagal mengambil data produk:', err)
    food.value = null
    errorMessage.value = err.message || 'Makanan tidak ditemukan'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadFood()
})

function formatPrice(p) {
  return 'Rp ' + Number(p || 0).toLocaleString('id-ID')
}

function addToCart() {
  if (!food.value) return

  if (!auth.isLoggedIn) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  const result = cart.addItem(food.value, qty.value)
  if (result?.conflict) {
    const confirmSwitch = window.confirm(
      `Keranjang belanja Anda sudah berisi makanan dari "${result.currentSupplierName}".\n\nSetiap pesanan dibatasi 1 toko per transaksi. Apakah Anda ingin mengosongkan keranjang dan menggantinya dengan pesanan dari "${result.newSupplierName}"?`
    )
    if (confirmSwitch) {
      cart.addItem(food.value, qty.value, true)
      notify.success(`${food.value.name} (${qty.value}x) ditambahkan ke keranjang!`)
    }
    return
  }
  notify.success(`${food.value.name} (${qty.value}x) ditambahkan ke keranjang!`)
}

function goToStore() {
  if (food.value?.supplierId) {
    router.push(`/toko/${food.value.supplierId}`)
  }
}
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container">
      <!-- Back button -->
      <button
        @click="router.back()"
        class="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-6 transition-colors cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Kembali
      </button>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
        <div class="h-80 md:h-96 bg-border/30 rounded-2xl"></div>
        <div class="space-y-4">
          <div class="h-6 bg-border/30 rounded w-24"></div>
          <div class="h-9 bg-border/30 rounded w-3/4"></div>
          <div class="h-4 bg-border/30 rounded w-1/2"></div>
          <div class="h-8 bg-border/30 rounded w-1/3"></div>
          <div class="h-24 bg-border/30 rounded w-full"></div>
          <div class="h-12 bg-border/30 rounded-lg w-full"></div>
        </div>
      </div>

      <!-- Not found / Error state -->
      <div v-else-if="!food" class="text-center py-16 bg-surface rounded-2xl border border-border/60 max-w-lg mx-auto p-8">
        <p class="text-5xl mb-3">😢</p>
        <p class="font-semibold text-lg text-text-primary">{{ errorMessage || 'Makanan tidak ditemukan' }}</p>
        <p class="text-sm text-text-secondary mt-1 mb-6">Makanan mungkin sudah habis terjual atau tautan salah.</p>
        <div class="flex justify-center gap-3">
          <BaseButton variant="secondary" @click="router.push('/jelajah')">Kembali ke Jelajah</BaseButton>
          <BaseButton variant="primary" @click="loadFood">Coba Lagi</BaseButton>
        </div>
      </div>

      <!-- Detail Card -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Image & Badges -->
        <div class="relative bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-card">
          <div class="relative w-full" style="aspect-ratio: 4/3;">
            <img
              :src="food.image || placeholder"
              :alt="food.name"
              @error="onImageError"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- Discount badge -->
          <span v-if="food.discount > 0" class="discount-badge text-base top-4 left-4">
            -{{ food.discount }}%
          </span>
        </div>

        <!-- Info & Actions -->
        <div class="space-y-5">
          <!-- Category & Tags -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="chip bg-primary-soft text-primary font-medium text-xs">
              {{ food.category || 'Surplus Pangan' }}
            </span>
            <span
              v-for="tag in food.tags"
              :key="tag"
              class="chip bg-surface border border-border text-text-secondary text-xs"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Product Name -->
          <h1 class="font-poppins font-bold text-2xl md:text-3xl text-primary-dark leading-tight">
            {{ food.name }}
          </h1>

          <!-- Supplier name — CLICKABLE -->
          <div class="space-y-1.5 pt-1">
            <button
              @click="goToStore"
              class="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer transition-colors group text-left"
              :title="`Kunjungi toko ${food.supplierName}`"
            >
              <svg class="w-4 h-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span class="group-hover:underline font-semibold text-text-primary">{{ food.supplierName }}</span>
              <svg class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </button>

            <!-- Outlet / Address -->
            <div class="flex items-start gap-2 text-xs text-text-secondary">
              <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              <span>{{ food.outlet || food.address || 'Lokasi outlet belum diisi' }}</span>
            </div>
          </div>

          <!-- Food Safety Badge -->
          <div>
            <FoodSafetyBadge v-if="food.safetyApproved" />
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3 pt-2 border-t border-border/60">
            <span class="price-discount text-3xl font-bold">{{ formatPrice(food.discountPrice) }}</span>
            <span v-if="food.originalPrice > food.discountPrice" class="price-original text-lg">
              {{ formatPrice(food.originalPrice) }}
            </span>
          </div>

          <!-- Stock & Deadline Chips -->
          <div class="flex flex-wrap gap-2 text-sm">
            <span
              v-if="food.stock > 0"
              class="chip bg-accent-soft text-accent font-medium"
            >
              🔥 Tersisa {{ food.stock }} porsi
            </span>
            <span
              v-else
              class="chip bg-red-100 text-red-700 font-medium"
            >
              ❌ Stok Habis
            </span>

            <span v-if="food.pickupDeadline" class="chip bg-primary-soft text-primary font-medium">
              ⏰ Ambil sebelum {{ food.pickupDeadline }}
            </span>
          </div>

          <!-- Description -->
          <div class="border-t border-border/60 pt-4">
            <h3 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Deskripsi Makanan</h3>
            <p class="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {{ food.description || 'Tidak ada keterangan tambahan mengenai menu ini.' }}
            </p>
          </div>

          <!-- Quantity + Add to Cart -->
          <div class="pt-2">
            <div v-if="food.stock > 0" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div class="flex items-center justify-between border border-border rounded-full overflow-hidden w-full sm:w-auto">
                <button
                  @click="qty = Math.max(1, qty - 1)"
                  class="w-11 h-11 flex items-center justify-center hover:bg-primary-soft transition-colors text-text-primary text-lg cursor-pointer"
                  :disabled="qty <= 1"
                >−</button>
                <span class="w-10 text-center font-semibold text-sm">{{ qty }}</span>
                <button
                  @click="qty = Math.min(food.stock, qty + 1)"
                  class="w-11 h-11 flex items-center justify-center hover:bg-primary-soft transition-colors text-text-primary text-lg cursor-pointer"
                  :disabled="qty >= food.stock"
                >+</button>
              </div>

              <BaseButton variant="primary" size="lg" class="flex-1 cursor-pointer" @click="addToCart">
                Tambah ke Keranjang — {{ formatPrice(food.discountPrice * qty) }}
              </BaseButton>
            </div>

            <div v-else class="p-3.5 rounded-lg bg-surface-alt border border-border text-center text-sm text-text-secondary font-medium">
              Makanan ini sedang habis dan tidak dapat dipesan.
            </div>
          </div>

          <!-- Link to Supplier Store -->
          <button
            @click="goToStore"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary-soft transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Lihat Semua Menu dari {{ food.supplierName }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
