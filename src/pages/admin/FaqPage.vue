<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { siteContentService } from '@/services/siteContentService'
import { useNotificationStore } from '@/stores/notifications'

const faq = ref(siteContentService.getFaq())
const notify = useNotificationStore()
const isSaving = ref(false)

function addFaq() {
  faq.value.push({
    id: `faq-${Date.now()}`,
    audience: 'Konsumen',
    question: '',
    answer: ''
  })
}

function save() {
  isSaving.value = true
  try {
    faq.value = siteContentService.saveFaq(faq.value)
    notify.success('FAQ berhasil diperbarui.')
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
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Kelola FAQ</h1>
        <p class="text-text-secondary mt-1">Pertanyaan dan jawaban ini tampil pada halaman FAQ publik.</p>
      </div>
      <div class="flex gap-2">
        <BaseButton size="sm" variant="outline" @click="addFaq">+ Tambah FAQ</BaseButton>
        <BaseButton variant="primary" :loading="isSaving" @click="save">
          {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </BaseButton>
      </div>
    </div>

    <div class="space-y-4">
      <article
        v-for="(item, index) in faq"
        :key="item.id || index"
        class="bg-surface rounded-md border border-border p-5"
      >
        <div class="flex items-center justify-between mb-3">
          <label class="font-semibold text-text-primary">FAQ {{ index + 1 }}</label>
          <button type="button" class="text-sm text-error hover:underline" @click="faq.splice(index, 1)">
            Hapus
          </button>
        </div>
        <select v-model="item.audience" class="form-select-base mb-3">
          <option value="Konsumen">Konsumen</option>
          <option value="Supplier">Supplier</option>
        </select>
        <input v-model="item.question" class="form-input-base mb-3" placeholder="Pertanyaan" />
        <textarea v-model="item.answer" rows="3" class="form-input-base resize-y" placeholder="Jawaban" />
      </article>
    </div>
  </div>
</template>
