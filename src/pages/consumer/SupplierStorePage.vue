<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLocalFoods, getLocalSupplier } from '@/services/foodServiceLocal'
import FoodCard from '@/components/food/FoodCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const supplierId = computed(() => route.params.supplierId)

const foods = ref([])
const supplierData = ref(null)
const isLoading = ref(true)
const searchQuery = ref('')
const activeCategory = ref('all')

// Info supplier: local suppliers.json diutamakan, fallback ke data makanan
const supplierInfo = computed(() => {
  if (supplierData.value) return supplierData.value
  const f = foods.value[0]
  if (!f) return null
  return {
    id: supplierId.value,
    name: f.supplierName || 'Toko',
    address: f.outlet || f.address || '',
    photo: null,
    description: f.supplierDescription || 'Supplier makanan surplus berkualitas.',
  }
})

const categories = computed(() => {
  const cats = [...new Set(foods.value.map(f => f.category).filter(Boolean))]
  return ['all', ...cats]
})

const filteredFoods = computed(() => {
  let result = foods.value.filter(f => f.isActive !== false)
  if (activeCategory.value !== 'all') {
    result = result.filter(f => f.category === activeCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(f => f.name.toLowerCase().includes(q))
  }
  return result
})

onMounted(async () => {
  try {
    // Load supplier info + foods in parallel from local data
    const [supplierResult, foodResult] = await Promise.all([
      getLocalSupplier(supplierId.value),
      getLocalFoods({ supplierId: supplierId.value, pageSize: 500 }),
    ])
    supplierData.value = supplierResult
    foods.value = foodResult.items
  } catch (e) {
    console.error('Gagal memuat makanan supplier:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container">
      <!-- Back -->
      <button @click="router.back()" class="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
      </button>

      <!-- Loading -->
      <div v-if="isLoading" class="animate-pulse space-y-6">
        <div class="h-32 bg-border/30 rounded-lg"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="h-64 bg-border/30 rounded-md"></div>
        </div>
      </div>

      <template v-else-if="supplierInfo">
        <!-- Supplier header -->
        <div class="bg-surface rounded-lg border border-border shadow-card p-6 mb-8">
          <div class="flex items-start gap-5">
            <div class="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center flex-shrink-0 text-primary font-poppins font-bold text-2xl">
              {{ supplierInfo.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <h1 class="font-poppins font-bold text-2xl text-primary-dark">{{ supplierInfo.name }}</h1>
              <div v-if="supplierInfo.address" class="flex items-center gap-1.5 text-sm text-text-secondary mt-1">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                </svg>
                {{ supplierInfo.address }}
              </div>
              <p class="text-sm text-text-secondary mt-2 leading-relaxed">{{ supplierInfo.description }}</p>
              <div class="flex items-center gap-2 mt-3">
                <span class="chip bg-primary-soft text-primary text-xs">{{ foods.filter(f => f.isActive !== false).length }} menu aktif</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Search + filter -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <div class="relative flex-1">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari menu..."
              class="form-input-base pl-12"
            />
          </div>
        </div>

        <!-- Category chips -->
        <div class="flex gap-2 overflow-x-auto pb-2 mb-6">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="activeCategory = cat"
            :class="[
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              activeCategory === cat
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface border border-border text-text-secondary hover:border-primary/40 hover:text-primary'
            ]"
          >{{ cat === 'all' ? 'Semua' : cat }}</button>
        </div>

        <!-- Food grid -->
        <div v-if="filteredFoods.length === 0" class="text-center py-16">
          <p class="text-4xl mb-3">🍃</p>
          <p class="font-semibold">Tidak ada menu ditemukan</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FoodCard v-for="food in filteredFoods" :key="food.id" :food="food" />
        </div>
      </template>

      <!-- Toko tidak ditemukan -->
      <div v-else class="text-center py-16">
        <p class="text-4xl mb-3">🏪</p>
        <p class="font-semibold text-lg">Toko tidak ditemukan</p>
        <BaseButton variant="secondary" class="mt-4" @click="router.push('/jelajah')">Kembali Jelajah</BaseButton>
      </div>
    </div>
  </div>
</template>
