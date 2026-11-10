import api from './api'

const unwrap = (response) => response.data?.data ?? response.data

function toError(error, fallback) {
  if (error.response?.data?.message) return new Error(error.response.data.message)
  if (error.request && !error.response) {
    return new Error('Tidak bisa terhubung ke server. Pastikan backend berjalan.')
  }
  return new Error(error.message || fallback)
}

export const complaintService = {
  async getAll() {
    try {
      return unwrap(await api.get('/complaints'))
    } catch (error) {
      throw toError(error, 'Gagal mengambil daftar pengaduan.')
    }
  },

  async create(data) {
    try {
      return unwrap(await api.post('/complaints', data))
    } catch (error) {
      throw toError(error, 'Gagal mencatat pengaduan.')
    }
  },

  async update(id, data) {
    try {
      return unwrap(await api.put(`/complaints/${id}`, data))
    } catch (error) {
      throw toError(error, 'Gagal memperbarui pengaduan.')
    }
  },

  async remove(id) {
    try {
      return unwrap(await api.delete(`/complaints/${id}`))
    } catch (error) {
      throw toError(error, 'Gagal menghapus pengaduan.')
    }
  },
}
