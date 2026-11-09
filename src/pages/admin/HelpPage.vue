<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import { contentService } from '@/services/contentService'
import { useNotificationStore } from '@/stores/notifications'

const route = useRoute()
const router = useRouter()
const sectionTabs = [
  { id: 'policies', label: 'Kebijakan Keamanan Pangan' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Hubungi Kami' },
]
const activeSection = ref(
  sectionTabs.some((tab) => tab.id === route.query.section) ? route.query.section : 'policies'
)
const policies = ref([])
const faq = ref([])
const contact = ref({ email: '', phone: '', hours: '', message: '' })
const notify = useNotificationStore()
const isSaving = ref(false)
const isLoading = ref(true)

onMounted(loadContent)

function selectSection(section) {
  activeSection.value = section
  router.replace({ query: { ...route.query, section } })
}

async function loadContent() {
  isLoading.value = true
  try {
    const [consumerPolicy, supplierPolicy, consumerFaq, supplierFaq, contactRecord] = await Promise.all([
      contentService.get('food_policy', 'consumer'),
      contentService.get('food_policy', 'supplier'),
      contentService.get('faq', 'consumer'),
      contentService.get('faq', 'supplier'),
      contentService.get('contact', 'all'),
    ])
    policies.value = [
      ...consumerPolicy.content.map((item) => ({ ...item, audience: 'Konsumen' })),
      ...supplierPolicy.content.map((item) => ({ ...item, audience: 'Supplier' })),
    ]
    faq.value = [
      ...consumerFaq.content.map((item) => ({ ...item, audience: 'Konsumen' })),
      ...supplierFaq.content.map((item) => ({ ...item, audience: 'Supplier' })),
    ]
    contact.value = contactRecord.content
  } catch (error) {
    notify.error(`Konten bantuan belum dapat dimuat: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

function addPolicy() {
  policies.value.push({
    audience: 'Konsumen',
    title: '',
    content: '',
    reference: '',
  })
}

function addFaq() {
  faq.value.push({
    audience: 'Konsumen',
    question: '',
    answer: '',
  })
}

async function save() {
  isSaving.value = true
  try {
    if (activeSection.value === 'policies') {
      await Promise.all(['Konsumen', 'Supplier'].map((audience) => (
        contentService.save(
          'food_policy',
          audience === 'Konsumen' ? 'consumer' : 'supplier',
          policies.value
            .filter((item) => item.audience === audience)
            .map(({ title, content, reference }) => ({ title, content, reference }))
        )
      )))
    } else if (activeSection.value === 'faq') {
      await Promise.all(['Konsumen', 'Supplier'].map((audience) => (
        contentService.save(
          'faq',
          audience === 'Konsumen' ? 'consumer' : 'supplier',
          faq.value
            .filter((item) => item.audience === audience)
            .map(({ question, answer }) => ({ question, answer }))
        )
      )))
    } else {
      await contentService.save('contact', 'all', contact.value)
    }
    notify.success(`${sectionTabs.find((tab) => tab.id === activeSection.value).label} berhasil disimpan.`)
  } catch (error) {
    notify.error(`Perubahan belum disimpan: ${error.message}`)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="section-container py-6 md:py-10">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Pusat Bantuan</h1>
        <p class="text-text-secondary mt-1">
          Kelola informasi bantuan yang ditampilkan kepada konsumen dan supplier.
        </p>
      </div>
      <BaseButton
        variant="primary"
        :loading="isSaving"
        :disabled="isLoading"
        @click="save"
      >
        {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </BaseButton>
    </div>

    <div class="flex flex-wrap gap-2 mb-6 border-b border-border" role="tablist" aria-label="Jenis konten bantuan">
      <button
        v-for="tab in sectionTabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeSection === tab.id"
        :class="[
          'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
          activeSection === tab.id
            ? 'border-primary text-primary'
            : 'border-transparent text-text-secondary hover:text-primary'
        ]"
        @click="selectSection(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="isLoading" class="text-text-secondary">Memuat konten bantuan...</p>

    <section v-else-if="activeSection === 'policies'" role="tabpanel" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="font-poppins font-semibold text-lg text-primary-dark">Kebijakan Keamanan Pangan</h2>
          <p class="text-sm text-text-secondary mt-1">Tambahkan kebijakan khusus konsumen atau supplier.</p>
        </div>
        <BaseButton size="sm" variant="outline" @click="addPolicy">+ Tambah Kebijakan</BaseButton>
      </div>

      <p v-if="policies.length === 0" class="bg-surface rounded-md border border-border p-5 text-text-secondary">
        Belum ada kebijakan. Tambahkan kebijakan untuk mulai mengisi konten.
      </p>
      <article
        v-for="(item, index) in policies"
        :key="index"
        class="bg-surface rounded-md border border-border p-5"
      >
        <div class="flex items-center justify-between gap-3 mb-3">
          <label class="font-semibold text-text-primary">Kebijakan {{ index + 1 }}</label>
          <button type="button" class="text-sm text-error hover:underline" @click="policies.splice(index, 1)">
            Hapus
          </button>
        </div>
        <label class="block text-sm font-medium text-text-primary mb-1">Ditampilkan untuk</label>
        <select v-model="item.audience" class="form-select-base mb-3">
          <option value="Konsumen">Konsumen</option>
          <option value="Supplier">Supplier</option>
        </select>
        <input v-model="item.title" class="form-input-base mb-3" placeholder="Judul kebijakan" />
        <textarea v-model="item.content" rows="4" class="form-input-base resize-y mb-3" placeholder="Isi kebijakan" />
        <input v-model="item.reference" class="form-input-base" placeholder="Dasar hukum atau sumber kebijakan" />
      </article>
    </section>

    <section v-else-if="activeSection === 'faq'" role="tabpanel" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="font-poppins font-semibold text-lg text-primary-dark">Pertanyaan Umum (FAQ)</h2>
          <p class="text-sm text-text-secondary mt-1">Atur pertanyaan dan jawaban untuk setiap jenis pengguna.</p>
        </div>
        <BaseButton size="sm" variant="outline" @click="addFaq">+ Tambah FAQ</BaseButton>
      </div>

      <p v-if="faq.length === 0" class="bg-surface rounded-md border border-border p-5 text-text-secondary">
        Belum ada FAQ. Tambahkan pertanyaan untuk mulai mengisi konten.
      </p>
      <article
        v-for="(item, index) in faq"
        :key="index"
        class="bg-surface rounded-md border border-border p-5"
      >
        <div class="flex items-center justify-between gap-3 mb-3">
          <label class="font-semibold text-text-primary">FAQ {{ index + 1 }}</label>
          <button type="button" class="text-sm text-error hover:underline" @click="faq.splice(index, 1)">
            Hapus
          </button>
        </div>
        <label class="block text-sm font-medium text-text-primary mb-1">Ditampilkan untuk</label>
        <select v-model="item.audience" class="form-select-base mb-3">
          <option value="Konsumen">Konsumen</option>
          <option value="Supplier">Supplier</option>
        </select>
        <input v-model="item.question" class="form-input-base mb-3" placeholder="Pertanyaan" />
        <textarea v-model="item.answer" rows="3" class="form-input-base resize-y" placeholder="Jawaban" />
      </article>
    </section>

    <section v-else role="tabpanel" class="bg-surface rounded-md border border-border p-5 space-y-4">
      <div>
        <h2 class="font-poppins font-semibold text-lg text-primary-dark">Hubungi Kami</h2>
        <p class="text-sm text-text-secondary mt-1">Informasi kontak ini digunakan bersama oleh konsumen dan supplier.</p>
      </div>
      <label class="block text-sm font-medium text-text-primary">
        Email admin
        <input v-model="contact.email" type="email" class="form-input-base w-full mt-1" placeholder="Email admin" />
      </label>
      <label class="block text-sm font-medium text-text-primary">
        Telepon admin
        <input v-model="contact.phone" class="form-input-base w-full mt-1" placeholder="Telepon admin" />
      </label>
      <label class="block text-sm font-medium text-text-primary">
        Jam layanan
        <input v-model="contact.hours" class="form-input-base w-full mt-1" placeholder="Jam layanan" />
      </label>
      <label class="block text-sm font-medium text-text-primary">
        Pesan kontak
        <textarea v-model="contact.message" rows="3" class="form-input-base resize-y w-full mt-1" placeholder="Pesan kontak" />
      </label>
    </section>
  </div>
</template>
