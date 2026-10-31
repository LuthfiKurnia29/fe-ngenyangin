<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: Boolean,
  size: { type: String, default: 'md' }
})

const emit = defineEmits(['update:modelValue'])

function setRating(val) {
  if (!props.readonly) emit('update:modelValue', val)
}
</script>

<template>
  <div class="flex items-center gap-1" role="group" aria-label="Rating bintang">
    <button
      v-for="star in 5"
      :key="star"
      @click="setRating(star)"
      :disabled="readonly"
      :aria-label="`${star} bintang`"
      :class="[
        'transition-transform',
        !readonly && 'hover:scale-110 cursor-pointer',
        readonly && 'cursor-default',
        size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
      ]"
    >
      <svg
        :class="[
          size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6',
          star <= modelValue ? 'text-warning' : 'text-border'
        ]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    </button>
    <span v-if="!readonly && modelValue > 0" class="text-sm text-text-secondary ml-1">
      {{ modelValue }}/5
    </span>
  </div>
</template>
