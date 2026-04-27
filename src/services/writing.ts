// Service layer for writing_entries.
// To migrate to API: replace each function body with a fetch() call to your backend.

import { db, type WritingEntry } from '#/db/index'

export const writingService = {
  getForDate(planId: number, date: string): Promise<WritingEntry[]> {
    return db.writing_entries.where('[plan_id+date]').equals([planId, date]).sortBy('created_at')
  },

  async getAll(planId: number): Promise<WritingEntry[]> {
    const entries = await db.writing_entries.where('plan_id').equals(planId).toArray()
    return entries.sort((a, b) => b.created_at - a.created_at)
  },

  create(entry: Omit<WritingEntry, 'id'>): Promise<number> {
    return db.writing_entries.add(entry) as Promise<number>
  },

  update(id: number, changes: Partial<WritingEntry>): Promise<number> {
    return db.writing_entries.update(id, changes)
  },

  delete(id: number): Promise<void> {
    return db.writing_entries.delete(id)
  },
}
