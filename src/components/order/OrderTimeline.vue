<script setup>
defineProps({
  steps: { type: Array, required: true },
  // Each step: { step, time, status: 'completed'|'active'|'pending' }
  proofPhoto: { type: String, default: null }
})
</script>

<template>
  <div class="space-y-0">
    <div
      v-for="(step, idx) in steps"
      :key="idx"
      class="relative flex gap-4 pb-6 last:pb-0"
    >
      <!-- Vertical line -->
      <div
        v-if="idx < steps.length - 1"
        :class="[
          'absolute left-4 top-8 bottom-0 w-0.5',
          step.status === 'completed' ? 'bg-success' : 'bg-border'
        ]"
      />

      <!-- Step icon -->
      <div
        :class="[
          'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 z-10',
          step.status === 'completed' && 'bg-success border-success',
          step.status === 'active' && 'bg-white border-info',
          step.status === 'pending' && 'bg-white border-border'
        ]"
      >
        <svg v-if="step.status === 'completed'" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        <div v-else-if="step.status === 'active'" class="w-2.5 h-2.5 rounded-full bg-info animate-pulse-soft" />
        <div v-else class="w-2 h-2 rounded-full bg-border" />
      </div>

      <!-- Step content -->
      <div class="flex-1 pt-0.5">
        <p :class="[
          'font-medium text-sm',
          step.status === 'completed' && 'text-success',
          step.status === 'active' && 'text-info font-semibold',
          step.status === 'pending' && 'text-text-secondary'
        ]">{{ step.step }}</p>
        <p v-if="step.time" class="text-xs text-text-secondary mt-0.5">{{ step.time }}</p>
        <p v-else-if="step.status === 'pending'" class="text-xs text-text-secondary/60 mt-0.5">Menunggu...</p>
      </div>
    </div>

    <!-- Proof photo -->
    <div v-if="proofPhoto" class="mt-4 p-3 bg-primary-soft rounded-md">
      <p class="text-xs font-medium text-primary mb-2">📸 Bukti Pengantaran</p>
      <img :src="proofPhoto" alt="Bukti pengantaran" class="w-full max-w-xs rounded-md" />
    </div>
  </div>
</template>
