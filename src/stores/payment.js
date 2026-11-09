import { defineStore } from 'pinia'
import { ref } from 'vue'

// Status pembayaran: 'idle' | 'processing' | 'success' | 'pending' | 'failed' | 'closed'
export const usePaymentStore = defineStore('payment', () => {
  const status = ref('idle')
  const transactionId = ref(null)
  const paymentMethod = ref(null)
  const paymentTime = ref(null)
  const errorMessage = ref(null)

  function setResult({ paymentStatus, txId, method, time, errMsg }) {
    status.value = paymentStatus
    transactionId.value = txId || null
    paymentMethod.value = method || null
    paymentTime.value = time || null
    errorMessage.value = errMsg || null
  }

  function reset() {
    status.value = 'idle'
    transactionId.value = null
    paymentMethod.value = null
    paymentTime.value = null
    errorMessage.value = null
  }

  // Label status pembayaran untuk badge
  function getPaymentStatusLabel(paymentStatus) {
    const map = {
      success: 'Lunas',
      pending: 'Menunggu Pembayaran',
      failed: 'Gagal',
      cancelled: 'Dibatalkan',
    }
    return map[paymentStatus] || paymentStatus
  }

  return { status, transactionId, paymentMethod, paymentTime, errorMessage, setResult, reset, getPaymentStatusLabel }
})
