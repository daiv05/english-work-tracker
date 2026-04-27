import { db } from '#/db/index'
import type { StudyPlan } from '#/db/index'
import type { WeeklyPlanTemplate } from './types'

const DEFAULT_PLAN_TEMPLATE: WeeklyPlanTemplate = {
  monday: [
    {
      block: 'Listening',
      minutes: 40,
      label: 'Series or YouTube with English subtitles',
    },
    {
      block: 'Shadowing',
      minutes: 20,
      label: 'Repeat and imitate a short scene',
    },
    { block: 'Vocabulary', minutes: 15, label: 'Anki with work-ready phrases' },
    {
      block: 'Speaking',
      minutes: 20,
      label: 'Describe work done today and tomorrow plan',
    },
  ],
  tuesday: [
    {
      block: 'Reading',
      minutes: 30,
      label: 'Technical docs, blog posts, or articles',
    },
    {
      block: 'Listening',
      minutes: 20,
      label: 'Professional talk, tutorial, or conference clip',
    },
    { block: 'Shadowing', minutes: 20, label: 'Repeat selected segments' },
    { block: 'Vocabulary', minutes: 15, label: 'Anki review' },
  ],
  wednesday: [
    { block: 'Listening', minutes: 25, label: 'Short audiovisual content' },
    {
      block: 'Speaking',
      minutes: 30,
      label: 'Project explanations and meeting simulations',
    },
    {
      block: 'Shadowing',
      minutes: 15,
      label: 'Pronunciation and rhythm practice',
    },
    { block: 'Vocabulary', minutes: 15, label: 'Anki review' },
  ],
  thursday: [
    {
      block: 'Listening',
      minutes: 45,
      label: 'Podcast or interview deep listening',
    },
    {
      block: 'Shadowing',
      minutes: 20,
      label: 'Repeat after subtitle-assisted replay',
    },
    { block: 'Vocabulary', minutes: 15, label: 'Anki review' },
  ],
  friday: [
    { block: 'Listening', minutes: 25, label: 'Short content intake' },
    {
      block: 'Writing',
      minutes: 30,
      label: 'Emails, reports, or technical explanations',
    },
    {
      block: 'Shadowing',
      minutes: 15,
      label: 'Sentence-level pronunciation practice',
    },
    { block: 'Vocabulary', minutes: 15, label: 'Anki review' },
  ],
  saturday: [
    {
      block: 'Listening',
      minutes: 90,
      label: 'Massive input from enjoyable long-form content',
    },
  ],
  sunday: [
    { block: 'Vocabulary', minutes: 20, label: 'Anki consolidation session' },
    {
      block: 'Listening',
      minutes: 20,
      label: 'Relaxed content, music, or podcasts',
    },
  ],
  express_day: [
    { block: 'Listening', minutes: 15, label: 'Quick video' },
    { block: 'Vocabulary', minutes: 10, label: 'Anki review' },
    { block: 'Shadowing', minutes: 5, label: 'Fast imitation drill' },
  ],
}

function buildDefaultPlan(): Omit<StudyPlan, 'id'> {
  const now = Date.now()
  return {
    name: 'Work English A2-B2',
    description: 'Default editable plan focused on work communication.',
    level_from: 'A2',
    level_to: 'B2',
    daily_goal_minutes: 90,
    template_json: JSON.stringify(DEFAULT_PLAN_TEMPLATE),
    is_active: true,
    created_at: now,
    updated_at: now,
  }
}

export const plansService = {
  async ensureDefaultPlan(): Promise<StudyPlan> {
    const allPlans = await db.plans.orderBy('created_at').toArray()
    if (allPlans.length === 0) {
      const initial = buildDefaultPlan()
      const id = await db.plans.add(initial)
      return { id: Number(id), ...initial }
    }

    const active = allPlans.find((p) => p.is_active)
    if (active) return active

    const first = allPlans[0]
    if (!first.id) {
      const initial = buildDefaultPlan()
      const id = await db.plans.add(initial)
      return { id: Number(id), ...initial }
    }
    await db.plans.update(first.id, { is_active: true, updated_at: Date.now() })
    return { ...first, is_active: true }
  },

  list(): Promise<StudyPlan[]> {
    return db.plans.orderBy('created_at').toArray()
  },

  getById(id: number): Promise<StudyPlan | undefined> {
    return db.plans.get(id)
  },

  async getActive(): Promise<StudyPlan | undefined> {
    const plans = await db.plans.toArray()
    return plans.find((p) => p.is_active)
  },

  async setActive(planId: number): Promise<void> {
    await db.transaction('rw', db.plans, async () => {
      await db.plans.toCollection().modify((p) => {
        p.is_active = false
      })
      await db.plans.update(planId, { is_active: true, updated_at: Date.now() })
    })
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
    const id = await db.plans.add({
      name: input.name,
      description: input.description,
      level_from: input.level_from ?? 'A2',
      level_to: input.level_to ?? 'B2',
      daily_goal_minutes: input.daily_goal_minutes ?? 90,
      template_json:
        input.template_json ?? JSON.stringify(DEFAULT_PLAN_TEMPLATE),
      is_active: false,
      created_at: now,
      updated_at: now,
    })
    return Number(id)
  },

  update(id: number, changes: Partial<StudyPlan>): Promise<number> {
    return db.plans.update(id, { ...changes, updated_at: Date.now() })
  },

  async delete(id: number): Promise<void> {
    const plans = await db.plans.toArray()
    if (plans.length <= 1) return

    const toDelete = plans.find((p) => p.id === id)
    if (!toDelete) return

    await db.transaction(
      'rw',
      [
        db.plans,
        db.daily_blocks,
        db.writing_entries,
        db.resource_categories,
        db.resources,
        db.monthly_reviews,
      ],
      async () => {
        await db.daily_blocks.where('plan_id').equals(id).delete()
        await db.writing_entries.where('plan_id').equals(id).delete()
        const categories = await db.resource_categories
          .where('plan_id')
          .equals(id)
          .toArray()
        for (const category of categories) {
          if (category.id) {
            await db.resources.where('category_id').equals(category.id).delete()
          }
        }
        await db.resources.where('plan_id').equals(id).delete()
        await db.resource_categories.where('plan_id').equals(id).delete()
        await db.monthly_reviews.where('plan_id').equals(id).delete()
        await db.plans.delete(id)

        if (toDelete.is_active) {
          const fallback = await db.plans.orderBy('created_at').first()
          if (fallback?.id) {
            await db.plans.update(fallback.id, {
              is_active: true,
              updated_at: Date.now(),
            })
          }
        }
      },
    )
  },
}

export function getDefaultPlanTemplate(): WeeklyPlanTemplate {
  return JSON.parse(JSON.stringify(DEFAULT_PLAN_TEMPLATE)) as WeeklyPlanTemplate
}
