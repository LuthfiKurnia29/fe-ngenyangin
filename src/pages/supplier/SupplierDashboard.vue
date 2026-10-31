<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { foodService } from '@/services/foodService'
import { useOrdersStore } from '@/stores/orders'
import StatusBadge from '@/components/order/StatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const auth = useAuthStore()
const ordersStore = useOrdersStore()
const myFoods = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [foods] = await Promise.all([
      foodService.getBySupplierId(auth.user.id),
      ordersStore.fetchSupplierOrders(auth.user.id)
    ])
    myFoods.value = foods
  } finally { isLoading.value = false }
})

const stats = computed(() => ({
  activeFoods: myFoods.value.filter(f => f.isActive).length,
  totalOrders: ordersStore.orders.length,
  pendingOrders: ordersStore.orders.filter(o => o.status === 'Menunggu' || o.status === 'Diproses').length,
  revenue: ordersStore.orders.filter(o => o.status === 'Selesai').reduce((s, o) => s + o.total, 0)
}))

function formatPrice(p) { return 'Rp ' + p.toLocaleString('id-ID') }
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Dashboard Supplier</h1>
        <p class="text-text-secondary text-sm mt-1">Selamat datang, {{ auth.userName }}! 👋</p>
      </div>
      <BaseButton variant="primary" @click="router.push('/supplier/tambah')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Makanan
      </BaseButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-surface rounded-md border border-border p-5">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Makanan Aktif</p>
        <p class="font-poppins font-bold text-2xl text-primary-dark mt-1">{{ stats.activeFoods }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-5">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Total Pesanan</p>
        <p class="font-poppins font-bold text-2xl text-primary-dark mt-1">{{ stats.totalOrders }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-5">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Menunggu</p>
        <p class="font-poppins font-bold text-2xl text-accent mt-1">{{ stats.pendingOrders }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-5">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Pendapatan</p>
        <p class="font-poppins font-bold text-2xl text-success mt-1">{{ formatPrice(stats.revenue) }}</p>
      </div>
    </div>

    <!-- My Foods -->
    <div class="bg-surface rounded-md border border-border p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-sm text-text-primary">Daftar Makanan Saya</h2>
        <BaseButton variant="ghost" size="sm" @click="router.push('/supplier/tambah')">+ Tambah</BaseButton>
      </div>
      <div v-if="isLoading" class="space-y-3"><div v-for="i in 3" :key="i" class="h-16 bg-border/30 rounded animate-pulse"></div></div>
      <div v-else-if="myFoods.length === 0" class="text-center py-8 text-text-secondary text-sm">Belum ada makanan. Tambahkan sekarang!</div>
      <div v-else class="divide-y divide-border">
        <div v-for="food in myFoods" :key="food.id" class="flex items-center gap-3 py-3">
          <img :src="food.image" :alt="food.name" class="w-12 h-12 rounded object-cover flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ food.name }}</p>
            <p class="text-xs text-text-secondary">Stok: {{ food.stock }} • {{ formatPrice(food.discountPrice) }}</p>
          </div>
          <StatusBadge :status="food.isActive ? 'Aktif' : 'Nonaktif'" size="sm" />
        </div>
      </div>
    </div>

    <!-- Recent orders -->
    <div class="bg-surface rounded-md border border-border p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-sm text-text-primary">Pesanan Terbaru</h2>
        <BaseButton variant="ghost" size="sm" @click="router.push('/supplier/pesanan')">Lihat Semua →</BaseButton>
      </div>
      <div v-if="ordersStore.orders.length === 0" class="text-center py-8 text-text-secondary text-sm">Belum ada pesanan masuk.</div>
      <div v-else class="divide-y divide-border">
        <div v-for="order in ordersStore.orders.slice(0, 5)" :key="order.id" class="flex items-center gap-3 py-3">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ order.orderNumber }} — {{ order.foodName }}</p>
            <p class="text-xs text-text-secondary">{{ order.consumerName }} • {{ order.quantity }}x</p>
          </div>
          <StatusBadge :status="order.status" size="sm" />
        </div>
      </div>
    </div>
  </div>
</template>
