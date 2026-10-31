<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderService } from '@/services/orderService'
import { useOrdersStore } from '@/stores/orders'
import { useNotificationStore } from '@/stores/notifications'
import RatingStars from '@/components/base/RatingStars.vue'
import FormInput from '@/components/base/FormInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const notify = useNotificationStore()

const order = ref(null)
const rating = ref(0)
const comment = ref('')
const isLoading = ref(true)
const isSubmitting = ref(false)

onMounted(async () => {
  try { order.value = await orderService.getById(route.params.id) }
  catch { order.value = null }
  finally { isLoading.value = false }
})

async function submitReview() {
  if (rating.value === 0) { notify.error('Pilih rating minimal 1 bintang'); return }
  isSubmitting.value = true
  try {
    await ordersStore.addReview(order.value.id, { rating: rating.value, comment: comment.value, date: new Date().toISOString() })
    notify.success('Terima kasih! Ulasan berhasil dikirim 🎉')
    router.push('/pesanan')
  } finally { isSubmitting.value = false }
}
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container max-w-lg">
      <button @click="router.back()" class="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
      </button>

      <div v-if="isLoading" class="animate-pulse h-64 bg-border/30 rounded-lg"></div>
      <div v-else-if="!order" class="text-center py-16"><p class="text-4xl mb-3">😢</p><p class="font-semibold">Pesanan tidak ditemukan</p></div>

      <div v-else class="bg-surface rounded-lg border border-border p-6 space-y-6">
        <div class="text-center">
          <p class="text-4xl mb-2">⭐</p>
          <h1 class="font-poppins font-bold text-xl text-primary-dark">Beri Ulasan</h1>
          <p class="text-sm text-text-secondary mt-1">{{ order.foodName }}</p>
        </div>

        <!-- Order info -->
        <div class="flex items-center gap-3 p-3 bg-background rounded-md">
          <img :src="order.foodImage" :alt="order.foodName" class="w-12 h-12 rounded object-cover" />
          <div>
            <p class="text-sm font-medium">{{ order.foodName }}</p>
            <p class="text-xs text-text-secondary">{{ order.supplierName }} • {{ order.orderNumber }}</p>
          </div>
        </div>

        <!-- Rating -->
        <div class="text-center">
          <p class="text-sm font-medium text-text-primary mb-3">Bagaimana penilaianmu?</p>
          <div class="flex justify-center">
            <RatingStars v-model="rating" size="lg" />
          </div>
        </div>

        <!-- Comment -->
        <FormInput v-model="comment" label="Komentar (opsional)" type="textarea" placeholder="Ceritakan pengalaman kamu..." />

        <BaseButton variant="primary" full-width :loading="isSubmitting" @click="submitReview">
          Kirim Ulasan
        </BaseButton>
      </div>
    </div>
  </div>
</template>
