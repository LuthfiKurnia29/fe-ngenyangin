<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderService } from '@/services/orderService'
import { paymentService } from '@/services/paymentService'
import { useNotificationStore } from '@/stores/notifications'
import OrderTimeline from '@/components/order/OrderTimeline.vue'
import StatusBadge from '@/components/order/StatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const notify = useNotificationStore()
const order = ref(null)
const isLoading = ref(true)
const isCheckingStatus = ref(false)
const isPaying = ref(false)

async function loadOrder() {
  try {
    order.value = await orderService.getById(route.params.id)
  } catch {
    order.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrder)

function formatPrice(p) {
  return 'Rp ' + Number(p || 0).toLocaleString('id-ID')
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function paymentBadgeClass(status) {
  const map = {
    'Lunas': 'bg-green-100 text-green-700',
    'Menunggu Pembayaran': 'bg-yellow-100 text-yellow-700',
    'Gagal': 'bg-red-100 text-red-700',
    'Dibatalkan': 'bg-gray-100 text-gray-600',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

async function handleCheckPayment() {
  if (!order.value?.id) return
  isCheckingStatus.value = true
  try {
    const updated = await orderService.checkStatus(order.value.id)
    if (updated) {
      order.value = updated
      notify.success(`Status pembayaran diperbarui: ${updated.status}`)
    } else {
      notify.info('Status pembayaran belum berubah dari Midtrans.')
    }
  } catch (e) {
    notify.error('Gagal memeriksa status pembayaran Midtrans')
  } finally {
    isCheckingStatus.value = false
  }
}

async function handlePayNow() {
  if (!order.value) return
  isPaying.value = true
  try {
    const snapToken = order.value.snapToken || order.value.snap_token
    if (snapToken) {
      const { status } = await paymentService.payWithSnap(snapToken)
      if (status === 'success') {
        notify.success('Pembayaran berhasil dikonfirmasi!')
        await handleCheckPayment()
      } else if (status === 'pending') {
        notify.info('Menunggu verifikasi pembayaran...')
        await handleCheckPayment()
      } else if (status === 'closed') {
        notify.info('Popup pembayaran ditutup')
      }
    } else if (order.value.paymentUrl || order.value.payment_url) {
      window.open(order.value.paymentUrl || order.value.payment_url, '_blank')
    } else {
      notify.error('Link pembayaran tidak tersedia')
    }
  } catch (err) {
    notify.error(err.message || 'Gagal membuka pembayaran')
  } finally {
    isPaying.value = false
  }
}
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container max-w-3xl">
      <button @click="router.push('/pesanan')" class="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Pesanan Saya
      </button>

      <div v-if="isLoading" class="animate-pulse space-y-4">
        <div class="h-32 bg-border/30 rounded-lg"></div>
        <div class="h-48 bg-border/30 rounded-lg"></div>
      </div>
      <div v-else-if="!order" class="text-center py-16">
        <p class="text-4xl mb-3">😢</p>
        <p class="font-semibold">Pesanan tidak ditemukan</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="bg-surface rounded-md border border-border p-5">
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-poppins font-bold text-lg text-primary-dark">{{ order.orderNumber }}</p>
              <p class="text-xs text-text-secondary">{{ new Date(order.createdAt).toLocaleString('id-ID') }}</p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <StatusBadge :status="order.status" />
              <!-- Badge pembayaran -->
              <span v-if="order.paymentStatus" :class="['text-xs px-2 py-0.5 rounded-full font-medium', paymentBadgeClass(order.paymentStatus)]">
                {{ order.paymentStatus }}
              </span>
            </div>
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

        <!-- Banner Menunggu Pembayaran & Action Buttons -->
        <div v-if="order.status === 'Menunggu'" class="bg-yellow-50 border border-yellow-200 rounded-md p-5">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">⏳</span>
            <div>
              <p class="font-semibold text-sm text-yellow-900">Menunggu Pembayaran Midtrans</p>
              <p class="text-xs text-yellow-700">Selesaikan transaksi Anda melalui Midtrans atau periksa statusnya jika Anda sudah membayar.</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 mt-4">
            <BaseButton
              v-if="order.snapToken || order.paymentUrl"
              variant="primary"
              size="sm"
              :loading="isPaying"
              @click="handlePayNow"
            >
              Lanjutkan Pembayaran
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              :loading="isCheckingStatus"
              @click="handleCheckPayment"
            >
              🔄 Cek Status Pembayaran
            </BaseButton>
          </div>
        </div>

        <!-- Info Pembayaran -->
        <div v-if="order.paymentStatus || order.orderNumber" class="bg-surface rounded-md border border-border p-5">
          <h2 class="font-semibold text-sm text-text-primary mb-3">Informasi Pembayaran</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-text-secondary">Status Pembayaran</span>
              <span :class="['px-2 py-0.5 rounded-full text-xs font-semibold', paymentBadgeClass(order.paymentStatus)]">{{ order.paymentStatus }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">Nomor Pesanan</span>
              <span class="font-mono text-xs text-text-primary">{{ order.orderNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">Waktu Pemesanan</span>
              <span class="font-medium text-text-primary">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">Metode Pengiriman</span>
              <span class="font-medium text-text-primary capitalize">{{ order.deliveryMethod === 'courier' ? 'Kurir Pengantaran' : 'Ambil Sendiri di Outlet' }}</span>
            </div>
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
          <p class="text-sm text-text-secondary mt-1">{{ order.deliveryAddress }}</p>
          <p v-if="order.specialNote" class="text-sm text-text-secondary mt-2 italic border-t border-border pt-2">
            "{{ order.specialNote }}"
          </p>
        </div>

        <!-- Bayar ulang jika gagal -->
        <div v-if="order.status === 'Dibatalkan'" class="bg-red-50 rounded-md p-5 text-center border border-red-200">
          <p class="text-sm font-medium text-error mb-3">Pesanan ini telah dibatalkan.</p>
          <BaseButton variant="primary" @click="router.push('/jelajah')">Jelajahi Makanan Lain</BaseButton>
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
