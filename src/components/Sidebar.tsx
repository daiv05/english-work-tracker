import { useState, useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useProfileStore } from '#/store/profile'
import { ProfileModal } from './ProfileModal'
import { Select } from './ui/Select'

const navLinks = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    to: '/log',
    label: 'Activity Log',
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h6m-6 4h4"
        />
      </svg>
    ),
  },
  {
    to: '/writing',
    label: 'Writing Mode',
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    to: '/resources',
    label: 'Resources',
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    ),
  },
  {
    to: '/plan',
    label: 'Plan Editor',
    icon: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-6 4h6"
        />
      </svg>
    ),
  },
]

function Avatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { username, avatarData } = useProfileStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  }
  const initial = (username.charAt(0) || '?').toUpperCase()

  if (mounted && avatarData) {
    return (
      <img
        src={avatarData}
        alt={username}
        className={`${sizeMap[size]} rounded-full object-cover border border-white/20`}
      />
    )
  }
  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-secondary flex items-center justify-center font-bold text-white select-none shrink-0`}
    >
      {initial}
    </div>
  )
}

export { Avatar }

export function Sidebar() {
  const { location } = useRouterState()
  const { username, plans, activePlanId, setActivePlan } =
    useProfileStore()
  const [showProfile, setShowProfile] = useState(false)
  const activePlan = plans.find((plan) => plan.id === activePlanId)

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-primary-dark text-white fixed left-0 top-0 z-30 border-r border-white/5">
        {/* App Brand */}
        <div className="px-5 pt-6 pb-4">
          <Link to="/" className="flex items-center gap-2.5 mb-1 hover:opacity-80 transition-opacity">
            <img
              src="/manifest-icon-192.maskable.png"
              alt="EW"
              className="w-12 h-12 rounded-lg"
              onError={(e) => {
                const t = e.currentTarget
                t.style.display = 'none'
                const sibling = t.nextElementSibling as HTMLElement | null
                if (sibling) sibling.style.display = 'flex'
              }}
            />
            {/* Fallback logo */}
            <div
              className="w-12 h-12 rounded-lg bg-secondary items-center justify-center hidden"
              aria-hidden
            >
              <span className="text-white text-xs font-bold">EW</span>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight tracking-tight">
                English Work
              </p>
              <p className="text-[11px] text-white/40 leading-tight">Tracker</p>
            </div>
          </Link>
        </div>

        {/* Profile section */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowProfile(true)}
            className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {username}
              </p>
              <p className="text-[11px] text-white/40">
                {activePlan ? `${activePlan.level_from} → ${activePlan.level_to}` : 'No active plan'}
              </p>
            </div>
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="text-white/30 group-hover:text-white/60 transition-colors shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <div className="mt-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/35 mb-1.5 px-1">
              Active plan
            </label>
            <Select
              variant="dark"
              options={plans.map((p) => ({ value: p.id!, label: p.name }))}
              value={activePlanId}
              onChange={(val) => { void setActivePlan(Number(val)) }}
              placeholder="Select plan"
            />
            <p className="text-[10px] text-white/35 mt-1 px-1 truncate">
              {activePlan?.level_from} to {activePlan?.level_to}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/8 mb-3" />

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navLinks.map((link) => {
            const isActive =
              link.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-secondary/20 text-secondary-light border border-secondary/30'
                    : 'text-white/55 hover:text-white hover:bg-white/6 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-secondary-light' : 'text-white/40'}>
                  {link.icon}
                </span>
                {link.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary-light" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5 border-t border-white/8 space-y-2">
          <Link
            to="/privacy"
            className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/35 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <svg
              width="13"
              height="13"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Privacy Policy
          </Link>
          <p className="px-3 text-[10px] text-white/20">
            v1.0.0 · Offline-first
          </p>
        </div>
      </aside>

      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}
