// paymentService.js
// Integrasi Midtrans Snap Frontend untuk Ngenyangin.
// Memuat script Snap Midtrans secara dinamis dan memanggil window.snap.pay().

let snapPromise = null

/**
 * Memuat library Snap.js Midtrans secara asinkron jika belum terpasang di window.
 */
export function loadSnapScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'))
  if (window.snap) return Promise.resolve(window.snap)
  if (snapPromise) return snapPromise

  snapPromise = new Promise((resolve, reject) => {
    const snapUrl = import.meta.env.VITE_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js'
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ''

    const existing = document.querySelector('script[src*="midtrans.com/snap/snap.js"]')
    if (existing) {
      if (window.snap) return resolve(window.snap)
      existing.addEventListener('load', () => resolve(window.snap))
      existing.addEventListener('error', () => reject(new Error('Gagal memuat script Midtrans Snap')))
      return
    }

    const script = document.createElement('script')
    script.src = snapUrl
    if (clientKey) {
      script.setAttribute('data-client-key', clientKey)
    }
    script.async = true
    script.onload = () => {
      if (window.snap) {
        resolve(window.snap)
      } else {
        reject(new Error('Objek window.snap tidak ditemukan setelah script dimuat'))
      }
    }
    script.onerror = () => {
      snapPromise = null
      reject(new Error('Gagal memuat script Midtrans Snap. Periksa koneksi internet Anda.'))
    }

    document.head.appendChild(script)
  })

  return snapPromise
}

/**
 * Buka Midtrans Snap Popup menggunakan Snap Token yang diperoleh dari backend.
 *
 * @param {string} snapToken - Token transaksi dari backend POST /purchase
 * @param {Object} callbacks - { onSuccess, onPending, onError, onClose }
 */
export async function openSnap(snapToken, { onSuccess, onPending, onError, onClose } = {}) {
  await loadSnapScript()
  if (!window.snap || typeof window.snap.pay !== 'function') {
    throw new Error('Midtrans Snap tidak tersedia')
  }

  window.snap.pay(snapToken, {
    onSuccess: (result) => onSuccess?.(result),
    onPending: (result) => onPending?.(result),
    onError: (result) => onError?.(result),
    onClose: () => onClose?.(),
  })
}

/**
 * Membuka popup pembayaran Midtrans Snap dengan antarmuka Promise
 *
 * @param {string} snapToken
 * @returns {Promise<{ status: 'success' | 'pending' | 'failed' | 'closed', result: any }>}
 */
export async function payWithSnap(snapToken) {
  return new Promise((resolve, reject) => {
    openSnap(snapToken, {
      onSuccess: (result) => resolve({ status: 'success', result }),
      onPending: (result) => resolve({ status: 'pending', result }),
      onError:   (result) => resolve({ status: 'failed',  result }),
      onClose:   ()       => resolve({ status: 'closed',  result: null }),
    }).catch(reject)
  })
}

export const paymentService = {
  loadSnapScript,
  openSnap,
  payWithSnap,
}
