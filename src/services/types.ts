import type { ActivityType } from '#/db/index'

// Shared domain types — same shape whether coming from local DB or a future REST API.
// When migrating to API, import these types in your API client and return them from fetch calls.

export type { ActivityType, DailyBlock, WritingEntry, ResourceCategory, Resource, MonthlyReview } from '#/db/index'
export type { StudyPlan } from '#/db/index'

export interface PlanTemplateBlock {
  block: ActivityType
  minutes: number
  label: string
}

export type WeeklyPlanTemplate = Record<string, PlanTemplateBlock[]>

export interface UserProfile {
  username: string
  avatarData?: string // base64 data URL
  goalMinutesPerDay: number
}
