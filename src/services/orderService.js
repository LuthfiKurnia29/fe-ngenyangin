import ordersData from '@/data/orders.json'

const STORAGE_KEY = 'ngenyangin_orders'
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

function getInitialOrders() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to parse orders from localStorage:', e)
  }
  // Fallback to seeded orders
  const initial = [...ordersData]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  } catch (_) {}
  return initial
}

let _orders = getInitialOrders()

function saveOrders(orders) {
  _orders = [...orders]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_orders))
  } catch (e) {
    console.error('Failed to save orders to localStorage:', e)
  }
}

export const orderService = {
  async getAll() {
    await delay()
    return [..._orders]
  },

  async getById(id) {
    await delay()
    const order = _orders.find(o => String(o.id) === String(id))
    if (!order) throw new Error('Pesanan tidak ditemukan')
    return { ...order }
  },

  async getByConsumerId(consumerId, user = null) {
    await delay()
    const cId = String(consumerId || '').trim()
    const uName = user?.name ? user.name.toLowerCase().trim() : ''
    const uEmail = user?.email ? user.email.toLowerCase().trim() : ''

    return _orders.filter(o => {
      const orderConsumerId = String(o.consumerId || '').trim()

      // Direct match
      if (cId && (orderConsumerId === cId || orderConsumerId === `u${cId}` || `u${orderConsumerId}` === cId)) {
        return true
      }

      // Demo consumer mapping (consumer@demo.id / Siti Rahayu / Budi Santoso)
      if ((cId === '1' || cId === '3' || uEmail === 'konsumen@demo.id' || uEmail === 'consumer@demo.id') &&
          (orderConsumerId === 'u1' || orderConsumerId === '1' || orderConsumerId === '3')) {
        return true
      }

      // Name match fallback
      if (uName && o.consumerName && o.consumerName.toLowerCase().trim() === uName) {
        return true
      }

      return false
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getBySupplierId(supplierId, user = null) {
    await delay()
    const sId = String(supplierId || '').trim()
    const uOutlet = user?.outlet ? user.outlet.toLowerCase().trim() : ''
    const uName = user?.name ? user.name.toLowerCase().trim() : ''
    const uEmail = user?.email ? user.email.toLowerCase().trim() : ''

    const matched = _orders.filter(o => {
      const orderSupplierId = String(o.supplierId || '').trim()

      // 1. Direct ID match (loose string comparison, supports "2" === "2" or "2" === "u2")
      if (sId && (
        orderSupplierId === sId ||
        orderSupplierId === `u${sId}` ||
        `u${orderSupplierId}` === sId
      )) {
        return true
      }

      // 2. Demo seed mapping for "supplier@demo.id" / Ahmad Fauzan / "Bebek Madura Bu Siti" (id 2 / u2)
      const isDemoSiti = sId === '2' || sId === 'u2' || uEmail === 'supplier@demo.id' ||
        (uOutlet && (uOutlet.includes('bebek') || uOutlet.includes('bu siti')))
      if (isDemoSiti && (orderSupplierId === 'u2' || orderSupplierId === '2')) {
        return true
      }

      // 3. Demo seed mapping for "artisan@demo.id" / Budi Santoso / "Artisan Bakehouse Senopati" (id 5 / u5)
      const isDemoArtisan = sId === '5' || sId === 'u5' || uEmail === 'artisan@demo.id' ||
        (uOutlet && uOutlet.includes('artisan'))
      if (isDemoArtisan && (orderSupplierId === 'u5' || orderSupplierId === '5')) {
        return true
      }

      // 4. Match by outlet name or supplier name (case-insensitive substring)
      if (o.supplierName) {
        const orderSupplierName = o.supplierName.toLowerCase().trim()
        if (uOutlet && (orderSupplierName.includes(uOutlet) || uOutlet.includes(orderSupplierName))) {
          return true
        }
        if (uName && (orderSupplierName.includes(uName) || uName.includes(orderSupplierName))) {
          return true
        }
      }

      return false
    })

    return matched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getByCourierId(courierId) {
    await delay()
    return _orders.filter(o => String(o.courierId) === String(courierId))
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
    saveOrders(_orders)
    return newOrder
  },

  async updateStatus(id, newStatus) {
    await delay(200)
    const idx = _orders.findIndex(o => String(o.id) === String(id))
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
    if (stepIdx !== undefined && Array.isArray(order.timeline) && order.timeline[stepIdx]) {
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      order.timeline = order.timeline.map((t, i) => {
        if (i < stepIdx) return { ...t, status: 'completed' }
        if (i === stepIdx) {
          return {
            ...t,
            status: newStatus === 'Selesai' ? 'completed' : 'active',
            time: nowTime
          }
        }
        return t
      })
    } else if (newStatus === 'Dibatalkan') {
      if (!Array.isArray(order.timeline)) order.timeline = []
      order.timeline.push({
        step: 'Pesanan Dibatalkan',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        status: 'error'
      })
    }

    _orders[idx] = order
    saveOrders(_orders)
    return order
  },

  async addReview(orderId, review) {
    await delay(200)
    const idx = _orders.findIndex(o => String(o.id) === String(orderId))
    if (idx !== -1) {
      _orders[idx] = { ..._orders[idx], review }
      saveOrders(_orders)
    }
    return review
  }
}
