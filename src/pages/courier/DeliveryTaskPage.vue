<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { deliveryService } from '@/services/deliveryService'
import StatusBadge from '@/components/order/StatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const deliveryId = route.params.id
const delivery = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    delivery.value = await deliveryService.getById(deliveryId)
  } finally { isLoading.value = false }
})

function markDelivered() {
  // mock update status locally
  delivery.value.status = 'Selesai'
}
</script>

<template>
  <div class="section-container py-6 md:py-10">
    <h1 class="font-poppins font-bold text-headline text-primary-dark mb-4">Detail Tugas Pengiriman</h1>
    <div v-if="isLoading" class="animate-pulse">
      <div class="h-48 bg-border/20 rounded mb-4"></div>
      <div class="h-6 bg-border/20 rounded w-1/3 mb-2"></div>
      <div class="h-4 bg-border/20 rounded w-1/2"></div>
    </div>
    <div v-else-if="!delivery" class="text-center text-text-secondary py-12">
      <p>Data tugas tidak ditemukan.</p>
    </div>
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p class="font-medium text-text-primary">Order #: {{ delivery.orderNumber }}</p>
          <p class="text-text-secondary">{{ delivery.foodName }}</p>
          <p class="text-sm text-text-secondary mt-2">Tujuan: {{ delivery.destinationAddress }}</p>
        </div>
        <div class="flex items-center justify-end">
          <StatusBadge :status="delivery.status" size="lg" />
        </div>
      </div>
      <div class="flex gap-4">
        <BaseButton variant="primary" @click="markDelivered" :disabled="delivery.status === 'Selesai'">
          Tandai Selesai
        </BaseButton>
        <BaseButton variant="outline" @click="$router.back()">Kembali</BaseButton>
      </div>
    </div>
  </div>
</template>
