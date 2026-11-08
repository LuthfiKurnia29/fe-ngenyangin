<script setup>
// Komponen logo NGENYANGIN — dipakai di semua tempat (navbar, footer, auth pages)
// Props:
//   variant: 'default' | 'light' — 'light' untuk latar gelap (footer hijau tua)
//   height: tinggi logo dalam Tailwind class (mis. 'h-10', 'h-12')
//   linkTo: bila diisi, logo menjadi RouterLink
const props = defineProps({
  variant: { type: String, default: 'default' }, // 'default' | 'light'
  height: { type: String, default: 'h-10' },      // default diperbesar ke h-10 (40px)
  linkTo: { type: String, default: null },         // bila diisi, logo menjadi RouterLink
})
</script>

<template>
  <component
    :is="linkTo ? 'RouterLink' : 'div'"
    :to="linkTo || undefined"
    class="inline-flex items-center flex-shrink-0"
    :aria-label="linkTo ? 'Beranda NGENYANGIN' : undefined"
  >
    <!--
      ngenyangin_logo.svg: viewBox dipersempit ke area konten (0 0 1360 745)
      Rasio ~1.83:1 (landscape) — logo akan terlihat lebih lebar dan terbaca jelas.
      Versi 'light' pakai filter invert untuk latar gelap (footer hijau tua).
    -->
    <img
      src="@/assets/ngenyangin_logo.svg"
      alt="NGENYANGIN"
      :class="[height, 'w-auto']"
      :style="variant === 'light' ? 'filter: brightness(0) invert(1);' : ''"
    />
  </component>
</template>
