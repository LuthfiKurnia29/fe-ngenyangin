<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { contentService } from '@/services/contentService'

const route = useRoute()
const router = useRouter()
const audience = ref(route.query.audience === 'supplier' ? 'supplier' : 'consumer')
const sections = ref([])
const version = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

watch(
  () => route.query.audience,
  (value) => {
    audience.value = value === 'supplier' ? 'supplier' : 'consumer'
  },
  { immediate: true }
)

watch(audience, loadTerms, { immediate: true })

async function loadTerms() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const record = await contentService.get('terms', audience.value)
    sections.value = record.content
    version.value = record.version
  } catch (error) {
    sections.value = []
    version.value = null
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

function selectAudience(value) {
  router.replace({ query: { ...route.query, audience: value } })
}
</script>

<template>
  <div class="min-h-full bg-white py-8 md:py-12">
    <div class="max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-10">
      <h1 class="font-poppins font-bold text-headline text-primary-dark">Syarat & Ketentuan NGENYANGIN</h1>
      <p class="text-text-secondary mt-2 mb-6">
        Ketentuan untuk {{ audience === 'consumer' ? 'konsumen' : 'supplier' }}.
      </p>

      <div class="flex gap-2 mb-6">
        <button
          v-for="option in [{ value: 'consumer', label: 'Konsumen' }, { value: 'supplier', label: 'Supplier' }]"
          :key="option.value"
          type="button"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
            audience === option.value ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border'
          ]"
          @click="selectAudience(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <p v-if="isLoading" class="text-text-secondary">Memuat syarat dan ketentuan...</p>
      <p v-else-if="errorMessage" class="text-error">{{ errorMessage }}</p>
      <div v-else class="space-y-6">
        <article v-for="(section, index) in sections" :key="index">
          <h2 class="font-poppins font-semibold text-lg text-primary-dark">
            {{ index + 1 }}. {{ section.title }}
          </h2>
          <p class="text-text-primary leading-relaxed mt-2">{{ section.content }}</p>
        </article>
        <p v-if="version" class="text-xs text-text-secondary">Versi {{ version }}</p>
      </div>
    </div>
  </div>
</template>
