import ordersData from '@/data/orders.json'

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

// Runtime store (in-memory mutations)
let _orders = [...ordersData]

export const orderService = {
  async getAll() {
    await delay()
    return [..._orders]
  },

  async getById(id) {
    await delay()
    const order = _orders.find(o => o.id === id)
    if (!order) throw new Error('Pesanan tidak ditemukan')
    return { ...order }
  },

  async getByConsumerId(consumerId) {
    await delay()
    return _orders.filter(o => o.consumerId === consumerId).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  },

  async getBySupplierId(supplierId) {
    await delay()
    return _orders.filter(o => o.supplierId === supplierId).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  },

  async getByCourierId(courierId) {
    await delay()
    return _orders.filter(o => o.courierId === courierId)
  },

  async create(orderData) {
    await delay(300)
    const newOrder = {
      id: 'o' + Date.now(),
      orderNumber: 'NGN-' + Math.floor(800000 + Math.random() * 99999),
      status: 'Menunggu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { step: 'Pesanan Dibuat', time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB', status: 'active' },
        { step: 'Diproses Supplier', time: null, status: 'pending' },
        { step: orderData.deliveryMethod === 'courier' ? 'Dalam Pengantaran' : 'Siap Diambil', time: null, status: 'pending' },
        { step: 'Selesai', time: null, status: 'pending' }
      ],
      ...orderData
    }
    _orders.unshift(newOrder)
    return newOrder
  },

  async updateStatus(id, newStatus) {
    await delay(200)
    const idx = _orders.findIndex(o => o.id === id)
    if (idx === -1) throw new Error('Pesanan tidak ditemukan')

    const order = { ..._orders[idx] }
    order.status = newStatus
    order.updatedAt = new Date().toISOString()

    // Update timeline
    const statusStepMap = {
      'Diproses': 1,
      'Siap Diambil': 2,
      'Dalam Pengantaran': 2,
      'Selesai': 3
    }
    const stepIdx = statusStepMap[newStatus]
    if (stepIdx !== undefined && order.timeline[stepIdx]) {
      order.timeline = order.timeline.map((t, i) => {
        if (i < stepIdx) return { ...t, status: 'completed' }
        if (i === stepIdx) return { ...t, status: 'active', time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' }
        return t
      })
    }

    _orders[idx] = order
    return order
  },

  async addReview(orderId, review) {
    await delay(200)
    const idx = _orders.findIndex(o => o.id === orderId)
    if (idx !== -1) {
      _orders[idx] = { ..._orders[idx], review }
    }
    return review
  }
}
