<script setup>
defineProps({
  label: { type: String, required: true },
  image: { type: String, default: '' },
  active: Boolean,
  emoji: { type: String, default: '🍽️' }
})

defineEmits(['click'])
</script>

<template>
  <button
    @click="$emit('click')"
    :class="[
      'flex flex-col items-center gap-2 p-3 rounded-md border transition-all duration-150 min-w-[80px] hover:-translate-y-0.5',
      active
        ? 'bg-primary-soft border-primary text-primary shadow-sm'
        : 'bg-surface border-border text-text-secondary hover:border-primary/40 hover:shadow-card'
    ]"
    :aria-pressed="active"
    :aria-label="`Kategori ${label}`"
  >
    <span class="text-2xl leading-none">{{ emoji }}</span>
    <span class="text-xs font-medium leading-tight text-center">{{ label }}</span>
  </button>
</template>
