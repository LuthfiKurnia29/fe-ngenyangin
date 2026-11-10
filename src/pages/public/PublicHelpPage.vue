<script setup>
import { computed, onMounted, ref } from 'vue'
import { contentService } from '@/services/contentService'

const policies = ref([])
const contact = ref(null)
const activeAudience = ref('Konsumen')
const isLoading = ref(true)
const errorMessage = ref('')
const filteredPolicies = computed(() => policies.value.filter(
  (policy) => policy.audience === activeAudience.value
))

onMounted(loadContent)

async function loadContent() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [consumer, supplier, contactRecord] = await Promise.all([
      contentService.get('food_policy', 'consumer'),
      contentService.get('food_policy', 'supplier'),
      contentService.get('contact', 'all'),
    ])
    policies.value = [
      ...consumer.content.map((item) => ({ ...item, audience: 'Konsumen' })),
      ...supplier.content.map((item) => ({ ...item, audience: 'Supplier' })),
    ]
    contact.value = contactRecord.content
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-full bg-white py-10 md:py-16">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="font-poppins font-bold text-headline text-primary-dark">
          Bantuan NGENYANGIN
        </h1>

        <p class="text-text-secondary mt-2">
          Kebijakan keamanan pangan dan informasi kontak yang dikelola admin.
        </p>
      </div>

      <p v-if="isLoading" class="text-center text-text-secondary">Memuat informasi bantuan...</p>
      <p v-else-if="errorMessage" class="text-center text-error">{{ errorMessage }}</p>
      <template v-else>
      <div class="flex justify-center gap-2 mb-6">
        <button
          v-for="audience in ['Konsumen', 'Supplier']"
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

      <section
        id="policy"
        class="bg-white border border-slate-200 rounded-md shadow-sm p-6 mb-8 scroll-mt-20"
      >
        <h2 class="font-poppins font-semibold text-lg text-primary-dark mb-4">
          Kebijakan Keamanan Pangan
        </h2>
        <div class="space-y-5">
          <article v-for="(policy, index) in filteredPolicies" :key="`${policy.audience}-${index}`">
            <h3 class="font-semibold text-text-primary">{{ policy.title }}</h3>
            <p class="text-text-secondary leading-relaxed mt-1">{{ policy.content }}</p>
            <p class="text-xs text-text-secondary mt-2">Dasar hukum: {{ policy.reference }}</p>
          </article>
        </div>
      </section>

      <section
        id="contact"
        class="bg-white border border-slate-200 rounded-md shadow-sm p-6 mt-8 scroll-mt-20"
      >
        <h2 class="font-poppins font-semibold text-lg text-primary-dark mb-2">
          Hubungi Kami
        </h2>

        <p class="text-text-secondary mb-4">
          {{ contact?.message }}
        </p>

        <div class="space-y-2 text-text-primary">
          <p>
            Email:
            <a
              :href="`mailto:${contact?.email}`"
              class="text-primary hover:underline"
            >
              {{ contact?.email }}
            </a>
          </p>

          <p>
            Telepon:
            <a
              :href="`tel:${contact?.phone}`"
              class="text-primary hover:underline"
            >
              {{ contact?.phone }}
            </a>
          </p>

          <p>
            Jam layanan: {{ contact?.hours }}
          </p>
        </div>
      </section>
      </template>
    </div>
  </div>
</template>
