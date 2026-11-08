import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderService } from '@/services/orderService'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const isLoading = ref(false)

  async function fetchOrders(consumerId, user = null) {
    isLoading.value = true
    try {
      orders.value = await orderService.getByConsumerId(consumerId, user)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSupplierOrders(supplierId, user = null) {
    isLoading.value = true
    try {
      orders.value = await orderService.getBySupplierId(supplierId, user)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAllOrders() {
    isLoading.value = true
    try {
      orders.value = await orderService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function placeOrder(orderData) {
    isLoading.value = true
    try {
      const newOrder = await orderService.create(orderData)
      orders.value.unshift(newOrder)
      return newOrder
    } finally {
      isLoading.value = false
    }
  }

  async function updateStatus(orderId, status) {
    const updated = await orderService.updateStatus(orderId, status)
    const idx = orders.value.findIndex(o => o.id === orderId)
    if (idx !== -1) orders.value[idx] = updated
    return updated
  }

  async function addReview(orderId, review) {
    const updated = await orderService.addReview(orderId, review)
    const idx = orders.value.findIndex(o => o.id === orderId)
    if (idx !== -1) orders.value[idx] = { ...orders.value[idx], review: updated }
  }

  return { orders, isLoading, fetchOrders, fetchSupplierOrders, fetchAllOrders, placeOrder, updateStatus, addReview }
})
