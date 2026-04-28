import { apiFetch } from '#/lib/api'
import { useAuthStore } from '#/store/auth'
import type { DailyBlock } from '#/db/index'

function token() {
  return useAuthStore.getState().accessToken ?? undefined
}

interface ApiBlock {
  id: number
  plan_id: number
  date: string
  start_time: string | null
  type: string
  resource_id: number | null
  custom_resource_text: string | null
  duration_minutes: number
  notes: string | null
  created_at: number
}

function toBlock(b: ApiBlock): DailyBlock {
  return {
    id: b.id,
    plan_id: b.plan_id,
    date: b.date,
    start_time: b.start_time ?? undefined,
    type: b.type as DailyBlock['type'],
    resource_id: b.resource_id ?? undefined,
    custom_resource_text: b.custom_resource_text ?? undefined,
    duration_minutes: b.duration_minutes,
    notes: b.notes ?? undefined,
    created_at: b.created_at,
  }
}

export const blocksService = {
  async getForDate(planId: number, date: string): Promise<DailyBlock[]> {
    const blocks = await apiFetch<ApiBlock[]>(`/blocks?plan_id=${planId}&date=${date}`, { token: token() })
    return blocks.map(toBlock)
  },

  async getTotalMinutesForDate(planId: number, date: string): Promise<number> {
    const blocks = await blocksService.getForDate(planId, date)
    return blocks.reduce((sum, b) => sum + b.duration_minutes, 0)
  },

  async getTotalMinutesForDates(planId: number, dates: string[]): Promise<Record<string, number>> {
    if (dates.length === 0) return {}
    const query = dates.map((d) => `dates=${d}`).join('&')
    const rows = await apiFetch<{ date: string; total_minutes: number }[]>(
      `/blocks/totals?plan_id=${planId}&${query}`,
      { token: token() },
    )
    const result: Record<string, number> = {}
    for (const row of rows) {
      result[row.date] = row.total_minutes
    }
    return result
  },

  async create(block: Omit<DailyBlock, 'id'>): Promise<number> {
    const created = await apiFetch<ApiBlock>('/blocks', {
      method: 'POST',
      token: token(),
      body: JSON.stringify(block),
    })
    return created.id
  },

  async update(id: number, changes: Partial<DailyBlock>): Promise<number> {
    await apiFetch(`/blocks/${id}`, { method: 'PUT', token: token(), body: JSON.stringify(changes) })
    return 1
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/blocks/${id}`, { method: 'DELETE', token: token() })
  },
}
