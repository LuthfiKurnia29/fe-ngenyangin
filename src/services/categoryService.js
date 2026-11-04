import api from './api'

const BASE = '/categories'

const unwrap = (res) => res.data?.data ?? res.data

export const categoryService = {
  async getAll(params = {}) {
    const res = await api.get(BASE, { params })
    const data = unwrap(res)
    return data.items ?? data
  },
}