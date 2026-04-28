import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuthStore } from '#/store/auth'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const appTarget = isAuthenticated ? '/app' : '/auth/register'

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
        <span className="text-sm font-bold tracking-tight text-white/90">Engrow</span>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/app"
              className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              Open app →
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth/register"
                className="text-sm font-semibold bg-[#006c49] hover:bg-[#005c3d] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#006c49] mb-6">
          Método basado en ciencia
        </p>
        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight max-w-4xl mb-6">
          No estudias inglés.
          <br />
          <span className="text-[#006c49]">Lo absorbes.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed mb-10">
          Input comprensible. Shadowing. Repetición espaciada. Output gradual.
          El método que usan los poliglotas — organizado en una herramienta que funciona contigo.
        </p>
        <Link
          to={appTarget}
          className="inline-flex items-center gap-2 bg-[#006c49] hover:bg-[#005c3d] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
        >
          Abrir la app gratis
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="text-xs text-white/25 mt-4">Sin tarjeta. Sin suscripción.</p>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
          <div className="w-px h-8 bg-white/40" />
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* El método — 4 columnas editoriales */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-16 text-center">
          El método
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {[
            {
              num: '01',
              title: 'i+1 Input',
              body: 'Consume contenido que entiendes al 70-90%. El cerebro detecta patrones sin que lo fuerces. Krashen lo demostró en los 80s — sigue siendo verdad.',
            },
            {
              num: '02',
              title: 'Shadowing',
              body: 'Escucha un fragmento corto. Repítelo imitando el ritmo y la entonación. La percepción fonética precede a la producción. Entrena el oído antes que la boca.',
            },
            {
              num: '03',
              title: 'Repetición espaciada',
              body: 'Frases reales del contenido que consumes, no listas de palabras aisladas. Revistas en intervalos crecientes. La curva del olvido de Ebbinghaus trabaja para ti.',
            },
            {
              num: '04',
              title: 'Output controlado',
              body: 'Escribir y hablar fuerza un procesamiento más profundo. Swain lo llamó Output Hypothesis. Pero primero el input debe haber construido la base.',
            },
          ].map((item) => (
            <div key={item.num} className="bg-[#0d1425] p-8 flex flex-col gap-4">
              <span className="text-[10px] font-bold text-[#006c49] tracking-widest">{item.num}</span>
              <h3 className="text-xl font-black text-white">{item.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features bento */}
      <section className="py-10 px-6 md:px-12 max-w-6xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-12 text-center">
          Lo que hay en la app
        </p>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Plan diario — grande */}
          <div className="md:col-span-7 bg-[#0d1425] border border-white/5 rounded-2xl p-8">
            <div className="w-10 h-10 rounded-xl bg-[#006c49]/15 flex items-center justify-center mb-5">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#006c49" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Plan diario</h3>
            <p className="text-sm text-white/45 leading-relaxed">
              Define bloques de actividad para cada día de la semana. Listening, shadowing, vocabulario, escritura.
              El plan se adapta a tu objetivo diario en minutos.
            </p>
          </div>

          {/* Streak */}
          <div className="md:col-span-5 bg-[#006c49] rounded-2xl p-8 flex flex-col justify-between">
            <div className="text-5xl font-black text-white/90 tabular-nums">🔥</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Rachas y progreso</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Días consecutivos completando tu meta. Simple, honesto, motivante.
              </p>
            </div>
          </div>

          {/* Registro de actividad */}
          <div className="md:col-span-4 bg-[#0d1425] border border-white/5 rounded-2xl p-8">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-5">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Registro de actividad</h3>
            <p className="text-sm text-white/45 leading-relaxed">
              Cada bloque de estudio queda registrado. Recurso, tipo, duración, nota rápida.
            </p>
          </div>

          {/* Modo escritura */}
          <div className="md:col-span-4 bg-[#0d1425] border border-white/5 rounded-2xl p-8">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-5">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Modo escritura</h3>
            <p className="text-sm text-white/45 leading-relaxed">
              Output controlado con timer, contador de palabras y prompts opcionales. El espacio para producir.
            </p>
          </div>

          {/* Recursos */}
          <div className="md:col-span-4 bg-[#0d1425] border border-white/5 rounded-2xl p-8">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-5">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Biblioteca de recursos</h3>
            <p className="text-sm text-white/45 leading-relaxed">
              Guarda y organiza tus fuentes de input: podcasts, series, artículos, gramática.
            </p>
          </div>
        </div>
      </section>

      {/* Manifiesto */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6">
          Sin suscripción.
          <br />
          Sin paywalls.
          <br />
          <span className="text-white/30">Sin dark patterns.</span>
        </h2>
        <p className="text-base text-white/40 max-w-xl mx-auto leading-relaxed">
          Engrow es gratis porque aprender inglés no debería ser un negocio de fricción.
          Tus datos son tuyos. Sin anuncios. Sin rastreo.
        </p>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 text-center border-t border-white/5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/25 mb-6">
          Empieza hoy
        </p>
        <Link
          to={appTarget}
          className="inline-flex items-center gap-2 bg-[#006c49] hover:bg-[#005c3d] text-white font-bold px-10 py-4 rounded-xl text-base transition-colors"
        >
          Crear cuenta gratis
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="text-xs text-white/20 mt-4">
          Ya tienes cuenta?{' '}
          <Link to="/auth/login" className="underline hover:text-white/40 transition-colors">
            Inicia sesión
          </Link>
        </p>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 flex items-center justify-between text-xs text-white/20">
        <span>Engrow · {new Date().getFullYear()}</span>
        <Link to="/privacy" className="hover:text-white/40 transition-colors">
          Privacy Policy
        </Link>
      </footer>
    </div>
  )
}
