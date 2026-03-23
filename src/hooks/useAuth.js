import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [role, setRole] = useState(null) // 'admin' | 'guest' | null
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión existente
    const saved = sessionStorage.getItem('biblioteca_role')
    if (saved === 'admin' || saved === 'guest') {
      setRole(saved)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (password) => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('key, value')
        .in('key', ['admin_password', 'guest_password'])

      if (error) throw error

      const adminPwd = data.find(r => r.key === 'admin_password')?.value
      const guestPwd = data.find(r => r.key === 'guest_password')?.value

      if (password === adminPwd) {
        setRole('admin')
        sessionStorage.setItem('biblioteca_role', 'admin')
        return { success: true, role: 'admin' }
      } else if (password === guestPwd) {
        setRole('guest')
        sessionStorage.setItem('biblioteca_role', 'guest')
        return { success: true, role: 'guest' }
      } else {
        return { success: false, error: 'Contraseña incorrecta' }
      }
    } catch (err) {
      console.error('Error al verificar contraseña:', err)
      return { success: false, error: 'Error de conexión' }
    }
  }, [])

  const logout = useCallback(() => {
    setRole(null)
    sessionStorage.removeItem('biblioteca_role')
  }, [])

  return { role, loading, login, logout, isAdmin: role === 'admin' }
}
