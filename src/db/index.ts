import Dexie from 'dexie'
import type { Table } from 'dexie'

export type ActivityType =
  | 'Listening'
  | 'Reading'
  | 'Writing'
  | 'Speaking'
  | 'Shadowing'
  | 'Vocabulary'
  | 'Other'

export interface DailyBlock {
  id?: number
  plan_id: number
  date: string // YYYY-MM-DD
  start_time?: string // HH:MM optional
  type: ActivityType
  resource_id?: number
  custom_resource_text?: string
  duration_minutes: number
  notes?: string
  created_at: number // timestamp
}

export interface WritingEntry {
  id?: number
  plan_id: number
  date: string // YYYY-MM-DD
  text: string
  word_count: number
  active_time_minutes: number
  linked_block_id?: number
  prompt?: string
  created_at: number
}

export interface ResourceCategory {
  id?: number
  plan_id: number
  name: string
  created_at: number
}

export interface Resource {
  id?: number
  plan_id: number
  category_id: number
  title: string
  url?: string
  notes?: string
  tags: string[] // stored as JSON
  created_at: number
}

export interface MonthlyReview {
  id?: number
  plan_id: number
  month: string // YYYY-MM
  answers_json: string
  notes?: string
  created_at: number
}

export interface StudyPlan {
  id?: number
  name: string
  description?: string
  level_from: string
  level_to: string
  daily_goal_minutes: number
  template_json: string
  is_active: boolean
  created_at: number
  updated_at: number
}

const DEFAULT_PLAN_TEMPLATE = {
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

class EnglishDB extends Dexie {
  plans!: Table<StudyPlan>
  daily_blocks!: Table<DailyBlock>
  writing_entries!: Table<WritingEntry>
  resource_categories!: Table<ResourceCategory>
  resources!: Table<Resource>
  monthly_reviews!: Table<MonthlyReview>

  constructor() {
    super('EnglishWorkTracker')
    this.version(1).stores({
      daily_blocks: '++id, date, type, resource_id, created_at',
      writing_entries: '++id, date, linked_block_id, created_at',
      resource_categories: '++id, name',
      resources: '++id, category_id, title, created_at',
      monthly_reviews: '++id, month',
    })

    this.version(2)
      .stores({
        plans: '++id, is_active, created_at, updated_at',
        daily_blocks:
          '++id, [plan_id+date], plan_id, date, type, resource_id, created_at',
        writing_entries:
          '++id, [plan_id+date], plan_id, date, linked_block_id, created_at',
        resource_categories: '++id, [plan_id+name], plan_id, name',
        resources:
          '++id, [plan_id+category_id], plan_id, category_id, title, created_at',
        monthly_reviews: '++id, [plan_id+month], plan_id, month',
      })
      .upgrade(async (tx) => {
        const now = Date.now()
        const defaultPlanId = (await tx.table('plans').add({
          name: 'Work English A2-B2',
          description: 'Default editable plan focused on work communication.',
          level_from: 'A2',
          level_to: 'B2',
          daily_goal_minutes: 90,
          template_json: JSON.stringify(DEFAULT_PLAN_TEMPLATE),
          is_active: true,
          created_at: now,
          updated_at: now,
        })) as number

        await tx
          .table('daily_blocks')
          .toCollection()
          .modify((block: Partial<DailyBlock>) => {
            block.plan_id = defaultPlanId
          })

        await tx
          .table('writing_entries')
          .toCollection()
          .modify((entry: Partial<WritingEntry>) => {
            entry.plan_id = defaultPlanId
          })

        await tx
          .table('resource_categories')
          .toCollection()
          .modify((category: Partial<ResourceCategory>) => {
            category.plan_id = defaultPlanId
          })

        await tx
          .table('resources')
          .toCollection()
          .modify((resource: Partial<Resource>) => {
            resource.plan_id = defaultPlanId
          })

        await tx
          .table('monthly_reviews')
          .toCollection()
          .modify((review: Partial<MonthlyReview>) => {
            review.plan_id = defaultPlanId
          })
      })
  }
}

export const db = new EnglishDB()
