<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const cart = useCartStore()

function formatPrice(p) { return 'Rp ' + p.toLocaleString('id-ID') }
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container max-w-3xl">
      <h1 class="font-poppins font-bold text-headline text-primary-dark mb-6">Keranjang Belanja</h1>

      <!-- Empty -->
      <div v-if="cart.items.length === 0" class="text-center py-16 bg-surface rounded-lg border border-border">
        <p class="text-5xl mb-4">🛒</p>
        <p class="font-semibold text-lg text-text-primary">Keranjang masih kosong</p>
        <p class="text-sm text-text-secondary mt-1 mb-4">Yuk jelajahi makanan surplus terbaik!</p>
        <BaseButton variant="primary" @click="router.push('/jelajah')">Jelajahi Makanan</BaseButton>
      </div>

      <!-- Cart items -->
      <div v-else class="space-y-4">
        <div
          v-for="item in cart.items"
          :key="item.foodId"
          class="bg-surface rounded-md border border-border p-4 flex gap-4 items-center shadow-card"
        >
          <img :src="item.image" :alt="item.name" class="w-20 h-20 rounded-md object-cover flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm text-text-primary truncate">{{ item.name }}</h3>
            <p class="text-xs text-text-secondary">{{ item.supplierName }}</p>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="price-discount text-sm">{{ formatPrice(item.discountPrice) }}</span>
              <span class="price-original text-xs">{{ formatPrice(item.originalPrice) }}</span>
            </div>
          </div>
          <!-- Qty controls -->
          <div class="flex items-center border border-border rounded-full">
            <button @click="cart.updateQuantity(item.foodId, item.quantity - 1)" class="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-primary-soft rounded-l-full">−</button>
            <span class="w-8 text-center text-sm font-semibold">{{ item.quantity }}</span>
            <button @click="cart.updateQuantity(item.foodId, item.quantity + 1)" class="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-primary-soft rounded-r-full">+</button>
          </div>
          <!-- Price -->
          <p class="price-discount text-sm w-24 text-right">{{ formatPrice(item.discountPrice * item.quantity) }}</p>
          <!-- Remove -->
          <button @click="cart.removeItem(item.foodId)" class="p-2 text-text-secondary hover:text-error transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>

        <!-- Summary -->
        <div class="bg-surface rounded-md border border-border p-6 mt-6">
          <div class="flex justify-between items-center text-lg">
            <span class="font-semibold text-text-primary">Subtotal</span>
            <span class="price-discount text-xl">{{ formatPrice(cart.subtotal) }}</span>
          </div>
          <p class="text-xs text-text-secondary mt-1">Ongkir dihitung saat checkout</p>
          <div class="flex flex-col sm:flex-row gap-3 mt-4">
            <BaseButton variant="outline" class="w-full sm:flex-1" @click="router.push('/jelajah')">Lanjut Belanja</BaseButton>
            <BaseButton variant="primary" class="flex-1" @click="router.push('/checkout')">Checkout</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
