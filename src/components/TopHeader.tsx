import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Avatar } from './Sidebar'
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
      <header className="md:hidden fixed top-0 left-0 right-0 z-20 h-14 bg-white/95 backdrop-blur-sm border-b border-[#e6e8ea] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">EW</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#191c1e] leading-tight">{title}</h1>
            {activePlan && (
              <p className="text-[10px] text-[#76777d] leading-tight">{activePlan.name}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="cursor-pointer"
          aria-label="Profile"
        >
          <Avatar size="sm" />
        </button>
      </header>

      {/* Desktop: just a top bar with page context (no fixed position, flows with content) */}
      <div className="hidden md:flex items-center justify-between px-8 pt-7 pb-0">
        <div className="text-xs text-[#76777d]">
          {activePlan ? `Active plan: ${activePlan.name}` : ''}
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="cursor-pointer flex items-center gap-2 text-sm text-[#45464d] hover:text-[#191c1e] transition-colors"
          aria-label="Edit profile"
        >
          <Avatar size="sm" />
        </button>
      </div>

      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}
