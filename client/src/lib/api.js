import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
  timeout: 120000, // AI calls can be slow
})

export const errorMessage = (err) => {
  if (err?.response?.data?.message) return err.response.data.message
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
  if (err?.code === 'ERR_NETWORK') return 'Cannot reach the server. It may be waking up - try again in a few seconds.'
  return err?.message || 'Something went wrong'
}