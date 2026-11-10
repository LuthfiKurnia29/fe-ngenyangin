<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import FoodSafetyBadge from './FoodSafetyBadge.vue'

const props = defineProps({
  food: { type: Object, required: true }
})

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const notify = useNotificationStore()

// gambar cadangan (SVG) bila produk belum punya gambar / gambar gagal dimuat
const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="100%" height="100%" fill="#F3F7F4"/>
    <circle cx="200" cy="130" r="45" fill="#E2EBE5"/>
    <text x="200" y="142" font-size="36" text-anchor="middle">🍽️</text>
    <text x="200" y="195" fill="#4B6354" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="13" text-anchor="middle">Foto Segera Hadir</text>
  </svg>`
)

function onImageError(event) {
  event.target.src = placeholder
}

function formatPrice(price) {
  return 'Rp ' + Number(price || 0).toLocaleString('id-ID')
}

function goToDetail() {
  if (props.food?.id) {
    router.push({ name: 'FoodDetail', params: { id: props.food.id } })
  }
}

function goToStore(e) {
  e.stopPropagation()
  if (props.food.supplierId) {
    router.push(`/toko/${props.food.supplierId}`)
  }
}

function addToCart(e) {
  e.stopPropagation()
  if (!auth.isLoggedIn) {
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  const result = cart.addItem(props.food)
  if (result?.conflict) {
    const confirmSwitch = window.confirm(
      `Keranjang belanja Anda sudah berisi makanan dari "${result.currentSupplierName}".\n\nSetiap pesanan dibatasi 1 toko per transaksi. Apakah Anda ingin mengosongkan keranjang dan menggantinya dengan pesanan dari "${result.newSupplierName}"?`
    )
    if (confirmSwitch) {
      cart.addItem(props.food, 1, true)
      notify.success(`${props.food.name} ditambahkan ke keranjang!`)
    }
    return
  }
  notify.success(`${props.food.name} ditambahkan ke keranjang!`)
}
</script>

<template>
  <article
    class="food-card overflow-hidden cursor-pointer group flex flex-col justify-between"
    @click="goToDetail"
    :aria-label="`Lihat detail ${food.name}`"
  >
    <!-- Food Image -->
    <div>
      <div class="relative overflow-hidden bg-surface-alt" style="aspect-ratio: 4/3;">
        <img
          :src="food.image || placeholder"
          :alt="food.name"
          @error="onImageError"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <!-- Discount Badge -->
        <span v-if="food.discount > 0" class="discount-badge">-{{ food.discount }}%</span>

        <!-- Urgency overlay if very few left -->
        <div
          v-if="food.stock > 0 && food.stock <= 3"
          class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-4"
        >
          <span class="text-white text-xs font-semibold">
            🔥 Tersisa {{ food.stock }} porsi!
          </span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-4 flex flex-col gap-2">
        <!-- Category chip -->
        <span class="chip bg-primary-soft text-primary text-xs w-fit">
          {{ food.category || 'Makanan' }}
        </span>

        <!-- Name -->
        <h3 class="font-poppins font-semibold text-text-primary text-sm leading-snug line-clamp-2">
          {{ food.name }}
        </h3>

        <!-- Supplier — clickable -->
        <p class="text-xs text-text-secondary flex items-center gap-1">
          <svg class="w-3.5 h-3.5 flex-shrink-0 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <button
            v-if="food.supplierId"
            @click="goToStore"
            class="truncate hover:text-primary hover:underline transition-colors cursor-pointer text-left"
          >{{ food.supplierName }}</button>
          <span v-else class="truncate">{{ food.supplierName }}</span>
        </p>

        <!-- Outlet / Stock / Deadline row -->
        <div class="flex items-center gap-2 text-xs text-text-secondary">
          <span class="flex items-center gap-1 truncate">
            <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span class="truncate">{{ (food.outlet || food.address || '').split(',')[0] || 'Lokasi terdekat' }}</span>
          </span>
          <template v-if="food.pickupDeadline">
            <span class="text-border">•</span>
            <span class="text-accent font-medium whitespace-nowrap">Ambil &lt; {{ food.pickupDeadline }}</span>
          </template>
        </div>

        <!-- Safety Badge -->
        <FoodSafetyBadge v-if="food.safetyApproved" />
      </div>
    </div>

    <!-- Price & CTA row (always aligned at the bottom) -->
    <div class="px-4 pb-4 pt-1 flex items-center justify-between mt-auto">
      <div>
        <p v-if="food.originalPrice > food.discountPrice" class="price-original text-xs">{{ formatPrice(food.originalPrice) }}</p>
        <p class="price-discount text-base">{{ formatPrice(food.discountPrice) }}</p>
      </div>

      <!-- Add to cart button -->
      <button
        v-if="food.stock > 0"
        @click="addToCart"
        class="w-9 h-9 min-w-[36px] flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark active:scale-95 transition-all shadow-sm"
        :aria-label="`Tambah ${food.name} ke keranjang`"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
      <span v-else class="text-xs text-text-secondary italic">Habis</span>
    </div>
  </article>
</template>
