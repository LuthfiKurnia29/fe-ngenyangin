<script setup>
import { onMounted, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { contentService } from '@/services/contentService'
import { useNotificationStore } from '@/stores/notifications'

const audience = ref('consumer')
const sections = ref([])
const notify = useNotificationStore()
const isLoading = ref(true)
const isSaving = ref(false)

onMounted(loadTerms)
watch(audience, loadTerms)

async function loadTerms() {
  isLoading.value = true
  try {
    const record = await contentService.get('terms', audience.value)
    sections.value = record.content.map((section) => ({ ...section }))
  } catch (error) {
    notify.error(`Syarat dan ketentuan belum dapat dimuat: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

function addSection() {
  sections.value.push({ title: '', content: '' })
}

async function save() {
  isSaving.value = true
  try {
    await contentService.save(
      'terms',
      audience.value,
      sections.value.map(({ title, content }) => ({ title, content }))
    )
    notify.success('Syarat dan ketentuan berhasil diperbarui.')
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
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Kelola Syarat & Ketentuan</h1>
        <p class="text-text-secondary mt-1">Atur ketentuan yang wajib disetujui saat pendaftaran.</p>
      </div>
      <div class="flex gap-2">
        <BaseButton size="sm" variant="outline" :disabled="isLoading" @click="addSection">
          + Tambah Ketentuan
        </BaseButton>
        <BaseButton variant="primary" :loading="isSaving" :disabled="isLoading" @click="save">
          {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </BaseButton>
      </div>
    </div>

    <div class="flex gap-2 mb-5">
      <button
        v-for="option in [{ value: 'consumer', label: 'Konsumen' }, { value: 'supplier', label: 'Supplier' }]"
        :key="option.value"
        type="button"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
          audience === option.value ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border'
        ]"
        @click="audience = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <p v-if="isLoading" class="text-text-secondary">Memuat syarat dan ketentuan...</p>
    <div v-else class="space-y-4">
      <article
        v-for="(section, index) in sections"
        :key="index"
        class="bg-surface rounded-md border border-border p-5"
      >
        <div class="flex items-center justify-between mb-3">
          <label class="font-semibold text-text-primary">Ketentuan {{ index + 1 }}</label>
          <button type="button" class="text-sm text-error hover:underline" @click="sections.splice(index, 1)">
            Hapus
          </button>
        </div>
        <input v-model="section.title" class="form-input-base mb-3" placeholder="Judul ketentuan" />
        <textarea v-model="section.content" rows="4" class="form-input-base resize-y" placeholder="Isi ketentuan" />
      </article>
    </div>
  </div>
</template>
