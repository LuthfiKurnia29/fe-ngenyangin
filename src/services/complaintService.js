import complaintsData from '@/data/complaints.json'

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))
let _complaints = [...complaintsData]

export const complaintService = {
  async getAll() {
    await delay()
    return [..._complaints]
  },

  async getById(id) {
    await delay()
    const c = _complaints.find(c => c.id === id)
    if (!c) throw new Error('Pengaduan tidak ditemukan')
    return { ...c }
  },

  async resolve(id, resolution) {
    await delay(200)
    const idx = _complaints.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('Tidak ditemukan')
    _complaints[idx] = {
      ..._complaints[idx],
      status: 'Terselesaikan',
      resolution,
      resolvedAt: new Date().toISOString()
    }
    return _complaints[idx]
  },

  async create(data) {
    await delay(300)
    const newComplaint = {
      id: 'c' + Date.now(),
      ...data,
      status: 'Menunggu Resolusi',
      reportedAt: new Date().toISOString()
    }
    _complaints.unshift(newComplaint)
    return newComplaint
  }
}
