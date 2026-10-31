<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { useNotificationStore } from '@/stores/notifications'
import StatusBadge from '@/components/order/StatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const auth = useAuthStore()
const ordersStore = useOrdersStore()
const notify = useNotificationStore()

onMounted(() => { ordersStore.fetchSupplierOrders(auth.user.id) })

function formatPrice(p) { return 'Rp ' + p.toLocaleString('id-ID') }

async function processOrder(order) {
  await ordersStore.updateStatus(order.id, 'Diproses')
  notify.success(`Pesanan ${order.orderNumber} diproses!`)
}
async function readyOrder(order) {
  const s = order.deliveryMethod === 'courier' ? 'Dalam Pengantaran' : 'Siap Diambil'
  await ordersStore.updateStatus(order.id, s)
  notify.success(`Pesanan ${order.orderNumber} siap!`)
}
</script>

<template>
  <div>
    <h1 class="font-poppins font-bold text-headline text-primary-dark mb-6">Pesanan Masuk</h1>

    <div v-if="ordersStore.isLoading" class="space-y-3"><div v-for="i in 4" :key="i" class="h-20 bg-border/30 rounded animate-pulse"></div></div>
    <div v-else-if="ordersStore.orders.length === 0" class="text-center py-16 bg-surface rounded-lg border border-border">
      <p class="text-5xl mb-3">📋</p><p class="font-semibold">Belum ada pesanan masuk</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in ordersStore.orders" :key="order.id" class="bg-surface rounded-md border border-border p-5">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex gap-3">
            <img :src="order.foodImage" :alt="order.foodName" class="w-14 h-14 rounded object-cover flex-shrink-0" />
            <div>
              <p class="font-semibold text-sm">{{ order.orderNumber }}</p>
              <p class="text-sm">{{ order.foodName }} × {{ order.quantity }}</p>
              <p class="text-xs text-text-secondary">Dari: {{ order.consumerName }}</p>
              <p class="text-xs text-text-secondary">{{ order.deliveryMethod === 'courier' ? '🛵 Kurir' : '🏪 Ambil sendiri' }}</p>
            </div>
          </div>
          <div class="text-right">
            <StatusBadge :status="order.status" size="sm" />
            <p class="price-discount text-sm mt-1">{{ formatPrice(order.total) }}</p>
          </div>
        </div>

        <div v-if="order.status === 'Menunggu'" class="flex gap-2 border-t border-border pt-3">
          <BaseButton variant="primary" size="sm" @click="processOrder(order)">Proses Pesanan</BaseButton>
        </div>
        <div v-else-if="order.status === 'Diproses'" class="flex gap-2 border-t border-border pt-3">
          <BaseButton variant="secondary" size="sm" @click="readyOrder(order)">
            {{ order.deliveryMethod === 'courier' ? 'Serahkan ke Kurir' : 'Tandai Siap Diambil' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
