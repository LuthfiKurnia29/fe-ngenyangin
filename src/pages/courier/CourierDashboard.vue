<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { deliveryService } from '@/services/deliveryService'
import StatusBadge from '@/components/order/StatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const deliveries = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    deliveries.value = await deliveryService.getByCourierId(auth.user.id)
  } finally { isLoading.value = false }
})

function goToTask(id) {
  router.push({ name: 'DeliveryTask', params: { id } })
}
</script>

<template>
  <div class="section-container py-6 md:py-10">
    <h1 class="font-poppins font-bold text-headline text-primary-dark mb-4">Dashboard Kurir</h1>
    <p class="text-text-secondary mb-6">Selamat datang, {{ auth.userName }}! Berikut tugas pengiriman Anda.</p>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-16 bg-border/20 rounded animate-pulse"></div>
    </div>
    <div v-else-if="deliveries.length === 0" class="text-center py-12 text-text-secondary">
      <p class="text-4xl mb-2">🗒️</p>
      <p class="text-text-primary font-medium">Tidak ada tugas pengiriman saat ini.</p>
    </div>
    <div v-else class="divide-y divide-border">
      <div v-for="del in deliveries" :key="del.id" class="flex items-center justify-between py-4">
        <div>
          <p class="font-medium text-text-primary">{{ del.orderNumber }} — {{ del.foodName }}</p>
          <p class="text-xs text-text-secondary">{{ del.destinationAddress }}</p>
        </div>
        <div class="flex items-center gap-3">
          <StatusBadge :status="del.status" size="sm" />
          <BaseButton variant="primary" size="sm" @click="goToTask(del.id)">Lihat</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
