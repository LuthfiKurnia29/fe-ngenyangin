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

function formatPrice(price) {
  return 'Rp ' + Number(price || 0).toLocaleString('id-ID')
}

function goToDetail() {
  if (auth.role === 'consumer') {
    router.push({ name: 'FoodDetail', params: { id: props.food.id } })
  }
}

function addToCart(e) {
  e.stopPropagation()
  if (!auth.isLoggedIn) {
    router.push({ name: 'Login' })
    return
  }
  cart.addItem(props.food)
  notify.success(`${props.food.name} ditambahkan ke keranjang!`)
}
</script>

<template>
  <article
    class="food-card overflow-hidden cursor-pointer group"
    @click="goToDetail"
    :aria-label="`Lihat detail ${food.name}`"
  >
    <!-- Food Image -->
    <div class="relative overflow-hidden" style="aspect-ratio: 4/3;">
      <img
        :src="food.image"
        :alt="food.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <!-- Discount Badge -->
      <span v-if="food.discount > 0" class="discount-badge">-{{ food.discount }}%</span>

      <!-- Urgency overlay if very few left -->
      <div
        v-if="food.stock <= 3"
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
        {{ food.category }}
      </span>

      <!-- Name -->
      <h3 class="font-poppins font-semibold text-text-primary text-sm leading-snug line-clamp-2">
        {{ food.name }}
      </h3>

      <!-- Supplier -->
      <p class="text-xs text-text-secondary flex items-center gap-1">
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
        <span class="truncate">{{ food.supplierName }}</span>
      </p>

      <!-- Outlet / Stock / Deadline row -->
      <div class="flex items-center gap-2 text-xs text-text-secondary">
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          </svg>
          {{ (food.outlet || '').split(',')[0] }}
        </span>
        <span class="text-border">•</span>
        <span class="text-accent font-medium">Ambil &lt; {{ food.pickupDeadline }}</span>
      </div>

      <!-- Safety Badge -->
      <FoodSafetyBadge v-if="food.safetyApproved" />

      <!-- Price & CTA row -->
      <div class="flex items-center justify-between mt-1">
        <div>
          <p class="price-original text-xs">{{ formatPrice(food.originalPrice) }}</p>
          <p class="price-discount text-base">{{ formatPrice(food.discountPrice) }}</p>
        </div>

        <!-- Add to cart button -->
        <button
          v-if="auth.role === 'consumer' || !auth.isLoggedIn"
          @click="addToCart"
          class="w-9 h-9 min-w-[36px] flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark active:scale-95 transition-all shadow-sm"
          :aria-label="`Tambah ${food.name} ke keranjang`"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>
