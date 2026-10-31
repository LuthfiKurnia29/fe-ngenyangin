<script setup>
defineProps({
  modelValue: { type: String, default: 'pickup' }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Metode pengiriman">
    <!-- Pickup option -->
    <button
      @click="$emit('update:modelValue', 'pickup')"
      :class="[
        'flex items-start gap-4 p-4 rounded-md border-2 text-left transition-all duration-150',
        modelValue === 'pickup'
          ? 'border-primary bg-primary-soft shadow-sm'
          : 'border-border bg-surface hover:border-primary/40'
      ]"
      role="radio"
      :aria-checked="modelValue === 'pickup'"
      aria-label="Ambil di outlet"
    >
      <div :class="['w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0', modelValue === 'pickup' ? 'bg-primary text-white' : 'bg-background text-text-secondary']">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      </div>
      <div>
        <p :class="['font-semibold font-poppins text-sm', modelValue === 'pickup' ? 'text-primary' : 'text-text-primary']">Ambil di Outlet</p>
        <p class="text-xs text-text-secondary mt-0.5 leading-relaxed">Ambil sendiri di lokasi outlet. Tidak ada biaya pengiriman.</p>
        <span class="chip bg-primary-soft text-primary text-xs mt-2">Gratis</span>
      </div>
    </button>

    <!-- Courier option -->
    <button
      @click="$emit('update:modelValue', 'courier')"
      :class="[
        'flex items-start gap-4 p-4 rounded-md border-2 text-left transition-all duration-150',
        modelValue === 'courier'
          ? 'border-primary bg-primary-soft shadow-sm'
          : 'border-border bg-surface hover:border-primary/40'
      ]"
      role="radio"
      :aria-checked="modelValue === 'courier'"
      aria-label="Diantar kurir"
    >
      <div :class="['w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0', modelValue === 'courier' ? 'bg-primary text-white' : 'bg-background text-text-secondary']">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
      </div>
      <div>
        <p :class="['font-semibold font-poppins text-sm', modelValue === 'courier' ? 'text-primary' : 'text-text-primary']">Diantar Kurir</p>
        <p class="text-xs text-text-secondary mt-0.5 leading-relaxed">Kurir rekanan supplier mengantarkan ke alamat kamu.</p>
        <span class="chip bg-accent-soft text-accent text-xs mt-2">+Rp 8.000</span>
      </div>
    </button>
  </div>
</template>
