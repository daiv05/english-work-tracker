import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { apiFetch } from '#/lib/api'

export const Route = createFileRoute('/auth/forgot')({
  component: ForgotPage,
})

function ForgotPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    } catch {
      // Never reveal whether the email exists — always show success
    } finally {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-xl font-black text-white tracking-tight">
            Engrow
          </Link>
          <p className="text-sm text-white/40 mt-2">Restablecer contraseña</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#006c49]/20 flex items-center justify-center mx-auto">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#006c49" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Si ese email existe, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <Link
              to="/auth/login"
              className="inline-block text-sm text-[#006c49] hover:underline font-semibold"
            >
              Volver al login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#006c49] hover:bg-[#005c3d] disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-white/30">
              <Link to="/auth/login" className="hover:text-white/60 transition-colors">
                ← Volver al login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
