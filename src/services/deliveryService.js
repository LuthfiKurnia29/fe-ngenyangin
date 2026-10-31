import deliveriesData from '@/data/deliveries.json'

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))
let _deliveries = [...deliveriesData]

export const deliveryService = {
  async getAll() {
    await delay()
    return [..._deliveries]
  },

  async getById(id) {
    await delay()
    const d = _deliveries.find(d => d.id === id)
    if (!d) throw new Error('Pengantaran tidak ditemukan')
    return { ...d }
  },

  async getByCourierId(courierId) {
    await delay()
    return _deliveries.filter(d => d.courierId === courierId)
  },

  async accept(id, courierId, courierName) {
    await delay(200)
    const idx = _deliveries.findIndex(d => d.id === id)
    if (idx === -1) throw new Error('Tidak ditemukan')
    _deliveries[idx] = { ..._deliveries[idx], courierId, courierName, status: 'Diterima' }
    return _deliveries[idx]
  },

  async updateStep(id, step) {
    await delay(200)
    const idx = _deliveries.findIndex(d => d.id === id)
    if (idx === -1) throw new Error('Tidak ditemukan')
    _deliveries[idx] = { ..._deliveries[idx], currentStep: step }
    return _deliveries[idx]
  },

  async uploadProof(id, photoUrl, sealIntact) {
    await delay(300)
    const idx = _deliveries.findIndex(d => d.id === id)
    if (idx === -1) throw new Error('Tidak ditemukan')
    _deliveries[idx] = { ..._deliveries[idx], proofPhoto: photoUrl, sealIntact, status: 'Selesai' }
    return _deliveries[idx]
  },

  async getAvailable() {
    await delay()
    return _deliveries.filter(d => !d.courierId || d.status === 'Siap Jemput' || d.status === 'Menunggu Kasir Segel')
  }
}
