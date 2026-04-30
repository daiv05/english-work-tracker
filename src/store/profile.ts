import { create } from 'zustand'
import { profileService } from '#/services/profile'
import { plansService } from '#/services/plans'
import type { StudyPlan, UserProfile } from '#/services/types'

let _initPromise: Promise<void> | null = null

interface ProfileStore extends UserProfile {
  plans: StudyPlan[]
  activePlanId?: number
  isInitialized: boolean
  setUsername: (username: string) => Promise<void>
  setAvatarData: (avatarData: string | undefined) => Promise<void>
  updateActivePlan: (changes: Partial<StudyPlan>) => Promise<void>
  updatePlanById: (planId: number, changes: Partial<StudyPlan>) => Promise<void>
  setActivePlan: (planId: number) => Promise<void>
  createPlan: (name: string) => Promise<number>
  deletePlan: (planId: number) => Promise<void>
  _init: () => Promise<void>
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  ...profileService.getDefaults(),
  plans: [],
  activePlanId: undefined,
  isInitialized: false,

  async setUsername(username) {
    const updated = await profileService.update({ username })
    set(updated)
  },

  async setAvatarData(avatarData) {
    const updated = await profileService.update({ avatarData })
    set(updated)
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
    if (!trimmed) return 0
    const newId = await plansService.create({ name: trimmed })
    const plans = await plansService.list()
    const active = plans.find((p) => p.is_active) ?? plans[0]
    set({ plans, activePlanId: active?.id })
    return newId
  },

  async updatePlanById(planId, changes) {
    await plansService.update(planId, changes)
    const plans = await plansService.list()
    const active = plans.find((plan) => plan.is_active) ?? plans[0]
    set({ plans, activePlanId: active?.id })
  },

  async deletePlan(planId) {
    await plansService.delete(planId)
    const plans = await plansService.list()
    const active = plans.find((p) => p.is_active) ?? plans[0]
    set({ plans, activePlanId: active?.id })
  },

  _init() {
    if (!_initPromise) {
      _initPromise = (async () => {
        try {
          const profile = await profileService.get()
          await plansService.ensureDefaultPlan()
          const plans = await plansService.list()
          const active = plans.find((plan) => plan.is_active) ?? plans[0]
          set({ ...profile, plans, activePlanId: active?.id, isInitialized: true })
        } catch {
          _initPromise = null
          set({ isInitialized: true })
        }
      })()
    }
    return _initPromise
  },
}))
