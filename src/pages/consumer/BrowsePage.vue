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
const minDiscount = ref(Math.min(100, Math.max(1, Number(route.query.minDiscount) || 1)))
const pickupWithinHours = ref(route.query.pickupWithinHours || '')
const locationQuery = ref(route.query.location || '')

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
      minDiscount: opts.minDiscount ?? minDiscount.value,
      pickupWithinHours: opts.pickupWithinHours ?? (pickupWithinHours.value || null),
      locationQuery: opts.locationQuery ?? locationQuery.value,
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
      minDiscount: String(minDiscount.value),
      ...(pickupWithinHours.value ? { pickupWithinHours: pickupWithinHours.value } : {}),
      ...(locationQuery.value ? { location: locationQuery.value } : {}),
      ...(newPage > 1 ? { page: newPage } : {}),
    }
  })
  loadPage({ page: newPage })
}

function selectCategory(cat) {
  activeCategory.value = cat.id
  syncAndLoad(1)
}

function selectPickupDuration(duration) {
  pickupWithinHours.value = duration
  syncAndLoad(1)
}

function resetFilters() {
  clearTimeout(debounceTimer)
  activeCategory.value = ''
  minDiscount.value = 1
  pickupWithinHours.value = ''
  locationQuery.value = ''
  searchQuery.value = ''
  syncAndLoad(1)
}

// Debounce free-text filters (300ms)
watch([searchQuery, locationQuery], () => {
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

const activeFilterCount = computed(() =>
  Number(Boolean(activeCategory.value)) +
  Number(minDiscount.value > 1) +
  Number(Boolean(pickupWithinHours.value)) +
  Number(Boolean(locationQuery.value.trim())) +
  Number(Boolean(searchQuery.value.trim()))
)
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Jelajahi Makanan Surplus 🍽️</h1>
        <p class="text-text-secondary mt-1">Temukan surplus makanan segar dengan diskon terbaik</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        <aside class="bg-surface rounded-lg border border-border shadow-card p-5 lg:sticky lg:top-24">
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-poppins font-semibold text-base">Filter makanan</h2>
            <button
              v-if="activeFilterCount"
              type="button"
              class="text-xs font-medium text-primary hover:underline"
              @click="resetFilters"
            >
              Reset
            </button>
          </div>

          <label for="food-search" class="block text-xs font-semibold text-text-primary mb-2">Cari makanan</label>
          <div class="relative mb-6">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input id="food-search" v-model="searchQuery" type="search" placeholder="Nama makanan atau outlet" class="form-input-base h-10 pl-9 text-sm" />
          </div>

          <section class="border-t border-border pt-5 mb-5">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold">Diskon minimal</h3>
              <span class="text-sm font-bold text-accent">{{ minDiscount }}%</span>
            </div>
            <input
              v-model.number="minDiscount"
              type="range"
              min="1"
              max="100"
              step="1"
              class="w-full accent-primary cursor-pointer"
              aria-label="Diskon minimal"
              @change="syncAndLoad(1)"
            />
            <div class="flex justify-between text-xs text-text-secondary mt-1">
              <span>1%</span><span>100%</span>
            </div>
          </section>

          <section class="border-t border-border pt-5 mb-5">
            <h3 class="text-sm font-semibold mb-3">Kategori makanan</h3>
            <div class="max-h-56 overflow-y-auto space-y-1 pr-1">
              <button
                v-for="cat in categories"
                :key="cat.id || 'all'"
                type="button"
                :aria-pressed="activeCategory === cat.id"
                @click="selectCategory(cat)"
                :class="[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  activeCategory === cat.id
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                ]"
              >
                {{ cat.name }}
              </button>
            </div>
          </section>

          <section class="border-t border-border pt-5 mb-5">
            <h3 class="text-sm font-semibold mb-3">Batas waktu pengambilan</h3>
            <div class="space-y-2">
              <button
                v-for="duration in [{ label: 'Semua waktu', value: '' }, { label: 'Dalam 1 jam', value: '1' }, { label: 'Dalam 3 jam', value: '3' }, { label: 'Dalam 7 jam', value: '7' }]"
                :key="duration.value || 'any-time'"
                type="button"
                :aria-pressed="pickupWithinHours === duration.value"
                @click="selectPickupDuration(duration.value)"
                class="flex w-full items-center gap-2 text-left text-sm text-text-secondary hover:text-primary"
              >
                <span :class="['w-4 h-4 rounded-full border flex items-center justify-center', pickupWithinHours === duration.value ? 'border-primary' : 'border-border']">
                  <span v-if="pickupWithinHours === duration.value" class="w-2 h-2 rounded-full bg-primary"></span>
                </span>
                {{ duration.label }}
              </button>
            </div>
          </section>

          <section class="border-t border-border pt-5">
            <label for="food-location" class="block text-sm font-semibold mb-2">Daerah / outlet</label>
            <input
              id="food-location"
              v-model="locationQuery"
              type="search"
              placeholder="Contoh: Tebet, Jakarta"
              class="form-input-base h-10 text-sm"
            />
            <p class="text-xs text-text-secondary mt-2">Cari berdasarkan nama daerah atau alamat outlet.</p>
          </section>
        </aside>

        <section class="min-w-0">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-text-secondary" aria-live="polite">
              <span v-if="isLoading">Memuat katalog...</span>
              <span v-else>
                Menampilkan <strong class="text-text-primary">{{ foods.length }}</strong>
                dari <strong class="text-text-primary">{{ total.toLocaleString('id-ID') }}</strong> makanan
                <span v-if="activeCategory">&nbsp;di "<strong class="text-primary">{{ activeCategoryLabel }}</strong>"</span>
              </span>
            </p>
            <span v-if="!isLoading && totalPages > 1" class="text-xs text-text-secondary">
              Hal. {{ page }} / {{ totalPages }}
            </span>
          </div>

          <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <div v-for="i in 6" :key="i" class="bg-surface rounded-md border border-border animate-pulse">
              <div class="aspect-[4/3] bg-border/30 rounded-t-md"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-border/30 rounded w-20"></div>
                <div class="h-5 bg-border/30 rounded w-full"></div>
                <div class="h-3 bg-border/30 rounded w-32"></div>
                <div class="h-6 bg-border/30 rounded w-24"></div>
              </div>
            </div>
          </div>

          <div v-else-if="loadError" class="text-center py-16 bg-surface rounded-lg border border-border">
            <p class="text-4xl mb-4">⚠️</p>
            <p class="text-text-primary font-semibold text-lg">Gagal memuat katalog</p>
            <p class="text-text-secondary text-sm mt-1">{{ loadError }}</p>
            <button @click="loadPage()" class="mt-4 px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors">
              Coba Lagi
            </button>
          </div>

          <div v-else-if="foods.length === 0" class="text-center py-16 bg-surface rounded-lg border border-border">
            <p class="text-4xl mb-4">🍃</p>
            <p class="text-text-primary font-semibold text-lg">Tidak ada makanan ditemukan</p>
            <p class="text-text-secondary text-sm mt-1">Coba ubah kata kunci atau filter yang dipilih.</p>
            <button @click="resetFilters" class="mt-4 px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors">
              Reset Filter
            </button>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <FoodCard v-for="food in foods" :key="food.id" :food="food" />
          </div>

          <div v-if="!isLoading && totalPages > 1" class="mt-10 flex items-center justify-center gap-1 flex-wrap">
            <button
              @click="goToPage(page - 1)"
              :disabled="page <= 1"
              class="px-3 py-2 rounded-md border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ‹ Sebelumnya
            </button>

            <template v-for="(p, idx) in pageNumbers" :key="p">
              <span v-if="idx > 0 && p - pageNumbers[idx - 1] > 1" class="px-2 py-2 text-text-secondary text-sm">…</span>
              <button
                @click="goToPage(p)"
                :class="[
                  'w-9 h-9 rounded-md border text-sm font-medium transition-all',
                  p === page ? 'bg-primary text-white border-primary shadow-sm' : 'border-border text-text-secondary hover:border-primary hover:text-primary'
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
        </section>
      </div>
    </div>
  </div>
</template>
