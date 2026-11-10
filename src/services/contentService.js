import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

function toError(error, fallback) {
  if (error.response?.data?.message) return new Error(error.response.data.message)
  if (error.request && !error.response) {
    return new Error('Tidak bisa terhubung ke server. Pastikan backend berjalan.')
  }
  return new Error(error.message || fallback)
}

export const contentService = {
  async get(type, audience) {
    try {
      return unwrap(await api.get(`/content/${type}/${audience}`))
    } catch (error) {
      throw toError(error, 'Gagal mengambil konten.')
    }
  },

  async getAllForAdmin() {
    try {
      return unwrap(await api.get('/content/admin'))
    } catch (error) {
      throw toError(error, 'Gagal mengambil konten admin.')
    }
  },

  async save(type, audience, content) {
    try {
      return unwrap(await api.put(`/content/admin/${type}/${audience}`, { content }))
    } catch (error) {
      throw toError(error, 'Gagal menyimpan konten.')
    }
  },
}
