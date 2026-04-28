import { useEffect, useState } from 'react'
import { useAuthStore } from '#/store/auth'
import { apiFetch } from '#/lib/api'
import { exportAllLocalData, hasLocalData } from '#/services/migration'

export function MigrationBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken = useAuthStore((s) => s.accessToken)
  const [show, setShow] = useState(false)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    if (localStorage.getItem('ew_migrated') === '1') return
    hasLocalData().then((has) => setShow(has))
  }, [isAuthenticated])

  if (!show || done) return null

  async function handleImport() {
    setImporting(true)
    try {
      const payload = await exportAllLocalData()
      await apiFetch('/sync/import', {
        method: 'POST',
        body: JSON.stringify(payload),
        token: accessToken ?? undefined,
      })
      localStorage.setItem('ew_migrated', '1')
      setDone(true)
      setShow(false)
    } catch {
      // Import failed (e.g. user already has data) — dismiss silently
      localStorage.setItem('ew_migrated', '1')
      setShow(false)
    } finally {
      setImporting(false)
    }
  }

  function handleSkip() {
    localStorage.setItem('ew_migrated', '1')
    setShow(false)
  }

  return (
    <div className="mx-4 md:mx-8 mt-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-amber-500 shrink-0">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">Tienes datos locales</p>
          <p className="text-xs text-amber-700 truncate">Impórtalos a tu cuenta para no perderlos.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleImport}
          disabled={importing}
          className="cursor-pointer text-xs font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {importing ? 'Importando…' : 'Importar datos'}
        </button>
        <button
          onClick={handleSkip}
          className="cursor-pointer text-xs text-amber-700 hover:text-amber-900 transition-colors"
        >
          Omitir
        </button>
      </div>
    </div>
  )
}
