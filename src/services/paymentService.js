// paymentService.js
// Lapisan layanan pembayaran dengan Midtrans Snap.
// Di produksi, createTransaction() harus memanggil backend Anda.
// Backend-lah yang memanggil Midtrans Server API menggunakan Server Key (RAHASIA!).
// Hanya Client Key yang boleh ada di front-end.

// TODO: Ganti dengan Client Key Midtrans Anda (dari dashboard Midtrans → Settings → Access Keys)
export const MIDTRANS_CLIENT_KEY = 'SB-Mid-client-XXXXXXXXXXXXXXXX' // sandbox key

// TODO (backend): Endpoint backend untuk membuat transaksi Midtrans
// const BACKEND_CREATE_TRANSACTION = '/api/payments/create-transaction'

/**
 * Minta snap token ke backend.
 * Di sini kita mock response-nya agar front-end dapat diuji tanpa backend.
 *
 * @param {Object} orderPayload - data pesanan (orderId, amount, customerDetails, items)
 * @returns {Promise<{ token: string, redirectUrl: string }>}
 */
async function createTransaction(orderPayload) {
  // ============================================================
  // TODO (backend): Ganti blok mock ini dengan pemanggilan API:
  //
  // const res = await api.post(BACKEND_CREATE_TRANSACTION, orderPayload)
  // return res.data  // { token, redirect_url }
  //
  // Backend Anda akan:
  // 1. Validasi data pesanan
  // 2. Panggil Midtrans Server API: POST https://app.midtrans.com/snap/v1/transactions
  //    dengan header Authorization: Basic Base64(ServerKey + ':')
  // 3. Return snap token ke front-end
  // ============================================================

  // === MOCK RESPONSE (simulasi) ===
  await new Promise(r => setTimeout(r, 800)) // simulasi network delay

  const mockToken = 'mock-snap-token-' + Date.now()
  return {
    token: mockToken,
    redirectUrl: null, // snap popup — tidak perlu redirect
    orderId: orderPayload.orderId,
    amount: orderPayload.amount,
  }
}

/**
 * Buka Midtrans Snap popup.
 * Di produksi, ini memuat script Snap Midtrans dan memanggil snap.pay().
 * Di sini kita simulasikan hasilnya.
 *
 * @param {string} snapToken
 * @param {Object} callbacks - { onSuccess, onPending, onError, onClose }
 */
function openSnap(snapToken, { onSuccess, onPending, onError, onClose } = {}) {
  // ============================================================
  // TODO (produksi): Load Midtrans Snap script lalu panggil:
  //
  // window.snap.pay(snapToken, {
  //   onSuccess: (result) => onSuccess?.(result),
  //   onPending: (result) => onPending?.(result),
  //   onError:   (result) => onError?.(result),
  //   onClose:   ()       => onClose?.(),
  // })
  //
  // Tambahkan Snap script ke index.html:
  // <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="..."></script>
  // ============================================================

  // === MOCK: tampilkan dialog simulasi pembayaran ===
  // Simulasi hasil pembayaran secara acak untuk demo
  setTimeout(() => {
    const random = Math.random()
    if (random < 0.7) {
      // 70% sukses
      onSuccess?.({
        order_id: 'ORDER-' + Date.now(),
        transaction_id: 'TXN-MOCK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        transaction_status: 'settlement',
        payment_type: 'bank_transfer',
        gross_amount: '0',
        transaction_time: new Date().toISOString(),
        status_code: '200',
      })
    } else if (random < 0.85) {
      // 15% pending
      onPending?.({
        order_id: 'ORDER-' + Date.now(),
        transaction_id: 'TXN-MOCK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        transaction_status: 'pending',
        payment_type: 'bank_transfer',
        gross_amount: '0',
        transaction_time: new Date().toISOString(),
        status_code: '201',
      })
    } else {
      // 15% gagal
      onError?.({
        order_id: 'ORDER-' + Date.now(),
        transaction_status: 'deny',
        status_code: '202',
        status_message: 'Transaksi ditolak oleh bank/penyedia pembayaran.',
      })
    }
  }, 1500)
}

/**
 * Alur lengkap: buat transaksi → buka Snap → tangani callback
 */
async function initiatePayment(orderPayload) {
  const transaction = await createTransaction(orderPayload)
  return new Promise((resolve, reject) => {
    openSnap(transaction.token, {
      onSuccess: (result) => resolve({ status: 'success', result, transaction }),
      onPending: (result) => resolve({ status: 'pending', result, transaction }),
      onError:   (result) => resolve({ status: 'failed',  result, transaction }),
      onClose:   ()       => resolve({ status: 'closed',  result: null, transaction }),
    })
  })
}

export const paymentService = {
  createTransaction,
  openSnap,
  initiatePayment,
}
