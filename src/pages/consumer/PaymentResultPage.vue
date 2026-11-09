<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const status = computed(() => route.query.status || 'failed')
const orderId = computed(() => route.query.orderId || '')
const transactionId = computed(() => route.query.transactionId || '')

const config = computed(() => {
  const map = {
    success: {
      emoji: '✅',
      title: 'Pembayaran Berhasil!',
      desc: 'Pesananmu telah diterima dan sedang diproses oleh supplier.',
      badgeClass: 'bg-green-100 text-green-700',
      badgeText: 'Lunas',
      action: { label: 'Lihat Pesanan', path: orderId.value ? `/pesanan/${orderId.value}` : '/pesanan' },
    },
    pending: {
      emoji: '⏳',
      title: 'Menunggu Pembayaran',
      desc: 'Pembayaranmu sedang diverifikasi. Pesanan akan diproses setelah pembayaran dikonfirmasi.',
      badgeClass: 'bg-yellow-100 text-yellow-700',
      badgeText: 'Menunggu Pembayaran',
      action: { label: 'Lihat Pesanan', path: orderId.value ? `/pesanan/${orderId.value}` : '/pesanan' },
    },
    failed: {
      emoji: '❌',
      title: 'Pembayaran Gagal',
      desc: 'Pembayaran gagal atau ditolak. Silakan coba lagi dengan metode pembayaran lain.',
      badgeClass: 'bg-red-100 text-red-700',
      badgeText: 'Gagal',
      action: { label: 'Coba Bayar Lagi', path: '/checkout' },
    },
    closed: {
      emoji: '🚫',
      title: 'Pembayaran Dibatalkan',
      desc: 'Kamu menutup halaman pembayaran sebelum menyelesaikan transaksi.',
      badgeClass: 'bg-gray-100 text-gray-600',
      badgeText: 'Dibatalkan',
      action: { label: 'Kembali ke Checkout', path: '/checkout' },
    },
  }
  return map[status.value] || map['failed']
})
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md text-center">
      <div class="bg-surface rounded-lg border border-border shadow-card p-8">
        <p class="text-6xl mb-4">{{ config.emoji }}</p>
        <h1 class="font-poppins font-bold text-xl text-primary-dark mb-2">{{ config.title }}</h1>
        <p class="text-sm text-text-secondary mb-6">{{ config.desc }}</p>

        <!-- Badge status pembayaran -->
        <div class="flex justify-center mb-6">
          <span :class="['px-4 py-1.5 rounded-full text-sm font-semibold', config.badgeClass]">
            {{ config.badgeText }}
          </span>
        </div>

        <!-- Detail transaksi -->
        <div v-if="transactionId || orderId" class="text-left bg-background rounded-md p-4 mb-6 space-y-2 text-sm">
          <div v-if="orderId" class="flex justify-between">
            <span class="text-text-secondary">ID Pesanan</span>
            <span class="font-medium text-text-primary">{{ orderId }}</span>
          </div>
          <div v-if="transactionId" class="flex justify-between">
            <span class="text-text-secondary">ID Transaksi Midtrans</span>
            <span class="font-medium text-text-primary text-xs">{{ transactionId }}</span>
          </div>
        </div>

        <!-- CTA -->
        <div class="space-y-3">
          <BaseButton variant="primary" full-width @click="router.push(config.action.path)">
            {{ config.action.label }}
          </BaseButton>
          <BaseButton variant="outline" full-width @click="router.push('/jelajah')">
            Lanjut Belanja
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
