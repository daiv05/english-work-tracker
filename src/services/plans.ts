import { apiFetch } from '#/lib/api'
import { useAuthStore } from '#/store/auth'
import type { StudyPlan } from '#/db/index'
import type { WeeklyPlanTemplate } from './types'

function token() {
  return useAuthStore.getState().accessToken ?? undefined
}

interface ApiPlan {
  id: number
  name: string
  description: string | null
  level_from: string
  level_to: string
  daily_goal_minutes: number
  template_json: string
  is_active: boolean
  created_at: number
  updated_at: number
}

function toStudyPlan(p: ApiPlan): StudyPlan {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    level_from: p.level_from,
    level_to: p.level_to,
    daily_goal_minutes: p.daily_goal_minutes,
    template_json: p.template_json,
    is_active: p.is_active,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

const DEFAULT_PLAN_TEMPLATE: WeeklyPlanTemplate = {
  monday: [
    { block: 'Listening', minutes: 40, label: 'Series or YouTube with English subtitles' },
    { block: 'Shadowing', minutes: 20, label: 'Repeat and imitate a short scene' },
    { block: 'Vocabulary', minutes: 15, label: 'Anki with work-ready phrases' },
    { block: 'Speaking', minutes: 20, label: 'Describe work done today and tomorrow plan' },
  ],
  tuesday: [
    { block: 'Reading', minutes: 30, label: 'Technical docs, blog posts, or articles' },
    { block: 'Listening', minutes: 20, label: 'Professional talk, tutorial, or conference clip' },
    { block: 'Shadowing', minutes: 20, label: 'Repeat selected segments' },
    { block: 'Vocabulary', minutes: 15, label: 'Anki review' },
  ],
  wednesday: [
    { block: 'Listening', minutes: 25, label: 'Short audiovisual content' },
    { block: 'Speaking', minutes: 30, label: 'Project explanations and meeting simulations' },
    { block: 'Shadowing', minutes: 15, label: 'Pronunciation and rhythm practice' },
    { block: 'Vocabulary', minutes: 15, label: 'Anki review' },
  ],
  thursday: [
    { block: 'Listening', minutes: 45, label: 'Podcast or interview deep listening' },
    { block: 'Shadowing', minutes: 20, label: 'Repeat after subtitle-assisted replay' },
    { block: 'Vocabulary', minutes: 15, label: 'Anki review' },
  ],
  friday: [
    { block: 'Listening', minutes: 25, label: 'Short content intake' },
    { block: 'Writing', minutes: 30, label: 'Emails, reports, or technical explanations' },
    { block: 'Shadowing', minutes: 15, label: 'Sentence-level pronunciation practice' },
    { block: 'Vocabulary', minutes: 15, label: 'Anki review' },
  ],
  saturday: [
    { block: 'Listening', minutes: 90, label: 'Massive input from enjoyable long-form content' },
  ],
  sunday: [
    { block: 'Vocabulary', minutes: 20, label: 'Anki consolidation session' },
    { block: 'Listening', minutes: 20, label: 'Relaxed content, music, or podcasts' },
  ],
  express_day: [
    { block: 'Listening', minutes: 15, label: 'Quick video' },
    { block: 'Vocabulary', minutes: 10, label: 'Anki review' },
    { block: 'Shadowing', minutes: 5, label: 'Fast imitation drill' },
  ],
}

export const plansService = {
  async ensureDefaultPlan(): Promise<StudyPlan> {
    const plans = await plansService.list()
    if (plans.length > 0) {
      return plans.find((p) => p.is_active) ?? plans[0]
    }
    const now = Date.now()
    const plan = await apiFetch<ApiPlan>('/plans', {
      method: 'POST',
      token: token(),
      body: JSON.stringify({
        name: 'Work English A2-B2',
        description: 'Default editable plan focused on work communication.',
        level_from: 'A2',
        level_to: 'B2',
        daily_goal_minutes: 90,
        template_json: JSON.stringify(DEFAULT_PLAN_TEMPLATE),
        created_at: now,
        updated_at: now,
      }),
    })
    await apiFetch(`/plans/${plan.id}/activate`, { method: 'POST', token: token() })
    return toStudyPlan({ ...plan, is_active: true })
  },

  async list(): Promise<StudyPlan[]> {
    const plans = await apiFetch<ApiPlan[]>('/plans', { token: token() })
    return plans.map(toStudyPlan)
  },

  async getById(id: number): Promise<StudyPlan | undefined> {
    try {
      const plan = await apiFetch<ApiPlan>(`/plans/${id}`, { token: token() })
      return toStudyPlan(plan)
    } catch {
      return undefined
    }
  },

  async setActive(planId: number): Promise<void> {
    await apiFetch(`/plans/${planId}/activate`, { method: 'POST', token: token() })
  },

  async create(input: {
    name: string
    description?: string
    level_from?: string
    level_to?: string
    daily_goal_minutes?: number
    template_json?: string
  }): Promise<number> {
    const now = Date.now()
    const plan = await apiFetch<ApiPlan>('/plans', {
      method: 'POST',
      token: token(),
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        level_from: input.level_from ?? 'A2',
        level_to: input.level_to ?? 'B2',
        daily_goal_minutes: input.daily_goal_minutes ?? 90,
        template_json: input.template_json ?? JSON.stringify(DEFAULT_PLAN_TEMPLATE),
        created_at: now,
        updated_at: now,
      }),
    })
    return plan.id
  },

  async update(id: number, changes: Partial<StudyPlan>): Promise<number> {
    const body = { ...changes, updated_at: Date.now() }
    await apiFetch(`/plans/${id}`, { method: 'PUT', token: token(), body: JSON.stringify(body) })
    return 1
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/plans/${id}`, { method: 'DELETE', token: token() })
  },
}

export function getDefaultPlanTemplate(): WeeklyPlanTemplate {
  return JSON.parse(JSON.stringify(DEFAULT_PLAN_TEMPLATE)) as WeeklyPlanTemplate
}
