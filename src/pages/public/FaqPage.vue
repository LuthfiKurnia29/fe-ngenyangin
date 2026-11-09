<script setup>
import { ref, computed } from 'vue'
import { siteContentService } from '@/services/siteContentService'

const faq = siteContentService.getFaq()
const activeId = ref(null)
const activeAudience = ref('Semua')
const audiences = ['Semua', 'Konsumen', 'Supplier']

const filteredFaq = computed(() => (
  activeAudience.value === 'Semua'
    ? faq
    : faq.filter((item) => item.audience === activeAudience.value)
))

function toggle(index) {
  activeId.value = activeId.value === index ? null : index
}
</script>

<template>
  <div class="min-h-full bg-white py-10 md:py-16">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="font-poppins font-bold text-headline text-primary-dark">FAQ NGENYANGIN</h1>
        <p class="text-text-secondary mt-2">Pertanyaan umum untuk konsumen dan supplier.</p>
      </div>

      <div class="flex justify-center gap-2 mb-6">
        <button
          v-for="audience in audiences"
          :key="audience"
          type="button"
          @click="activeAudience = audience"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
            activeAudience === audience
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-text-secondary border-slate-200 hover:border-primary'
          ]"
        >
          {{ audience }}
        </button>
      </div>

      <div class="space-y-3">
        <article
          v-for="(item, index) in filteredFaq"
          :key="item.id || item.question"
          class="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden"
        >
          <button
            type="button"
            class="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-medium text-text-primary hover:bg-slate-50"
            @click="toggle(index)"
          >
            <span>{{ index + 1 }}. {{ item.question }}</span>
            <span class="text-primary text-xl leading-none">{{ activeId === index ? '−' : '+' }}</span>
          </button>
          <p v-if="activeId === index" class="px-5 pb-5 text-text-secondary leading-relaxed">
            {{ item.answer }}
          </p>
        </article>
      </div>
    </div>
  </div>
</template>
