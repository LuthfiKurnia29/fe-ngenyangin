<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { siteContentService } from '@/services/siteContentService'
import { useNotificationStore } from '@/stores/notifications'

const policies = ref(siteContentService.getPolicies())
const contact = ref(siteContentService.getContact())
const notify = useNotificationStore()
const isSaving = ref(false)

function save() {
  isSaving.value = true
  try {
    const savedPolicies = siteContentService.savePolicies(policies.value)
    const savedContact = siteContentService.saveContact(contact.value)
    policies.value = savedPolicies
    contact.value = savedContact
    notify.success('Kebijakan dan kontak berhasil diperbarui.')
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
        <h1 class="font-poppins font-bold text-headline text-primary-dark">
          Kelola Kebijakan dan Kontak
        </h1>
        <p class="text-text-secondary mt-1">
          Kelola kebijakan keamanan pangan dan informasi hubungi kami.
        </p>
      </div>

      <BaseButton variant="primary" :loading="isSaving" @click="save">
        {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </BaseButton>
    </div>

    <div class="space-y-6">
      <section class="bg-surface rounded-md border border-border p-5">
        <div class="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 class="font-poppins font-semibold text-lg text-primary-dark">
              Kebijakan Keamanan Pangan
            </h2>
            <p class="text-sm text-text-secondary mt-1">
              Kelola ketentuan berdasarkan peraturan pangan yang berlaku di Indonesia.
            </p>
          </div>
          <BaseButton
            size="sm"
            variant="outline"
            @click="policies.push({
              id: `policy-${Date.now()}`,
              title: '',
              content: '',
              reference: ''
            })"
          >
            + Tambah Kebijakan
          </BaseButton>
        </div>

        <div class="space-y-4">
          <article
            v-for="(item, index) in policies"
            :key="item.id || index"
            class="rounded-md border border-border p-4"
          >
            <div class="flex items-center justify-between gap-3 mb-3">
              <label class="font-semibold text-text-primary">Kebijakan {{ index + 1 }}</label>
              <button
                v-if="policies.length > 1"
                type="button"
                class="text-sm text-error hover:underline"
                @click="policies.splice(index, 1)"
              >
                Hapus
              </button>
            </div>
            <input
              v-model="item.title"
              class="form-input-base mb-3"
              placeholder="Judul kebijakan"
            />
            <textarea
              v-model="item.content"
              rows="4"
              class="form-input-base resize-y mb-3"
              placeholder="Isi kebijakan"
            />
            <input
              v-model="item.reference"
              class="form-input-base"
              placeholder="Dasar hukum atau sumber kebijakan"
            />
          </article>
        </div>
      </section>

      <section class="bg-surface rounded-md border border-border p-5 space-y-3">
        <h2 class="font-poppins font-semibold text-lg text-primary-dark">
          Hubungi Kami
        </h2>

        <input
          v-model="contact.email"
          type="email"
          class="form-input-base w-full"
          placeholder="Email admin"
        />

        <input
          v-model="contact.phone"
          class="form-input-base w-full"
          placeholder="Telepon admin"
        />

        <input
          v-model="contact.hours"
          class="form-input-base w-full"
          placeholder="Jam layanan"
        />

        <textarea
          v-model="contact.message"
          rows="3"
          class="form-input-base resize-y"
          placeholder="Pesan kontak"
        />
      </section>

    </div>
  </div>
</template>