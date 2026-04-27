// Service layer for user profile.
// Currently uses localStorage for instant read on mount.
// To migrate to API: swap getProfile/saveProfile with fetch() calls; keep the same interface.

import type { UserProfile } from './types'

const STORAGE_KEY = 'ew_profile'

const DEFAULTS: UserProfile = {
  username: 'You',
}

export const profileService = {
  get(): UserProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { ...DEFAULTS }
      return { ...DEFAULTS, ...JSON.parse(raw) }
    } catch {
      return { ...DEFAULTS }
    }
  },

  save(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  },

  update(changes: Partial<UserProfile>): UserProfile {
    const current = profileService.get()
    const updated = { ...current, ...changes }
    profileService.save(updated)
    return updated
  },
}
