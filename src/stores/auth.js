import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '@/services/userService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('ngenyangin_user') || 'null'))
  const isLoading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  // BE memakai 'customer', FE memakai 'consumer'
  const role = computed(() => {
    const r = user.value?.role
    return r === 'customer' ? 'consumer' : r || null
  })
  const userName = computed(() => user.value?.name || '')

  async function login(email, password) {
    isLoading.value = true
    error.value = null
    try {
      const loggedUser = await userService.login(email, password)
      user.value = loggedUser
      localStorage.setItem('ngenyangin_user', JSON.stringify(loggedUser))
      return loggedUser
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(data) {
    isLoading.value = true
    error.value = null
    try {
      return await userService.register(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await userService.updateProfile(data)
      user.value = { ...user.value, ...updated }
      localStorage.setItem('ngenyangin_user', JSON.stringify(user.value))
      return user.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Ambil data terbaru dari server (BE) lalu simpan ke store
  async function fetchMe() {
    try {
      const me = await userService.getById()
      user.value = { ...user.value, ...me }
      localStorage.setItem('ngenyangin_user', JSON.stringify(user.value))
    } catch { /* pakai data lokal bila gagal */ }
    return user.value
  }

  async function logout() {
    await userService.logout()
    user.value = null
    localStorage.removeItem('ngenyangin_user')
    localStorage.removeItem('ngenyangin_token')
  }

  async function forgotPassword(email) {
    isLoading.value = true
    error.value = null
    try {
      return await userService.forgotPassword(email)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function resetPassword(token, newPassword) {
    isLoading.value = true
    error.value = null
    try {
      return await userService.resetPassword(token, newPassword)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return { user, isLoading, error, isLoggedIn, role, userName, login, register, updateProfile, fetchMe, logout, forgotPassword, resetPassword }
})
