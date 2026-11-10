import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ngenyangin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    // Jangan redirect kalau 401 berasal dari login/register/reset password (kredensial/token salah)
    const isLoginRoute =
      url.startsWith('/auth/login') ||
      url.startsWith('/auth/register') ||
      url.startsWith('/auth/forgot-password') ||
      url.startsWith('/auth/reset-password')
    // 401 di /auth/me, /auth/profile, dst. = token tidak valid -> bersihkan sesi & ke halaman login
    if (err.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('ngenyangin_token')
      localStorage.removeItem('ngenyangin_user')
      window.location.href = '/masuk'
    }
    return Promise.reject(err)
  }
)

export default api