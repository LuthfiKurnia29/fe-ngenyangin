<script setup>
const STATUS_CONFIG = {
  'Menunggu': { label: 'Menunggu', class: 'status-menunggu', dot: '#E0A100' },
  'Diproses': { label: 'Diproses', class: 'status-diproses', dot: '#2F6DB5' },
  'Siap Diambil': { label: 'Siap Diambil', class: 'status-selesai', dot: '#2E8B57' },
  'Dalam Pengantaran': { label: 'Dalam Pengantaran', class: 'status-pengantaran', dot: '#D24F0F' },
  'Selesai': { label: 'Selesai', class: 'status-selesai', dot: '#2E8B57' },
  'Dibatalkan': { label: 'Dibatalkan', class: 'status-dibatalkan', dot: '#C62828' },
  'Pengaduan': { label: 'Pengaduan', class: 'status-dibatalkan', dot: '#C62828' },
  'Sedang Berjalan': { label: 'Sedang Berjalan', class: 'status-pengantaran', dot: '#D24F0F' },
  'Siap Jemput': { label: 'Siap Jemput', class: 'status-diproses', dot: '#2F6DB5' },
  'Terselesaikan': { label: 'Terselesaikan', class: 'status-selesai', dot: '#2E8B57' },
  'Sedang Ditangani': { label: 'Sedang Ditangani', class: 'status-diproses', dot: '#2F6DB5' },
  'Menunggu Resolusi': { label: 'Menunggu Resolusi', class: 'status-menunggu', dot: '#E0A100' },
}

defineProps({
  status: { type: String, required: true },
  size: { type: String, default: 'md' }
})

function getConfig(status) {
  return STATUS_CONFIG[status] || { label: status, class: 'status-menunggu', dot: '#E0A100' }
}
</script>

<template>
  <span
    :class="[
      'chip border font-medium',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
      getConfig(status).class
    ]"
    :aria-label="`Status: ${status}`"
  >
    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: getConfig(status).dot }" />
    {{ getConfig(status).label }}
  </span>
</template>
