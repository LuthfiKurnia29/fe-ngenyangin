<script setup>
import { ref, onMounted, computed } from 'vue'
import { foodService } from '@/services/foodService'
import { categoryService } from '@/services/categoryService'
import FoodCard from '@/components/food/FoodCard.vue'
import CategoryTile from '@/components/food/CategoryTile.vue'

const foods = ref([])
const isLoading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const activeCategory = ref('all')
const categories = ref([])

onMounted(async () => {
  try {
    const [allFoods, cats] = await Promise.all([
      foodService.getAll(),
      categoryService.getAll()
    ])
    foods.value = allFoods
    categories.value = [
      { id: 'all', name: 'Semua', image_url: '' },
      ...cats,
    ]
  } catch (e) {
    console.error('Gagal memuat katalog:', e)
    loadError.value = e.response?.data?.message || e.message
  } finally {
    isLoading.value = false
  }
})

const filteredFoods = computed(() => {
  let result = foods.value
  if (activeCategory.value !== 'all') {
    const selectedCategory = categories.value.find((category) => category.id === activeCategory.value)
    result = result.filter(f =>
      String(f.categoryId) === String(activeCategory.value) ||
      f.category === selectedCategory?.name
    )
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.supplierName || '').toLowerCase().includes(q)
    )
  }
  return result
})

const activeCategoryLabel = computed(() =>
  categories.value.find((category) => category.id === activeCategory.value)?.name || 'Semua'
)

function selectCategory(cat) {
  activeCategory.value = cat.id
}
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Jelajahi Makanan Surplus 🍽️</h1>
        <p class="text-text-secondary mt-1">Temukan surplus makanan segar terdekat dengan diskon terbaik</p>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative max-w-xl">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari makanan, outlet, atau supplier..."
            class="form-input-base pl-12"
          />
        </div>
      </div>

      <!-- Categories -->
      <div class="mb-8 overflow-x-auto">
        <div class="flex gap-3 pb-2">
          <CategoryTile
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.name"
            :image="cat.image_url"
            :active="activeCategory === cat.id"
            @click="selectCategory(cat)"
          />
        </div>
      </div>

      <!-- Results info -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-text-secondary">
          Menampilkan <strong class="text-text-primary">{{ filteredFoods.length }}</strong> makanan
          <span v-if="activeCategory !== 'all'"> di "{{ activeCategoryLabel }}"</span>
        </p>
      </div>

      <!-- Loading -->
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

      <!-- Empty state -->
      <div v-else-if="filteredFoods.length === 0" class="text-center py-16">
        <p class="text-4xl mb-4">🍃</p>
        <p class="text-text-primary font-semibold text-lg">{{ loadError ? 'Gagal memuat katalog' : 'Belum ada makanan ditemukan' }}</p>
        <p class="text-text-secondary text-sm mt-1">{{ loadError || 'Coba kata kunci atau kategori lain' }}</p>
      </div>

      <!-- Food grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FoodCard v-for="food in filteredFoods" :key="food.id" :food="food" />
      </div>
    </div>
  </div>
</template>
