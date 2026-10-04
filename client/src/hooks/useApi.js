import { useMemo } from 'react'
import { useAuth } from '@clerk/react'
import { api } from '../lib/api'

export const useApi = () => {
  const { getToken } = useAuth()

  return useMemo(() => {
    const call = async (method, url, data) => {
      const token = await getToken()
      
      // These logs will tell us exactly what is being sent
      console.log("DEBUG: Clerk Token exists:", !!token) 
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log("DEBUG: Headers being sent:", headers) 
      
      const res = await api({ method, url, data, headers })
      return res.data
    }
    return {
      get: (url) => call('get', url),
      post: (url, data) => call('post', url, data),
      put: (url, data) => call('put', url, data),
      delete: (url) => call('delete', url), 
    }
  }, [getToken])
}