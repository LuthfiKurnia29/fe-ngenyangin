<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderService } from '@/services/orderService'
import OrderTimeline from '@/components/order/OrderTimeline.vue'
import StatusBadge from '@/components/order/StatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try { order.value = await orderService.getById(route.params.id) }
  catch { order.value = null }
  finally { isLoading.value = false }
})

function formatPrice(p) { return 'Rp ' + p.toLocaleString('id-ID') }
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container max-w-3xl">
      <button @click="router.push('/pesanan')" class="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Pesanan Saya
      </button>

      <div v-if="isLoading" class="animate-pulse space-y-4"><div class="h-32 bg-border/30 rounded-lg"></div><div class="h-48 bg-border/30 rounded-lg"></div></div>
      <div v-else-if="!order" class="text-center py-16"><p class="text-4xl mb-3">😢</p><p class="font-semibold">Pesanan tidak ditemukan</p></div>

      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="bg-surface rounded-md border border-border p-5">
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-poppins font-bold text-lg text-primary-dark">{{ order.orderNumber }}</p>
              <p class="text-xs text-text-secondary">{{ new Date(order.createdAt).toLocaleString('id-ID') }}</p>
            </div>
            <StatusBadge :status="order.status" />
          </div>

          <div class="flex gap-4 items-center border-t border-border pt-3">
            <img
              :src="order.foodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'"
              :alt="order.foodName"
              class="w-16 h-16 rounded object-cover flex-shrink-0 bg-border/20 border border-border"
              @error="(e) => e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'"
            />
            <div class="flex-1">
              <p class="font-semibold text-sm">{{ order.foodName }}</p>
              <p class="text-xs text-text-secondary">{{ order.supplierName }} • {{ order.quantity }}x</p>
              <p class="text-xs text-text-secondary">{{ order.deliveryMethod === 'courier' ? '🛵 Diantar Kurir' : '🏪 Ambil di Outlet' }}</p>
            </div>
            <p class="price-discount text-lg">{{ formatPrice(order.total) }}</p>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-surface rounded-md border border-border p-5">
          <h2 class="font-semibold text-sm text-text-primary mb-4">Status Pesanan</h2>
          <OrderTimeline :steps="order.timeline" />
        </div>

        <!-- Delivery address (courier) -->
        <div v-if="order.deliveryMethod === 'courier' && order.deliveryAddress" class="bg-surface rounded-md border border-border p-5">
          <h2 class="font-semibold text-sm text-text-primary mb-2">Alamat Pengantaran</h2>
          <p class="text-sm text-text-secondary">{{ order.deliveryAddress }}</p>
          <p v-if="order.specialNote" class="text-sm text-text-secondary mt-2 italic border-t border-border pt-2">
            "{{ order.specialNote }}"
          </p>
        </div>

        <!-- Review CTA -->
        <div v-if="order.status === 'Selesai' && !order.review" class="bg-primary-soft rounded-md p-5 text-center">
          <p class="text-sm font-medium text-primary mb-3">Bagaimana pengalaman pesananmu? Beri ulasan! ⭐</p>
          <BaseButton variant="primary" @click="router.push(`/ulasan/${order.id}`)">Beri Ulasan</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
