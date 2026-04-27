import { create } from 'zustand'
import { profileService } from '#/services/profile'
import { plansService } from '#/services/plans'
import type { StudyPlan, UserProfile } from '#/services/types'

interface ProfileStore extends UserProfile {
  plans: StudyPlan[]
  activePlanId?: number
  isInitialized: boolean
  setUsername: (username: string) => void
  setAvatarData: (avatarData: string | undefined) => void
  setGoal: (minutes: number) => void
  updateActivePlanGoal: (minutes: number) => Promise<void>
  updateActivePlan: (changes: Partial<StudyPlan>) => Promise<void>
  setActivePlan: (planId: number) => Promise<void>
  createPlan: (name: string) => Promise<void>
  deletePlan: (planId: number) => Promise<void>
  _init: () => Promise<void>
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  ...profileService.get(),
  plans: [],
  activePlanId: undefined,
  isInitialized: false,

  setUsername(username) {
    const updated = profileService.update({ username })
    set(updated)
  },

  setAvatarData(avatarData) {
    const updated = profileService.update({ avatarData })
    set(updated)
  },

  setGoal(goalMinutesPerDay) {
    const updated = profileService.update({ goalMinutesPerDay })
    set(updated)
  },

  async updateActivePlanGoal(minutes) {
    const activePlanId = get().activePlanId
    if (!activePlanId) return
    await plansService.update(activePlanId, { daily_goal_minutes: minutes })
    const plans = await plansService.list()
    const active = plans.find((plan) => plan.is_active) ?? plans[0]
    set({ plans, activePlanId: active?.id })
  },

  async updateActivePlan(changes) {
    const activePlanId = get().activePlanId
    if (!activePlanId) return
    await plansService.update(activePlanId, changes)
    const plans = await plansService.list()
    const active = plans.find((plan) => plan.is_active) ?? plans[0]
    set({ plans, activePlanId: active?.id })
  },

  async setActivePlan(planId) {
    await plansService.setActive(planId)
    const plans = await plansService.list()
    const active = plans.find((plan) => plan.is_active) ?? plans.find((plan) => plan.id === planId) ?? plans[0]
    set({ plans, activePlanId: active?.id })
  },

  async createPlan(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    await plansService.create({ name: trimmed })
    const plans = await plansService.list()
    const active = plans.find((p) => p.is_active) ?? plans[0]
    set({ plans, activePlanId: active?.id })
  },

  async deletePlan(planId) {
    await plansService.delete(planId)
    const plans = await plansService.list()
    const active = plans.find((p) => p.is_active) ?? plans[0]
    set({ plans, activePlanId: active?.id })
  },

  async _init() {
    try {
      const profile = profileService.get()
      await plansService.ensureDefaultPlan()
      const plans = await plansService.list()
      const active = plans.find((plan) => plan.is_active) ?? plans[0]
      set({ ...profile, plans, activePlanId: active?.id, isInitialized: true })
    } catch {
      set({ isInitialized: true })
    }
  },
}))
