import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ProfileModal } from './ProfileModal'
import { useProfileStore } from '#/store/profile'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/log': 'Activity Log',
  '/writing': 'Writing Mode',
  '/resources': 'Resources',
  '/plan': 'Plan Builder',
  '/privacy': 'Privacy',
}

export function TopHeader() {
  const { location } = useRouterState()
  const [showProfile, setShowProfile] = useState(false)
  const { plans, activePlanId } = useProfileStore()
  const activePlan = plans.find((plan) => plan.id === activePlanId)
  const title = PAGE_TITLES[location.pathname] ?? 'English Work Tracker'

  return (
    <>
      {/* Mobile-only top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-20 h-14 bg-white/95 backdrop-blur-sm border-b border-surface-high flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/manifest-icon-192.maskable.png"
            alt="EW"
            className="w-7 h-7 rounded-lg"
            onError={(e) => {
              const t = e.currentTarget
              t.style.display = 'none'
              const sibling = t.nextElementSibling as HTMLElement | null
              if (sibling) sibling.style.display = 'flex'
            }}
          />
          <div className="w-7 h-7 rounded-lg bg-primary-dark items-center justify-center hidden" aria-hidden>
            <span className="text-white text-[10px] font-bold">EW</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-on-surface leading-tight">
              {title}
            </h1>
            {activePlan && (
              <p className="text-[10px] text-outline leading-tight">
                {activePlan.name}
              </p>
            )}
          </div>
        </Link>
        <button
          onClick={() => setShowProfile(true)}
          className="cursor-pointer"
          aria-label="Profile"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            className="text-on-surface-variant"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Desktop: top bar with page context */}
      <div className="hidden md:flex items-center justify-between px-8 pt-7 pb-0">
        <div className="text-xs text-outline">
          {activePlan ? `Active plan: ${activePlan.name}` : ''}
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="cursor-pointer flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Edit profile"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>

      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}
