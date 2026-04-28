import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '#/store/auth'
import { ApiError } from '#/lib/api'

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    try {
      await register(email, password, displayName || undefined)
      await navigate({ to: '/app' })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 409 ? 'Este email ya está registrado.' : err.message)
      } else {
        setError('Error al conectar con el servidor.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-xl font-black text-white tracking-tight">
            Engrow
          </Link>
          <p className="text-sm text-white/40 mt-2">Crea tu cuenta gratis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">
              Nombre (opcional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-colors"
              placeholder="Como te llamamos"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-colors"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#006c49] hover:bg-[#005c3d] disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm transition-colors"
          >
            {isLoading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/30">
          ¿Ya tienes cuenta?{' '}
          <Link to="/auth/login" className="text-white/60 hover:text-white font-semibold transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
