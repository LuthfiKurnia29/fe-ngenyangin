<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { complaintService } from '@/services/complaintService'
import { userService } from '@/services/userService'
import { orderService } from '@/services/orderService'
import StatusBadge from '@/components/order/StatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const auth = useAuthStore()
const stats = ref({ users: 0, orders: 0, complaints: 0, revenue: 0 })
const recentComplaints = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [users, orders, complaints] = await Promise.all([
      userService.getAll(),
      orderService.getAll(),
      complaintService.getAll()
    ])
    stats.value.users = users.length
    stats.value.orders = orders.length
    stats.value.complaints = complaints.length
    stats.value.revenue = orders.filter(o => o.status === 'Selesai' && o.paymentStatus === 'Lunas').reduce((s, o) => s + o.total, 0)
    recentComplaints.value = complaints.slice(0, 5)
  } finally { isLoading.value = false }
})

function formatPrice(p) { return 'Rp ' + p.toLocaleString('id-ID') }
</script>

<template>
  <div class="section-container py-6 md:py-10">
    <h1 class="font-poppins font-bold text-headline text-primary-dark mb-4">Dashboard Admin</h1>
    <p class="text-text-secondary mb-6">Selamat datang, {{ auth.userName }}!</p>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-surface rounded-md border border-border p-5">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Pengguna</p>
        <p class="font-poppins font-bold text-2xl text-primary-dark mt-1">{{ stats.users }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-5">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Total Pesanan</p>
        <p class="font-poppins font-bold text-2xl text-primary-dark mt-1">{{ stats.orders }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-5">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Keluhan</p>
        <p class="font-poppins font-bold text-2xl text-accent mt-1">{{ stats.complaints }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-5">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Pendapatan</p>
        <p class="font-poppins font-bold text-2xl text-success mt-1">{{ formatPrice(stats.revenue) }}</p>
      </div>
    </div>

    <h2 class="font-poppins font-semibold text-lg text-primary-dark mb-3">Keluhan Terbaru</h2>
    <div v-if="isLoading" class="space-y-3"><div v-for="i in 3" :key="i" class="h-16 bg-border/20 rounded animate-pulse"></div></div>
    <div v-else-if="recentComplaints.length === 0" class="text-text-secondary">Tidak ada keluhan.</div>
    <div v-else class="divide-y divide-border">
      <div v-for="c in recentComplaints" :key="c.id" class="p-4 flex items-center justify-between">
        <div>
          <p class="font-medium text-text-primary">{{ c.title }} ({{ c.userName }})</p>
          <p class="text-xs text-text-secondary">{{ new Date(c.createdAt).toLocaleDateString('id-ID') }}</p>
        </div>
        <StatusBadge :status="c.status" size="sm" />
      </div>
    </div>
  </div>
</template>
