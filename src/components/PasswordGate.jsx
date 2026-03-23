import { useState } from 'react'
import { BookOpen, Lock, AlertCircle } from 'lucide-react'

export default function PasswordGate({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return
    
    setLoading(true)
    setError('')
    
    const result = await onLogin(password)
    
    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-stone-100 flex items-center justify-center px-4">
      {/* Textura sutil */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233a2f1f' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-200 mb-6 shadow-sm">
            <BookOpen className="w-10 h-10 text-amber-700" />
          </div>
          <h1 className="font-display text-5xl font-bold text-stone-800 tracking-tight">
            Ex Libris
          </h1>
          <p className="font-display text-xl text-stone-400 italic mt-2">
            Biblioteca Personal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="Ingresá la contraseña"
              className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-body text-lg shadow-sm"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-4 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-300 disabled:text-stone-400 text-white font-body font-semibold rounded-xl transition-all duration-200 text-lg tracking-wide shadow-sm"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-stone-400 text-sm mt-8 font-body">
          Ingresá como administrador o invitado
        </p>
      </div>
    </div>
  )
}
