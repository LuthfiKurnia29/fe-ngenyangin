<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLocalFoods, LOCAL_CATEGORIES } from '@/services/foodServiceLocal'
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
const categories = computed(() => [
  { id: '', name: 'Semua' },
  ...LOCAL_CATEGORIES.map(c => ({ id: c, name: c })),
])

// ── Load data ─────────────────────────────────────────────
async function loadPage(opts = {}) {
  isLoading.value = true
  loadError.value = ''
  try {
    const result = await getLocalFoods({
      page: opts.page ?? page.value,
      pageSize: PAGE_SIZE,
      category: opts.category ?? activeCategory.value,
      search: opts.search ?? searchQuery.value,
      discountOnly: opts.discountOnly ?? discountOnly.value,
    })
    foods.value = result.items
    total.value = result.total
    totalPages.value = result.totalPages
    page.value = result.page
  } catch (e) {
    console.error('Gagal memuat katalog:', e)
    loadError.value = e.message || 'Gagal memuat data'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadPage())

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
        <p class="text-text-secondary mt-1">Temukan surplus makanan segar terdekat dengan diskon terbaik</p>
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
            'flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-all whitespace-nowrap',
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
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
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
          <span v-if="isLoading">Memuat katalog...</span>
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
        <div v-for="i in 8" :key="i" class="bg-surface rounded-md border border-border animate-pulse">
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
      <div v-else-if="loadError" class="text-center py-16">
        <p class="text-4xl mb-4">⚠️</p>
        <p class="text-text-primary font-semibold text-lg">Gagal memuat katalog</p>
        <p class="text-text-secondary text-sm mt-1">{{ loadError }}</p>
        <button @click="loadPage()" class="mt-4 px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors">
          Coba Lagi
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="foods.length === 0" class="text-center py-16">
        <p class="text-4xl mb-4">🍃</p>
        <p class="text-text-primary font-semibold text-lg">Tidak ada makanan ditemukan</p>
        <p class="text-text-secondary text-sm mt-1">Coba kata kunci atau kategori lain</p>
        <button
          v-if="searchQuery || activeCategory || discountOnly"
          @click="() => { searchQuery = ''; activeCategory = ''; discountOnly = false; syncAndLoad(1) }"
          class="mt-4 px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors"
        >
          Reset Filter
        </button>
      </div>

      <!-- Food grid (max 24 cards at once) -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FoodCard v-for="food in foods" :key="food.id" :food="food" />
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && totalPages > 1" class="mt-10 flex items-center justify-center gap-1 flex-wrap">
        <button
          @click="goToPage(page - 1)"
          :disabled="page <= 1"
          class="px-3 py-2 rounded-md border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
              'w-9 h-9 rounded-md border text-sm font-medium transition-all',
              p === page
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'border-border text-text-secondary hover:border-primary hover:text-primary'
            ]"
          >{{ p }}</button>
        </template>

        <button
          @click="goToPage(page + 1)"
          :disabled="page >= totalPages"
          class="px-3 py-2 rounded-md border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Selanjutnya ›
        </button>
      </div>

    </div>
  </div>
</template>
