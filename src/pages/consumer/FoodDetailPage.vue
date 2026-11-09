<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { foodService } from '@/services/foodService'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notifications'
import FoodSafetyBadge from '@/components/food/FoodSafetyBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const notify = useNotificationStore()

const food = ref(null)
const isLoading = ref(true)
const qty = ref(1)

onMounted(async () => {
  try {
    food.value = await foodService.getById(route.params.id)
  } catch { food.value = null }
  finally { isLoading.value = false }
})

function formatPrice(p) { return 'Rp ' + p.toLocaleString('id-ID') }

function addToCart() {
  if (!food.value) return
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
      <!-- Back -->
      <button @click="router.back()" class="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
      </button>

      <!-- Loading -->
      <div v-if="isLoading" class="animate-pulse space-y-6">
        <div class="h-72 bg-border/30 rounded-lg"></div>
        <div class="h-8 bg-border/30 rounded w-2/3"></div>
      </div>

      <!-- Not found -->
      <div v-else-if="!food" class="text-center py-16">
        <p class="text-4xl mb-3">😢</p>
        <p class="font-semibold text-lg">Makanan tidak ditemukan</p>
        <BaseButton variant="secondary" class="mt-4" @click="router.push('/jelajah')">Kembali Jelajah</BaseButton>
      </div>

      <!-- Detail -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Image -->
        <div class="relative">
          <img :src="food.image" :alt="food.name" class="w-full rounded-lg shadow-card object-cover" style="aspect-ratio: 4/3;" />
          <span class="discount-badge text-base">-{{ food.discount }}%</span>
        </div>

        <!-- Info -->
        <div class="space-y-4">
          <span class="chip bg-primary-soft text-primary">{{ food.category }}</span>
          <h1 class="font-poppins font-bold text-2xl text-primary-dark">{{ food.name }}</h1>

          <!-- Supplier name — CLICKABLE -->
          <button
            @click="goToStore"
            class="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer transition-colors group"
            :title="`Lihat toko ${food.supplierName}`"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="group-hover:underline font-medium">{{ food.supplierName }}</span>
            <svg class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </button>

          <!-- Location — CLICKABLE -->
          <button
            @click="goToStore"
            class="flex items-center gap-2 text-sm text-text-secondary hover:text-primary cursor-pointer transition-colors group"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span class="group-hover:underline">{{ food.outlet || food.address || 'Lokasi belum diisi' }}</span>
          </button>

          <FoodSafetyBadge v-if="food.safetyApproved" />

          <!-- Price -->
          <div class="flex items-baseline gap-3 pt-2">
            <span class="price-discount text-3xl">{{ formatPrice(food.discountPrice) }}</span>
            <span class="price-original text-lg">{{ formatPrice(food.originalPrice) }}</span>
          </div>

          <!-- Stock & deadline -->
          <div class="flex gap-4 text-sm">
            <span class="chip bg-accent-soft text-accent">🔥 Tersisa {{ food.stock }} porsi</span>
            <span class="chip bg-primary-soft text-primary">⏰ Ambil sebelum {{ food.pickupDeadline }}</span>
          </div>

          <!-- Description -->
          <p class="text-text-secondary text-sm leading-relaxed border-t border-border pt-4">{{ food.description }}</p>

          <!-- Quantity + Add to cart -->
          <div class="flex items-center gap-4 pt-4">
            <div class="flex items-center border border-border rounded-full overflow-hidden">
              <button @click="qty = Math.max(1, qty - 1)" class="w-10 h-10 flex items-center justify-center hover:bg-primary-soft transition-colors text-text-primary">−</button>
              <span class="w-10 text-center font-semibold text-sm">{{ qty }}</span>
              <button @click="qty = Math.min(food.stock, qty + 1)" class="w-10 h-10 flex items-center justify-center hover:bg-primary-soft transition-colors text-text-primary">+</button>
            </div>
            <BaseButton variant="primary" size="lg" class="flex-1" @click="addToCart">
              Tambah ke Keranjang — {{ formatPrice(food.discountPrice * qty) }}
            </BaseButton>
          </div>

          <!-- Link ke halaman toko -->
          <button
            @click="goToStore"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary-soft transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Lihat Semua Menu {{ food.supplierName }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
