import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Store untuk sistem alamat terintegrasi (Profil ↔ Checkout)
// Data disimpan di localStorage agar konsisten antar halaman

const STORAGE_KEY = 'ngenyangin_addresses'

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveToStorage(addresses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses))
}

export const useAddressStore = defineStore('address', () => {
  const addresses = ref(loadFromStorage())

  const defaultAddress = computed(() =>
    addresses.value.find(a => a.isDefault) || null
  )

  const hasAddresses = computed(() => addresses.value.length > 0)

  function addAddress(data) {
    const id = 'addr_' + Date.now()
    const isFirst = addresses.value.length === 0

    // Jika diset sebagai utama, hapus utama lain
    if (data.isDefault || isFirst) {
      addresses.value.forEach(a => { a.isDefault = false })
    }

    const newAddr = {
      id,
      ...data,
      isDefault: data.isDefault || isFirst,
    }
    addresses.value.push(newAddr)
    saveToStorage(addresses.value)
    return newAddr
  }

  function updateAddress(id, data) {
    const idx = addresses.value.findIndex(a => a.id === id)
    if (idx === -1) return

    // Jika diset sebagai utama, hapus utama lain
    if (data.isDefault) {
      addresses.value.forEach(a => { a.isDefault = false })
    }

    addresses.value[idx] = { ...addresses.value[idx], ...data }
    saveToStorage(addresses.value)
  }

  function setDefault(id) {
    addresses.value.forEach(a => { a.isDefault = a.id === id })
    saveToStorage(addresses.value)
  }

  function removeAddress(id) {
    const addr = addresses.value.find(a => a.id === id)
    if (!addr) return

    // Jangan hapus alamat utama jika masih ada alamat lain
    if (addr.isDefault && addresses.value.length > 1) {
      throw new Error('Tidak bisa menghapus alamat utama. Atur alamat lain sebagai utama terlebih dahulu.')
    }

    addresses.value = addresses.value.filter(a => a.id !== id)

    // Jika hanya tinggal satu, jadikan utama
    if (addresses.value.length === 1) {
      addresses.value[0].isDefault = true
    }

    saveToStorage(addresses.value)
  }

  function getById(id) {
    return addresses.value.find(a => a.id === id) || null
  }

  return {
    addresses,
    defaultAddress,
    hasAddresses,
    addAddress,
    updateAddress,
    setDefault,
    removeAddress,
    getById,
  }
})
