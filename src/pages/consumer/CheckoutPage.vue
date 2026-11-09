<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { useNotificationStore } from '@/stores/notifications'
import { useAddressStore } from '@/stores/address'
import { paymentService } from '@/services/paymentService'
import DeliveryMethodSelector from '@/components/order/DeliveryMethodSelector.vue'
import FormInput from '@/components/base/FormInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const orders = useOrdersStore()
const notify = useNotificationStore()
const addressStore = useAddressStore()

const deliveryMethod = ref('pickup')
const specialNote = ref('')
const isSubmitting = ref(false)

// Opsi pembayaran Midtrans
const paymentOptions = [
  {
    id: 'snap',
    label: 'Semua Metode Pembayaran (Midtrans Snap)',
    desc: 'QRIS (GoPay, ShopeePay, OVO), Virtual Account BCA/BNI/BRI/Mandiri, Kartu Kredit/Debit'
  },
]
const selectedPayment = ref('snap')

const deliveryFee = computed(() => deliveryMethod.value === 'courier' ? 8000 : 0)
const total = computed(() => cart.subtotal + deliveryFee.value)

// Alamat default dari store
const deliveryAddress = computed(() => addressStore.defaultAddress)

const canPlaceOrder = computed(() => {
  if (deliveryMethod.value === 'courier' && !deliveryAddress.value) return false
  return cart.items.length > 0
})

function formatPrice(p) {
  return 'Rp ' + Number(p || 0).toLocaleString('id-ID')
}

async function handlePayNow() {
  if (cart.items.length === 0) {
    notify.error('Keranjang belanja kosong')
    return
  }

  // Validasi: 1 pesanan dibatasi dari 1 supplier
  const uniqueSuppliers = new Set(cart.items.map(i => i.supplierId).filter(Boolean))
  if (uniqueSuppliers.size > 1) {
    notify.error('Keranjang hanya boleh berisi produk dari satu toko. Silakan sesuaikan isi keranjang Anda.')
    return
  }

  if (deliveryMethod.value === 'courier' && !deliveryAddress.value) {
    notify.error('Tambahkan alamat pengantaran di profil terlebih dahulu')
    router.push('/alamat/baru?from=checkout')
    return
  }

  isSubmitting.value = true
  try {
    const formattedAddress = deliveryAddress.value
      ? `${deliveryAddress.value.streetDetail || ''}, ${deliveryAddress.value.district || ''}, ${deliveryAddress.value.city || ''}, ${deliveryAddress.value.province || ''} ${deliveryAddress.value.postalCode || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
      : ''

    // 1. Siapkan payload order sesuai kontrak API backend Express POST /purchase
    const orderPayload = {
      items: cart.items.map(item => ({
        productId: item.foodId,
        quantity: item.quantity,
      })),
      delivery_method: deliveryMethod.value,
      delivery_address: deliveryMethod.value === 'courier' ? formattedAddress : '',
      delivery_fee: deliveryFee.value,
      special_note: specialNote.value || '',
    }

    // 2. Buat order di backend (sekaligus generate Snap Token di Midtrans)
    notify.info('Membuat pesanan & menyiapkan pembayaran Midtrans...')
    const newOrder = await orders.placeOrder(orderPayload)

    if (!newOrder) {
      throw new Error('Gagal mendapatkan data pesanan dari server')
    }

    const snapToken = newOrder.snapToken || newOrder.snap_token

    // 3. Jika Snap Token berhasil didapat, luncurkan Midtrans Snap Popup
    if (snapToken) {
      try {
        const { status, result } = await paymentService.payWithSnap(snapToken)

        if (status === 'success') {
          // Sinkronkan status pembayaran terkini ke backend
          try {
            await orders.checkStatus(newOrder.id)
          } catch (_) {}

          cart.clear()
          notify.success('Pembayaran berhasil!')
          router.push({
            name: 'PaymentResult',
            query: {
              status: 'success',
              orderId: newOrder.id,
              transactionId: result?.transaction_id || '',
            }
          })
          return
        } else if (status === 'pending') {
          try {
            await orders.checkStatus(newOrder.id)
          } catch (_) {}

          cart.clear()
          notify.info('Menunggu penyelesaian pembayaran...')
          router.push({
            name: 'PaymentResult',
            query: {
              status: 'pending',
              orderId: newOrder.id,
              transactionId: result?.transaction_id || '',
            }
          })
          return
        } else if (status === 'closed') {
          cart.clear()
          notify.info('Popup pembayaran ditutup. Anda dapat melanjutkan pembayaran nanti dari menu Pesanan.')
          router.push(`/pesanan/${newOrder.id}`)
          return
        } else {
          notify.error('Pembayaran tidak berhasil diselesaikan')
          router.push({
            name: 'PaymentResult',
            query: {
              status: 'failed',
              orderId: newOrder.id,
              transactionId: result?.transaction_id || '',
            }
          })
          return
        }
      } catch (snapErr) {
        console.warn('Gagal membuka Snap Popup:', snapErr)
        // Fallback: Jika popup diblokir browser atau Snap.js error, buka payment_url Midtrans jika tersedia
        if (newOrder.paymentUrl || newOrder.payment_url) {
          cart.clear()
          window.location.href = newOrder.paymentUrl || newOrder.payment_url
          return
        }
        throw snapErr
      }
    } else if (newOrder.paymentUrl || newOrder.payment_url) {
      // Fallback jika backend hanya mengembalikan payment URL
      cart.clear()
      window.location.href = newOrder.paymentUrl || newOrder.payment_url
    } else {
      // Pesanan berhasil dibuat tanpa snap token
      cart.clear()
      router.push(`/pesanan/${newOrder.id}`)
    }
  } catch (e) {
    console.error('Error saat checkout:', e)
    notify.error(e.message || 'Gagal memproses pembayaran')
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
        <!-- Informasi Toko/Supplier -->
        <div v-if="cart.currentSupplierName" class="bg-primary-soft/50 border border-primary/20 rounded-md p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-text-secondary">Pesanan dari Outlet:</p>
            <p class="font-semibold text-sm text-primary-dark">{{ cart.currentSupplierName }}</p>
          </div>
          <span class="text-xs text-text-secondary bg-white px-2.5 py-1 rounded-full border border-border">
            1 Toko per Checkout
          </span>
        </div>

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

          <!-- Alamat pengantaran (courier) — kartu dari store -->
          <div v-if="deliveryMethod === 'courier'" class="mt-4 space-y-3 animate-fade-in">
            <label class="block text-sm font-medium text-text-primary">Alamat Pengantaran</label>

            <!-- Ada alamat default -->
            <button
              v-if="deliveryAddress"
              type="button"
              @click="router.push('/alamat?from=checkout')"
              class="w-full text-left p-4 rounded-lg border border-primary bg-primary-soft hover:bg-primary/10 transition-colors group"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="font-semibold text-sm text-primary">{{ deliveryAddress.recipientName }}</p>
                    <span v-if="deliveryAddress.label" class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {{ deliveryAddress.label }}
                    </span>
                    <span class="chip bg-primary text-white text-xs font-semibold">Utama</span>
                  </div>
                  <p class="text-xs text-text-secondary">{{ deliveryAddress.phone }}</p>
                  <p class="text-sm text-text-secondary mt-1 leading-relaxed">
                    {{ deliveryAddress.streetDetail }},
                    {{ deliveryAddress.district }},
                    {{ deliveryAddress.city }},
                    {{ deliveryAddress.province }}
                    {{ deliveryAddress.postalCode }}
                  </p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0 text-primary">
                  <span class="text-xs font-medium">Ubah</span>
                  <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </button>

            <!-- Belum ada alamat -->
            <div v-else class="p-4 rounded-lg border-2 border-dashed border-border text-center">
              <p class="text-sm text-text-secondary mb-2">Belum ada alamat tersimpan</p>
              <button
                type="button"
                @click="router.push('/alamat/baru?from=checkout')"
                class="text-sm text-primary font-medium hover:underline"
              >
                + Tambah Alamat Pengantaran
              </button>
            </div>

            <FormInput v-model="specialNote" label="Catatan Khusus (opsional)" type="textarea" placeholder="Misal: taruh di meja depan, jangan bel..." />
          </div>
        </div>

        <!-- Metode Pembayaran -->
        <div class="bg-surface rounded-md border border-border p-5">
          <h2 class="font-semibold text-sm text-text-primary mb-3">Metode Pembayaran</h2>
          <div class="space-y-2">
            <div
              v-for="opt in paymentOptions"
              :key="opt.id"
              @click="selectedPayment = opt.id"
              :class="[
                'p-4 rounded-lg border-2 cursor-pointer transition-all',
                selectedPayment === opt.id ? 'border-primary bg-primary-soft' : 'border-border hover:border-primary/40'
              ]"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center', selectedPayment === opt.id ? 'border-primary' : 'border-border']">
                  <span v-if="selectedPayment === opt.id" class="w-2 h-2 rounded-full bg-primary"></span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-text-primary">{{ opt.label }}</p>
                  <p class="text-xs text-text-secondary mt-0.5">{{ opt.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          <p class="text-xs text-text-secondary mt-3 flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Pembayaran diproses secara aman melalui Midtrans Payment Gateway
          </p>
        </div>

        <!-- Rincian Pembayaran -->
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
        </div>

        <BaseButton
          variant="primary"
          full-width
          size="lg"
          @click="handlePayNow"
          :loading="isSubmitting"
          :disabled="!canPlaceOrder || isSubmitting"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          Bayar Sekarang — {{ formatPrice(total) }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
