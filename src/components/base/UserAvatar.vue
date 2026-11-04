<script setup>
// Foto profil. Bila belum ada foto:
//  - supplier  -> ikon toko
//  - konsumen  -> ikon sesuai jenis kelamin (male / female), netral bila belum diisi
import { computed, ref, watch } from 'vue'

const props = defineProps({
  avatar: { type: String, default: '' },
  role: { type: String, default: 'consumer' },
  gender: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: 'w-10 h-10' },
})

const broken = ref(false)
watch(() => props.avatar, () => { broken.value = false })

const showPhoto = computed(() => !!props.avatar && !broken.value)
const kind = computed(() => {
  if (props.role === 'supplier') return 'store'
  if (props.gender === 'male') return 'male'
  if (props.gender === 'female') return 'female'
  return 'neutral'
})
</script>

<template>
  <span :class="['inline-block rounded-full overflow-hidden flex-shrink-0 bg-primary-soft', size]">
    <img
      v-if="showPhoto"
      :src="avatar"
      :alt="name"
      class="w-full h-full object-cover"
      @error="broken = true"
    />

    <!-- Supplier: ikon toko -->
    <svg v-else-if="kind === 'store'" viewBox="0 0 64 64" class="w-full h-full" role="img" aria-label="Ikon toko">
      <rect width="64" height="64" fill="#E8F0EA" />
      <path d="M14 27l3-11h30l3 11z" fill="#0F6B3A" />
      <path d="M14 27c0 3 2.5 5 5.3 5s5.3-2 5.3-5c0 3 2.5 5 5.4 5s5.4-2 5.4-5c0 3 2.5 5 5.4 5s5.3-2 5.3-5z" fill="#34A56B" />
      <rect x="17" y="33" width="30" height="16" fill="#fff" />
      <rect x="21" y="37" width="11" height="12" fill="#0F6B3A" />
      <rect x="35" y="37" width="8" height="7" fill="#BFE0CB" />
      <rect x="13" y="49" width="38" height="3" rx="1.5" fill="#0F6B3A" />
    </svg>

    <!-- Konsumen laki-laki -->
    <svg v-else-if="kind === 'male'" viewBox="0 0 64 64" class="w-full h-full" role="img" aria-label="Ikon laki-laki">
      <rect width="64" height="64" fill="#DBEAFE" />
      <path d="M10 64c0-12 10-19 22-19s22 7 22 19z" fill="#3B82F6" />
      <rect x="28" y="38" width="8" height="9" fill="#F2C9A0" />
      <circle cx="32" cy="27" r="11" fill="#F8D7B4" />
      <path d="M20.5 26c-1-9 5-14 11.5-14s12.5 5 11.5 14c-1.5-4-4-6.5-7-7.5-4 2-9 2.5-16 7.5z" fill="#374151" />
    </svg>

    <!-- Konsumen perempuan -->
    <svg v-else-if="kind === 'female'" viewBox="0 0 64 64" class="w-full h-full" role="img" aria-label="Ikon perempuan">
      <rect width="64" height="64" fill="#FCE7F3" />
      <path d="M17 30c0-11 6-18 15-18s15 7 15 18v17c0 2-2 3-4 3H21c-2 0-4-1-4-3z" fill="#4B2E2A" />
      <path d="M10 64c0-12 10-19 22-19s22 7 22 19z" fill="#EC4899" />
      <rect x="28" y="38" width="8" height="9" fill="#F2C9A0" />
      <circle cx="32" cy="28" r="10.5" fill="#F8D7B4" />
      <path d="M21 27c.5-8 5-12 11-12s10.500 4 11 12c-4-2.500-8-4.500-11-8-3 3.500-7 5.500-11 8z" fill="#4B2E2A" />
    </svg>

    <!-- Belum memilih jenis kelamin -->
    <svg v-else viewBox="0 0 64 64" class="w-full h-full" role="img" aria-label="Ikon pengguna">
      <rect width="64" height="64" fill="#E5E7EB" />
      <path d="M10 64c0-12 10-19 22-19s22 7 22 19z" fill="#9CA3AF" />
      <circle cx="32" cy="27" r="11" fill="#D1D5DB" />
    </svg>
  </span>
</template>
