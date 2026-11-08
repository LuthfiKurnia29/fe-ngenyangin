<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import StatusBadge from '@/components/order/StatusBadge.vue'

const router = useRouter()
const auth = useAuthStore()
const ordersStore = useOrdersStore()

const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'

async function loadOrders() {
  if (!auth.user) {
    await auth.fetchMe()
  }
  if (auth.user?.id) {
    ordersStore.fetchOrders(auth.user.id, auth.user)
  }
}

onMounted(loadOrders)
watch(() => auth.user, (u) => {
  if (u?.id) ordersStore.fetchOrders(u.id, u)
})

function formatPrice(p) { return 'Rp ' + p.toLocaleString('id-ID') }
function formatDate(d) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container max-w-3xl">
      <h1 class="font-poppins font-bold text-headline text-primary-dark mb-6">Pesanan Saya</h1>

      <div v-if="ordersStore.isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-surface rounded-md border border-border p-5 animate-pulse h-28"></div>
      </div>

      <div v-else-if="ordersStore.orders.length === 0" class="text-center py-16 bg-surface rounded-lg border border-border">
        <p class="text-5xl mb-4">📋</p>
        <p class="font-semibold text-lg">Belum ada pesanan</p>
        <p class="text-sm text-text-secondary mt-1">Mulai jelajahi makanan surplus sekarang!</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in ordersStore.orders"
          :key="order.id"
          @click="router.push(`/pesanan/${order.id}`)"
          class="bg-surface rounded-md border border-border p-5 cursor-pointer hover:shadow-card transition-all"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex gap-3 min-w-0">
              <img
                :src="order.foodImage || defaultImage"
                :alt="order.foodName"
                class="w-14 h-14 rounded object-cover flex-shrink-0 bg-border/20 border border-border"
                @error="(e) => e.target.src = defaultImage"
              />
              <div class="min-w-0">
                <p class="font-semibold text-sm text-text-primary truncate">{{ order.foodName }}</p>
                <p class="text-xs text-text-secondary">{{ order.supplierName }} • {{ order.quantity }}x</p>
                <p class="text-xs text-text-secondary mt-0.5">{{ formatDate(order.createdAt) }}</p>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <StatusBadge :status="order.status" size="sm" />
              <p class="price-discount text-sm mt-1">{{ formatPrice(order.total) }}</p>
            </div>
          </div>

          <!-- Review / Track CTA -->
          <div class="flex gap-2 mt-3 border-t border-border pt-3">
            <span class="text-xs text-text-secondary">{{ order.orderNumber }}</span>
            <span class="flex-1"></span>
            <span v-if="order.status === 'Selesai' && !order.review" class="text-xs text-accent font-medium">Beri Ulasan →</span>
            <span v-else class="text-xs text-primary font-medium">Lihat Detail →</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
