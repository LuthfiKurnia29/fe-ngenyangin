<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { foodService } from '@/services/foodService'
import { categoryService } from '@/services/categoryService'
import FoodCard from '@/components/food/FoodCard.vue'

const route = useRoute()
const router = useRouter()

// ── State ────────────────────────────────────────────────
const isLoading = ref(true)
const loadError = ref('')
const foods = ref([])
const total = ref(0)
const totalPages = ref(1)

const PAGE_SIZE = 24

const page = ref(Number(route.query.page) || 1)
const activeCategory = ref(route.query.category || '')
const searchQuery = ref(route.query.q || '')
const discountOnly = ref(route.query.discount === '1')

// Debounce timer ref
let debounceTimer = null

// ── Categories ────────────────────────────────────────────
const loadedCategories = ref([])
const defaultCategories = [
  'Makanan Berat',
  'Jajanan',
  'Roti & Kue',
  'Minuman',
  'Sayur & Buah'
]

async function loadCategories() {
  try {
    const res = await categoryService.getAll()
    const list = Array.isArray(res) ? res : (res?.items || [])
    if (list.length > 0) {
      loadedCategories.value = list.map(item => {
        if (typeof item === 'string') return { id: item, name: item }
        return { id: item.id ?? item.name, name: item.name ?? item.id }
      })
      return
    }
  } catch (err) {
    console.warn('Gagal memuat kategori dari backend, menggunakan kategori bawaan:', err)
  }
  loadedCategories.value = defaultCategories.map(c => ({ id: c, name: c }))
}

const categories = computed(() => [
  { id: '', name: 'Semua' },
  ...loadedCategories.value,
])

// ── Load data dari Backend ─────────────────────────────────
async function loadPage(opts = {}) {
  isLoading.value = true
  loadError.value = ''
  try {
    const currentPage = opts.page ?? page.value
    const currentCategory = opts.category !== undefined ? opts.category : activeCategory.value
    const currentSearch = opts.search !== undefined ? opts.search : searchQuery.value
    const currentDiscount = opts.discountOnly !== undefined ? opts.discountOnly : discountOnly.value

    const params = {
      page: currentPage,
      limit: PAGE_SIZE,
      pageSize: PAGE_SIZE,
    }

    if (currentSearch && currentSearch.trim()) {
      params.search = currentSearch.trim()
    }

    if (currentCategory) {
      params.category = currentCategory
      if (!isNaN(Number(currentCategory))) {
        params.category_id = Number(currentCategory)
      }
    }

    if (currentDiscount) {
      params.discount = '1'
      params.has_discount = true
    }

    const result = await foodService.getPaginated(params)

    let items = result.items || []

    // Filter tambahan client-side jika backend tidak memfilter semua parameter:
    if (currentCategory) {
      const matchCat = (f) =>
        String(f.category).toLowerCase() === String(currentCategory).toLowerCase() ||
        String(f.categoryId) === String(currentCategory)
      // Jika backend belum memfilter kategori
      if (!items.every(matchCat)) {
        items = items.filter(matchCat)
      }
    }
    if (currentSearch && currentSearch.trim()) {
      const q = currentSearch.trim().toLowerCase()
      if (!items.every(f => f.name?.toLowerCase().includes(q) || f.supplierName?.toLowerCase().includes(q))) {
        items = items.filter(f =>
          f.name?.toLowerCase().includes(q) ||
          f.supplierName?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q)
        )
      }
    }
    if (currentDiscount) {
      if (!items.every(f => (f.discount || 0) > 0)) {
        items = items.filter(f => (f.discount || 0) > 0)
      }
    }

    foods.value = items
    total.value = result.total || items.length
    totalPages.value = Math.max(1, result.totalPages || Math.ceil((result.total || items.length) / PAGE_SIZE))
    page.value = currentPage
  } catch (e) {
    console.error('Gagal memuat produk dari backend:', e)
    loadError.value = e.response?.data?.message || e.message || 'Gagal memuat data dari server'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadPage()
})

// ── Sync URL params → reload ───────────────────────────────
function syncAndLoad(newPage = 1) {
  page.value = newPage
  router.replace({
    query: {
      ...(activeCategory.value ? { category: activeCategory.value } : {}),
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
      ...(discountOnly.value ? { discount: '1' } : {}),
      ...(newPage > 1 ? { page: newPage } : {}),
    }
  })
  loadPage({ page: newPage })
}

// Category chip click
function selectCategory(cat) {
  activeCategory.value = cat.id
  syncAndLoad(1)
}

// Discount toggle
function toggleDiscount() {
  discountOnly.value = !discountOnly.value
  syncAndLoad(1)
}

// Debounced search (300ms)
watch(searchQuery, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => syncAndLoad(1), 300)
})

// Pagination
function goToPage(p) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  syncAndLoad(p)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Smart page number list ────────────────────────────────
const pageNumbers = computed(() => {
  const p = page.value
  const t = totalPages.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const pages = new Set([1, t, p])
  if (p > 1) pages.add(p - 1)
  if (p < t) pages.add(p + 1)
  if (p > 2) pages.add(p - 2)
  if (p < t - 1) pages.add(p + 2)
  return [...pages].sort((a, b) => a - b)
})

const activeCategoryLabel = computed(() =>
  categories.value.find(c => c.id === activeCategory.value)?.name || 'Semua'
)
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Jelajahi Makanan Surplus 🍽️</h1>
        <p class="text-text-secondary mt-1">Temukan surplus makanan segar terdekat dari mitra UMKM kuliner dengan diskon terbaik</p>
      </div>

      <!-- Search + Discount filter row -->
      <div class="mb-5 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1 max-w-xl">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari makanan, outlet, atau supplier..."
            class="form-input-base pl-12 w-full"
          />
        </div>

        <!-- Diskon toggle -->
        <button
          @click="toggleDiscount"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-all whitespace-nowrap cursor-pointer',
            discountOnly
              ? 'bg-accent text-white border-accent shadow-sm'
              : 'bg-surface border-border text-text-secondary hover:border-primary/40 hover:text-primary'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M17 17h.01M7 7l10 10M17 7L7 17"/>
          </svg>
          Ada Diskon
        </button>
      </div>

      <!-- Category chips — horizontally scrollable -->
      <div class="mb-6 overflow-x-auto -mx-4 px-4 pb-1" style="scrollbar-width: none; -ms-overflow-style: none;">
        <div class="flex gap-2 w-max">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectCategory(cat)"
            :class="[
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer',
              activeCategory === cat.id
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface border-border text-text-secondary hover:border-primary/40 hover:text-primary'
            ]"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Results summary -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-text-secondary">
          <span v-if="isLoading">Memuat katalog makanan dari server...</span>
          <span v-else>
            Menampilkan
            <strong class="text-text-primary">{{ foods.length }}</strong>
            dari
            <strong class="text-text-primary">{{ total.toLocaleString('id-ID') }}</strong>
            makanan
            <span v-if="activeCategory">&nbsp;di "<strong class="text-primary">{{ activeCategoryLabel }}</strong>"</span>
            <span v-if="discountOnly"> · <span class="text-accent font-medium">ada diskon</span></span>
          </span>
        </p>
        <span v-if="!isLoading && totalPages > 1" class="text-xs text-text-secondary">
          Hal. {{ page }} / {{ totalPages }}
        </span>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-surface rounded-md border border-border animate-pulse overflow-hidden">
          <div class="h-44 bg-border/30 rounded-t-md"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-border/30 rounded w-20"></div>
            <div class="h-5 bg-border/30 rounded w-full"></div>
            <div class="h-3 bg-border/30 rounded w-32"></div>
            <div class="h-6 bg-border/30 rounded w-24"></div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="loadError" class="text-center py-16 bg-surface rounded-xl border border-border/60 p-8 max-w-lg mx-auto">
        <p class="text-4xl mb-4">⚠️</p>
        <p class="text-text-primary font-semibold text-lg">Gagal memuat produk dari server</p>
        <p class="text-text-secondary text-sm mt-1 mb-5">{{ loadError }}</p>
        <button
          @click="loadPage()"
          class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer shadow-sm"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="foods.length === 0" class="text-center py-16 bg-surface rounded-xl border border-border/60 p-8 max-w-lg mx-auto">
        <p class="text-4xl mb-4">🍃</p>
        <p class="text-text-primary font-semibold text-lg">Tidak ada makanan ditemukan</p>
        <p class="text-text-secondary text-sm mt-1 mb-5">Coba kata kunci atau kategori lain</p>
        <button
          v-if="searchQuery || activeCategory || discountOnly"
          @click="() => { searchQuery = ''; activeCategory = ''; discountOnly = false; syncAndLoad(1) }"
          class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer shadow-sm"
        >
          Reset Filter
        </button>
      </div>

      <!-- Food grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FoodCard v-for="food in foods" :key="food.id" :food="food" />
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && totalPages > 1" class="mt-10 flex items-center justify-center gap-1 flex-wrap">
        <button
          @click="goToPage(page - 1)"
          :disabled="page <= 1"
          class="px-3 py-2 rounded-md border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          ‹ Sebelumnya
        </button>

        <template v-for="(p, idx) in pageNumbers" :key="p">
          <span
            v-if="idx > 0 && p - pageNumbers[idx - 1] > 1"
            class="px-2 py-2 text-text-secondary text-sm"
          >…</span>
          <button
            @click="goToPage(p)"
            :class="[
              'w-9 h-9 rounded-md border text-sm font-medium transition-all cursor-pointer',
              p === page
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'border-border text-text-secondary hover:border-primary hover:text-primary'
            ]"
          >{{ p }}</button>
        </template>

        <button
          @click="goToPage(page + 1)"
          :disabled="page >= totalPages"
          class="px-3 py-2 rounded-md border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Selanjutnya ›
        </button>
      </div>

    </div>
  </div>
</template>
