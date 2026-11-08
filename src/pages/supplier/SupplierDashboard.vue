<script setup>
import { ref, onMounted, computed, watch } from 'vue'
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

const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'

async function loadDashboardData() {
  isLoading.value = true
  try {
    if (!auth.user) {
      await auth.fetchMe()
    }

    const userId = auth.user?.id
    if (userId) {
      const [foods] = await Promise.all([
        foodService.getBySupplierId(userId).catch(() => []),
        ordersStore.fetchSupplierOrders(userId, auth.user).catch(() => [])
      ])
      myFoods.value = foods || []
    }
  } catch (err) {
    console.error('Error loading dashboard data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDashboardData)

watch(() => auth.user, (u) => {
  if (u?.id) {
    loadDashboardData()
  }
}, { deep: true })

const stats = computed(() => {
  const orders = ordersStore.orders || []
  return {
    activeFoods: myFoods.value.filter(f => f.isActive).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'Menunggu' || o.status === 'Diproses').length,
    revenue: orders
      .filter(o => o.status === 'Selesai')
      .reduce((s, o) => s + Number(o.total || 0), 0)
  }
})

async function removeFood(food) {
  if (!confirm(`Hapus "${food.name}"?`)) return
  try {
    await foodService.remove(food.id)
    myFoods.value = myFoods.value.filter(f => f.id !== food.id)
  } catch {
    alert('Gagal menghapus makanan')
  }
}

function formatPrice(p) {
  return 'Rp ' + Number(p || 0).toLocaleString('id-ID')
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Dashboard Supplier</h1>
        <p class="text-text-secondary text-sm mt-1">Selamat datang, {{ auth.userName || 'Supplier' }}! 👋</p>
      </div>
      <BaseButton variant="primary" @click="router.push('/supplier/tambah')">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Makanan
      </BaseButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-surface rounded-md border border-border p-5 shadow-sm">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Makanan Aktif</p>
        <p class="font-poppins font-bold text-2xl text-primary-dark mt-1">{{ stats.activeFoods }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-5 shadow-sm">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Total Pesanan</p>
        <p class="font-poppins font-bold text-2xl text-primary-dark mt-1">{{ stats.totalOrders }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-5 shadow-sm">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Pesanan Aktif</p>
        <p class="font-poppins font-bold text-2xl text-accent mt-1">{{ stats.pendingOrders }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-5 shadow-sm">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Pendapatan</p>
        <p class="font-poppins font-bold text-2xl text-success mt-1">{{ formatPrice(stats.revenue) }}</p>
      </div>
    </div>

    <!-- My Foods -->
    <div class="bg-surface rounded-md border border-border p-5 mb-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-sm text-text-primary">Daftar Makanan Saya</h2>
        <BaseButton variant="ghost" size="sm" @click="router.push('/supplier/tambah')">+ Tambah</BaseButton>
      </div>
      <div v-if="isLoading" class="space-y-3"><div v-for="i in 3" :key="i" class="h-16 bg-border/30 rounded animate-pulse"></div></div>
      <div v-else-if="myFoods.length === 0" class="text-center py-8 text-text-secondary text-sm">
        Belum ada makanan. Tambahkan sekarang!
      </div>
      <div v-else class="divide-y divide-border">
        <div v-for="food in myFoods" :key="food.id" class="flex items-center gap-3 py-3">
          <img
            :src="food.image || defaultImage"
            :alt="food.name"
            class="w-12 h-12 rounded object-cover flex-shrink-0 bg-border/20 border border-border"
            @error="(e) => e.target.src = defaultImage"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate text-text-primary">{{ food.name }}</p>
            <p class="text-xs text-text-secondary">Stok: {{ food.stock }} • {{ formatPrice(food.discountPrice) }}</p>
          </div>
          <StatusBadge :status="food.isActive ? 'Aktif' : 'Nonaktif'" size="sm" />
          <BaseButton variant="ghost" size="sm" @click="router.push(`/supplier/edit/${food.id}`)">Edit</BaseButton>
          <BaseButton variant="ghost" size="sm" @click="removeFood(food)">Hapus</BaseButton>
        </div>
      </div>
    </div>

    <!-- Recent orders -->
    <div class="bg-surface rounded-md border border-border p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-semibold text-sm text-text-primary">Pesanan Terbaru</h2>
          <p class="text-xs text-text-secondary mt-0.5">Daftar pesanan terbaru yang perlu diproses</p>
        </div>
        <BaseButton variant="ghost" size="sm" @click="router.push('/supplier/pesanan')">
          Lihat Semua ({{ ordersStore.orders.length }}) →
        </BaseButton>
      </div>

      <div v-if="ordersStore.isLoading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-14 bg-border/30 rounded animate-pulse"></div>
      </div>
      <div v-else-if="ordersStore.orders.length === 0" class="text-center py-8 text-text-secondary text-sm">
        Belum ada pesanan masuk.
      </div>
      <div v-else class="divide-y divide-border">
        <div
          v-for="order in ordersStore.orders.slice(0, 5)"
          :key="order.id"
          class="flex items-center justify-between gap-3 py-3 cursor-pointer hover:bg-background/60 rounded px-2 transition-colors"
          @click="router.push('/supplier/pesanan')"
        >
          <div class="flex items-center gap-3 min-w-0">
            <img
              :src="order.foodImage || defaultImage"
              :alt="order.foodName"
              class="w-10 h-10 rounded object-cover flex-shrink-0 bg-border/20 border border-border"
              @error="(e) => e.target.src = defaultImage"
            />
            <div class="min-w-0">
              <p class="text-sm font-medium truncate text-text-primary">
                {{ order.orderNumber }} — {{ order.foodName }}
              </p>
              <p class="text-xs text-text-secondary">
                {{ order.consumerName || 'Pelanggan' }} • {{ order.quantity }}x • {{ formatPrice(order.total) }}
                <span class="mx-1">•</span>
                <span>{{ order.deliveryMethod === 'courier' ? '🛵 Kurir' : '🏪 Ambil di Outlet' }}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <StatusBadge :status="order.status" size="sm" />
            <svg class="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
