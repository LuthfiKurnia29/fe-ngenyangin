<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { useNotificationStore } from '@/stores/notifications'
import StatusBadge from '@/components/order/StatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const auth = useAuthStore()
const ordersStore = useOrdersStore()
const notify = useNotificationStore()

const activeTab = ref('all')
const searchQuery = ref('')
const isActionLoading = ref({})

const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'

async function loadOrders() {
  if (!auth.user) {
    await auth.fetchMe()
  }
  if (auth.user?.id) {
    await ordersStore.fetchSupplierOrders(auth.user.id, auth.user)
  }
}

onMounted(loadOrders)

watch(() => auth.user, (u) => {
  if (u?.id) {
    ordersStore.fetchSupplierOrders(u.id, u)
  }
}, { deep: true })

function formatPrice(p) {
  return 'Rp ' + Number(p || 0).toLocaleString('id-ID')
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB'
}

// Action Handlers
async function processOrder(order) {
  isActionLoading.value[order.id] = true
  try {
    await ordersStore.updateStatus(order.id, 'Diproses')
    notify.success(`Pesanan ${order.orderNumber} sedang diproses!`)
  } catch (err) {
    notify.error('Gagal memproses pesanan')
  } finally {
    isActionLoading.value[order.id] = false
  }
}

async function readyOrder(order) {
  isActionLoading.value[order.id] = true
  try {
    const nextStatus = order.deliveryMethod === 'courier' ? 'Dalam Pengantaran' : 'Siap Diambil'
    await ordersStore.updateStatus(order.id, nextStatus)
    notify.success(
      order.deliveryMethod === 'courier'
        ? `Pesanan ${order.orderNumber} diserahkan ke kurir!`
        : `Pesanan ${order.orderNumber} siap diambil!`
    )
  } catch (err) {
    notify.error('Gagal memperbarui status pesanan')
  } finally {
    isActionLoading.value[order.id] = false
  }
}

async function completeOrder(order) {
  isActionLoading.value[order.id] = true
  try {
    await ordersStore.updateStatus(order.id, 'Selesai')
    notify.success(`Pesanan ${order.orderNumber} telah selesai! 🎉`)
  } catch (err) {
    notify.error('Gagal menyelesaikan pesanan')
  } finally {
    isActionLoading.value[order.id] = false
  }
}

async function cancelOrder(order) {
  if (!confirm(`Batalkan pesanan ${order.orderNumber}?`)) return
  isActionLoading.value[order.id] = true
  try {
    await ordersStore.updateStatus(order.id, 'Dibatalkan')
    notify.info(`Pesanan ${order.orderNumber} dibatalkan`)
  } catch (err) {
    notify.error('Gagal membatalkan pesanan')
  } finally {
    isActionLoading.value[order.id] = false
  }
}

// Filter and Tab Counts
const counts = computed(() => {
  const all = ordersStore.orders || []
  return {
    all: all.length,
    menunggu: all.filter(o => o.status === 'Menunggu').length,
    diproses: all.filter(o => o.status === 'Diproses').length,
    siap: all.filter(o => o.status === 'Siap Diambil' || o.status === 'Dalam Pengantaran').length,
    selesai: all.filter(o => o.status === 'Selesai').length,
    dibatalkan: all.filter(o => o.status === 'Dibatalkan').length,
  }
})

const filteredOrders = computed(() => {
  let list = ordersStore.orders || []

  // Tab filter
  if (activeTab.value === 'menunggu') {
    list = list.filter(o => o.status === 'Menunggu')
  } else if (activeTab.value === 'diproses') {
    list = list.filter(o => o.status === 'Diproses')
  } else if (activeTab.value === 'siap') {
    list = list.filter(o => o.status === 'Siap Diambil' || o.status === 'Dalam Pengantaran')
  } else if (activeTab.value === 'selesai') {
    list = list.filter(o => o.status === 'Selesai')
  } else if (activeTab.value === 'dibatalkan') {
    list = list.filter(o => o.status === 'Dibatalkan')
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(o =>
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.foodName && o.foodName.toLowerCase().includes(q)) ||
      (o.consumerName && o.consumerName.toLowerCase().includes(q)) ||
      (o.consumerPhone && o.consumerPhone.toLowerCase().includes(q))
    )
  }

  return list
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Pesanan Masuk</h1>
        <p class="text-sm text-text-secondary mt-1">Kelola dan proses pesanan surplus dari pelanggan Anda</p>
      </div>
      <BaseButton variant="ghost" size="sm" @click="loadOrders" class="self-start sm:self-auto">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Segarkan Data
      </BaseButton>
    </div>

    <!-- Search & Filter Tabs -->
    <div class="bg-surface rounded-md border border-border p-4 mb-6 space-y-4">
      <!-- Search Input -->
      <div class="relative">
        <svg class="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nomor pesanan, makanan, atau nama pemesan..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap gap-2 pt-2 border-t border-border">
        <button
          @click="activeTab = 'all'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-background text-text-secondary hover:text-text-primary hover:bg-border/40'
          ]"
        >
          Semua
          <span :class="['px-1.5 py-0.2 rounded-full text-[10px]', activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-border text-text-secondary']">
            {{ counts.all }}
          </span>
        </button>

        <button
          @click="activeTab = 'menunggu'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'menunggu' ? 'bg-amber-500 text-white shadow-sm' : 'bg-background text-text-secondary hover:text-text-primary hover:bg-border/40'
          ]"
        >
          Menunggu
          <span :class="['px-1.5 py-0.2 rounded-full text-[10px]', activeTab === 'menunggu' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800']">
            {{ counts.menunggu }}
          </span>
        </button>

        <button
          @click="activeTab = 'diproses'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'diproses' ? 'bg-info text-white shadow-sm' : 'bg-background text-text-secondary hover:text-text-primary hover:bg-border/40'
          ]"
        >
          Diproses
          <span :class="['px-1.5 py-0.2 rounded-full text-[10px]', activeTab === 'diproses' ? 'bg-white/20 text-white' : 'bg-blue-100 text-info']">
            {{ counts.diproses }}
          </span>
        </button>

        <button
          @click="activeTab = 'siap'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'siap' ? 'bg-accent text-white shadow-sm' : 'bg-background text-text-secondary hover:text-text-primary hover:bg-border/40'
          ]"
        >
          Siap / Diantar
          <span :class="['px-1.5 py-0.2 rounded-full text-[10px]', activeTab === 'siap' ? 'bg-white/20 text-white' : 'bg-orange-100 text-accent']">
            {{ counts.siap }}
          </span>
        </button>

        <button
          @click="activeTab = 'selesai'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'selesai' ? 'bg-success text-white shadow-sm' : 'bg-background text-text-secondary hover:text-text-primary hover:bg-border/40'
          ]"
        >
          Selesai
          <span :class="['px-1.5 py-0.2 rounded-full text-[10px]', activeTab === 'selesai' ? 'bg-white/20 text-white' : 'bg-green-100 text-success']">
            {{ counts.selesai }}
          </span>
        </button>

        <button
          v-if="counts.dibatalkan > 0"
          @click="activeTab = 'dibatalkan'"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
            activeTab === 'dibatalkan' ? 'bg-error text-white shadow-sm' : 'bg-background text-text-secondary hover:text-text-primary hover:bg-border/40'
          ]"
        >
          Dibatalkan
          <span :class="['px-1.5 py-0.2 rounded-full text-[10px]', activeTab === 'dibatalkan' ? 'bg-white/20 text-white' : 'bg-red-100 text-error']">
            {{ counts.dibatalkan }}
          </span>
        </button>
      </div>
    </div>

    <!-- Orders List -->
    <div v-if="ordersStore.isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-36 bg-border/30 rounded-md animate-pulse"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="text-center py-16 bg-surface rounded-lg border border-border p-6">
      <div class="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        📋
      </div>
      <p class="font-poppins font-semibold text-lg text-primary-dark">Belum ada pesanan masuk</p>
      <p class="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
        {{ searchQuery ? 'Tidak ada pesanan yang sesuai dengan kata kunci pencarian.' : 'Pesanan dari konsumen akan muncul di sini secara otomatis saat pesanan dibuat.' }}
      </p>
      <BaseButton v-if="searchQuery" variant="ghost" size="sm" class="mt-4" @click="searchQuery = ''">
        Reset Pencarian
      </BaseButton>
    </div>

    <!-- Order Cards -->
    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-surface rounded-md border border-border p-5 hover:border-primary/40 transition-colors shadow-sm"
      >
        <!-- Top row: Number, Date, Status -->
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
          <div class="flex items-center gap-2">
            <span class="font-poppins font-bold text-sm text-primary-dark">{{ order.orderNumber }}</span>
            <span class="text-xs text-text-secondary">•</span>
            <span class="text-xs text-text-secondary">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              :class="[
                'text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1',
                order.deliveryMethod === 'courier' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              ]"
            >
              <span>{{ order.deliveryMethod === 'courier' ? '🛵 Kurir' : '🏪 Ambil di Outlet' }}</span>
            </span>
            <StatusBadge :status="order.status" size="sm" />
          </div>
        </div>

        <!-- Middle row: Food Details & Buyer Info -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 py-4">
          <!-- Food Image & Info (7 cols) -->
          <div class="md:col-span-7 flex gap-3">
            <img
              :src="order.foodImage || defaultImage"
              :alt="order.foodName"
              class="w-16 h-16 rounded object-cover flex-shrink-0 bg-border/20 border border-border"
              @error="(e) => e.target.src = defaultImage"
            />
            <div class="min-w-0">
              <p class="font-semibold text-sm text-text-primary line-clamp-1">{{ order.foodName }}</p>
              <p class="text-xs text-text-secondary mt-0.5">
                Jumlah: <span class="font-medium text-text-primary">{{ order.quantity }}x</span>
                <span class="mx-1">•</span>
                Harga: {{ formatPrice(order.discountPrice) }}
              </p>
              <p class="text-xs text-text-secondary mt-0.5" v-if="order.deliveryFee">
                Ongkir: {{ formatPrice(order.deliveryFee) }}
              </p>
              <p class="text-xs font-semibold text-primary mt-1">
                Total: {{ formatPrice(order.total) }}
              </p>
            </div>
          </div>

          <!-- Buyer & Delivery Details (5 cols) -->
          <div class="md:col-span-5 bg-background/60 rounded p-3 text-xs space-y-1.5 border border-border/50">
            <div class="flex items-center justify-between">
              <span class="text-text-secondary">Pemesan:</span>
              <span class="font-medium text-text-primary">{{ order.consumerName || 'Pelanggan' }}</span>
            </div>
            <div class="flex items-center justify-between" v-if="order.consumerPhone">
              <span class="text-text-secondary">Telepon / WA:</span>
              <a
                :href="`https://wa.me/${order.consumerPhone.replace(/[^0-9]/g, '')}`"
                target="_blank"
                class="font-medium text-primary hover:underline flex items-center gap-1"
              >
                {{ order.consumerPhone }}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div v-if="order.deliveryMethod === 'courier' && order.deliveryAddress" class="pt-1 border-t border-border/40">
              <span class="text-text-secondary block mb-0.5">Alamat Pengantaran:</span>
              <p class="text-text-primary text-[11px] leading-tight">{{ order.deliveryAddress }}</p>
            </div>
            <div v-if="order.specialNote" class="pt-1 border-t border-border/40">
              <span class="text-text-secondary block mb-0.5">Catatan Khusus:</span>
              <p class="text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 text-[11px] italic">
                "{{ order.specialNote }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <div class="text-xs text-text-secondary">
            Status: <span class="font-medium text-text-primary">{{ order.status }}</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Batalkan (jika Menunggu) -->
            <button
              v-if="order.status === 'Menunggu'"
              class="px-3 py-1.5 rounded text-xs font-medium text-error hover:bg-error/10 transition-colors disabled:opacity-50"
              :disabled="isActionLoading[order.id]"
              @click="cancelOrder(order)"
            >
              Tolak Pesanan
            </button>

            <!-- Status: Menunggu -> Proses Pesanan -->
            <BaseButton
              v-if="order.status === 'Menunggu'"
              variant="primary"
              size="sm"
              :disabled="isActionLoading[order.id]"
              @click="processOrder(order)"
            >
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Proses Pesanan
            </BaseButton>

            <!-- Status: Diproses -> Siap Diambil / Serahkan ke Kurir -->
            <BaseButton
              v-else-if="order.status === 'Diproses'"
              variant="primary"
              size="sm"
              :disabled="isActionLoading[order.id]"
              @click="readyOrder(order)"
            >
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ order.deliveryMethod === 'courier' ? 'Serahkan ke Kurir' : 'Tandai Siap Diambil' }}
            </BaseButton>

            <!-- Status: Siap Diambil / Dalam Pengantaran -> Selesai -->
            <BaseButton
              v-else-if="order.status === 'Siap Diambil' || order.status === 'Dalam Pengantaran'"
              variant="secondary"
              size="sm"
              :disabled="isActionLoading[order.id]"
              @click="completeOrder(order)"
            >
              <svg class="w-3.5 h-3.5 mr-1 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ order.deliveryMethod === 'courier' ? 'Konfirmasi Terkirim' : 'Selesaikan (Sudah Diambil)' }}
            </BaseButton>

            <!-- Status: Selesai -->
            <span v-else-if="order.status === 'Selesai'" class="text-xs text-success font-medium flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Pesanan Selesai
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
