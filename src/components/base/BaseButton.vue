<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'ghost', 'danger', 'outline'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: s => ['sm', 'md', 'lg'].includes(s)
  },
  disabled: Boolean,
  loading: Boolean,
  type: { type: String, default: 'button' },
  fullWidth: Boolean
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :class="[
      'inline-flex min-w-28 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold leading-none transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none disabled:cursor-not-allowed disabled:opacity-50',
      // Sizes
      size === 'sm' && 'px-4 h-9 text-sm focus-visible:ring-primary/30',
      size === 'md' && 'px-5 h-11 text-sm focus-visible:ring-primary/30',
      size === 'lg' && 'px-6 h-12 text-base focus-visible:ring-primary/30',
      // Variants
      variant === 'primary' && 'bg-accent text-white hover:bg-accent-dark active:scale-[0.98] focus-visible:ring-accent/30',
      variant === 'secondary' && 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] focus-visible:ring-primary/30',
      variant === 'outline' && 'border border-primary bg-surface text-primary hover:bg-primary-soft active:scale-[0.98] focus-visible:ring-primary/30',
      variant === 'ghost' && 'text-primary hover:bg-primary-soft active:scale-[0.98] focus-visible:ring-primary/30',
      variant === 'danger' && 'bg-error text-white hover:opacity-90 active:scale-[0.98] focus-visible:ring-error/30',
      // Full width
      fullWidth && 'w-full'
    ]"
  >
    <!-- Loading spinner -->
    <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
    <slot />
  </button>
</template>
