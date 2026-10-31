<script setup>
import { ref, onMounted } from 'vue'
import { complaintService } from '@/services/complaintService'
import StatusBadge from '@/components/order/StatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const complaints = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    complaints.value = await complaintService.getAll()
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="section-container py-6 md:py-10">
    <h1 class="font-poppins font-bold text-headline text-primary-dark mb-4">Keluhan Pengguna</h1>
    <p class="text-text-secondary mb-6">Daftar semua keluhan yang diterima dari konsumen dan supplier.</p>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-16 bg-border/20 rounded animate-pulse"></div>
    </div>
    <div v-else-if="complaints.length === 0" class="text-center py-12 text-text-secondary">
      <p class="text-4xl mb-2">📭</p>
      <p class="text-text-primary font-medium">Tidak ada keluhan yang masuk.</p>
    </div>
    <div v-else class="divide-y divide-border">
      <div v-for="c in complaints" :key="c.id" class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-text-primary">{{ c.title }} ({{ c.userName }})</p>
            <p class="text-xs text-text-secondary mt-1">{{ new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }} • {{ c.status }}</p>
          </div>
          <StatusBadge :status="c.status" size="sm" />
        </div>
        <p class="mt-2 text-sm text-text-primary">{{ c.description }}</p>
        <BaseButton variant="outline" size="sm" class="mt-2">Tanggapi</BaseButton>
      </div>
    </div>
  </div>
</template>
