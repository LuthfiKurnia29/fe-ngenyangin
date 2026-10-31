<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { useNotificationStore } from '@/stores/notifications'
import DeliveryMethodSelector from '@/components/order/DeliveryMethodSelector.vue'
import FormInput from '@/components/base/FormInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const orders = useOrdersStore()
const notify = useNotificationStore()

const deliveryMethod = ref('pickup')
const deliveryAddress = ref('')
const specialNote = ref('')
const isSubmitting = ref(false)

const deliveryFee = computed(() => deliveryMethod.value === 'courier' ? 8000 : 0)
const total = computed(() => cart.subtotal + deliveryFee.value)

function formatPrice(p) { return 'Rp ' + p.toLocaleString('id-ID') }

async function placeOrder() {
  if (deliveryMethod.value === 'courier' && !deliveryAddress.value) {
    notify.error('Alamat pengantaran wajib diisi')
    return
  }
  isSubmitting.value = true
  try {
    for (const item of cart.items) {
      await orders.placeOrder({
        consumerId: auth.user.id,
        consumerName: auth.userName,
        consumerPhone: auth.user.phone || '',
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        foodId: item.foodId,
        foodName: item.name,
        foodImage: item.image,
        quantity: item.quantity,
        originalPrice: item.originalPrice,
        discountPrice: item.discountPrice,
        deliveryMethod: deliveryMethod.value,
        deliveryAddress: deliveryMethod.value === 'courier' ? deliveryAddress.value : null,
        specialNote: specialNote.value || null,
        deliveryFee: deliveryFee.value,
        total: item.discountPrice * item.quantity + deliveryFee.value,
      })
    }
    cart.clear()
    notify.success('Pesanan berhasil dibuat! 🎉')
    router.push('/pesanan')
  } catch (e) {
    notify.error('Gagal membuat pesanan')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container max-w-3xl">
      <button @click="router.back()" class="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
      </button>

      <h1 class="font-poppins font-bold text-headline text-primary-dark mb-6">Checkout</h1>

      <div v-if="cart.items.length === 0" class="text-center py-16 bg-surface rounded-lg border border-border">
        <p class="text-4xl mb-3">🛒</p>
        <p class="font-semibold">Keranjang kosong</p>
        <BaseButton variant="primary" class="mt-4" @click="router.push('/jelajah')">Jelajahi Makanan</BaseButton>
      </div>

      <div v-else class="space-y-6">
        <!-- Items summary -->
        <div class="bg-surface rounded-md border border-border p-5">
          <h2 class="font-semibold text-sm text-text-primary mb-3">Ringkasan Pesanan</h2>
          <div v-for="item in cart.items" :key="item.foodId" class="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <img :src="item.image" :alt="item.name" class="w-12 h-12 rounded object-cover" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ item.name }}</p>
              <p class="text-xs text-text-secondary">{{ item.quantity }}x {{ formatPrice(item.discountPrice) }}</p>
            </div>
            <p class="text-sm font-semibold">{{ formatPrice(item.discountPrice * item.quantity) }}</p>
          </div>
        </div>

        <!-- Delivery Method -->
        <div class="bg-surface rounded-md border border-border p-5">
          <h2 class="font-semibold text-sm text-text-primary mb-3">Metode Penerimaan</h2>
          <DeliveryMethodSelector v-model="deliveryMethod" />

          <!-- Address field (courier) -->
          <div v-if="deliveryMethod === 'courier'" class="mt-4 space-y-3 animate-fade-in">
            <FormInput v-model="deliveryAddress" label="Alamat Pengantaran" placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kota" required />
            <FormInput v-model="specialNote" label="Catatan Khusus (opsional)" type="textarea" placeholder="Misal: taruh di meja depan, jangan bel..." />
          </div>
        </div>

        <!-- Payment summary -->
        <div class="bg-surface rounded-md border border-border p-5">
          <h2 class="font-semibold text-sm text-text-primary mb-3">Rincian Pembayaran</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-text-secondary">Subtotal</span><span>{{ formatPrice(cart.subtotal) }}</span></div>
            <div class="flex justify-between"><span class="text-text-secondary">Ongkir</span><span>{{ deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratis' }}</span></div>
            <div class="border-t border-border pt-2 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span class="price-discount text-lg">{{ formatPrice(total) }}</span>
            </div>
          </div>
          <p class="text-xs text-text-secondary mt-2">Pembayaran: Cashless (simulasi)</p>
        </div>

        <BaseButton variant="primary" full-width size="lg" @click="placeOrder" :loading="isSubmitting">
          Pesan Sekarang — {{ formatPrice(total) }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
