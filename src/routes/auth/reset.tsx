import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { apiFetch, ApiError } from '#/lib/api'
import { useToast } from '#/components/ui/ToastProvider'

export const Route = createFileRoute('/auth/reset')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string | undefined) ?? '',
  }),
  component: ResetPage,
})

function ResetPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { token } = useSearch({ from: '/auth/reset' })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setLoading(true)
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: password }),
      })
      toast.success('Contraseña actualizada.')
      await navigate({ to: '/auth/login' })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 400 ? 'El enlace expiró o es inválido.' : err.message)
      } else {
        setError('Error al conectar con el servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-white/50 text-sm mb-4">Enlace de restablecimiento inválido.</p>
          <Link to="/auth/forgot" className="text-[#006c49] font-semibold hover:underline text-sm">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-xl font-black text-white tracking-tight">
            Engrow
          </Link>
          <p className="text-sm text-white/40 mt-2">Nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-colors"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">
              Confirmar contraseña
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-colors"
              placeholder="Repite la contraseña"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#006c49] hover:bg-[#005c3d] disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
