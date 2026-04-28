import { apiFetch } from '#/lib/api'
import { useAuthStore } from '#/store/auth'
import type { WritingEntry } from '#/db/index'

function token() {
  return useAuthStore.getState().accessToken ?? undefined
}

interface ApiEntry {
  id: number
  plan_id: number
  date: string
  text: string
  word_count: number
  active_time_minutes: number
  linked_block_id: number | null
  prompt: string | null
  created_at: number
}

function toEntry(e: ApiEntry): WritingEntry {
  return {
    id: e.id,
    plan_id: e.plan_id,
    date: e.date,
    text: e.text,
    word_count: e.word_count,
    active_time_minutes: e.active_time_minutes,
    linked_block_id: e.linked_block_id ?? undefined,
    prompt: e.prompt ?? undefined,
    created_at: e.created_at,
  }
}

export const writingService = {
  async getForDate(planId: number, date: string): Promise<WritingEntry[]> {
    const entries = await apiFetch<ApiEntry[]>(`/writing?plan_id=${planId}&date=${date}`, { token: token() })
    return entries.map(toEntry)
  },

  async getAll(planId: number): Promise<WritingEntry[]> {
    const entries = await apiFetch<ApiEntry[]>(`/writing?plan_id=${planId}`, { token: token() })
    return entries.map(toEntry).sort((a, b) => b.created_at - a.created_at)
  },

  async create(entry: Omit<WritingEntry, 'id'>): Promise<number> {
    const created = await apiFetch<ApiEntry>('/writing', {
      method: 'POST',
      token: token(),
      body: JSON.stringify(entry),
    })
    return created.id
  },

  async update(id: number, changes: Partial<WritingEntry>): Promise<number> {
    await apiFetch(`/writing/${id}`, { method: 'PUT', token: token(), body: JSON.stringify(changes) })
    return 1
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/writing/${id}`, { method: 'DELETE', token: token() })
  },
}
