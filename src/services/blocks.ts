// Service layer for daily_blocks.
// To migrate to API: replace each function body with a fetch() call to your backend.
// The call signatures and return types must stay the same.

import { db, type DailyBlock } from '#/db/index'

export const blocksService = {
  getForDate(planId: number, date: string): Promise<DailyBlock[]> {
    return db.daily_blocks.where('[plan_id+date]').equals([planId, date]).sortBy('created_at')
  },

  async getTotalMinutesForDate(planId: number, date: string): Promise<number> {
    const blocks = await db.daily_blocks.where('[plan_id+date]').equals([planId, date]).toArray()
    return blocks.reduce((sum, b) => sum + b.duration_minutes, 0)
  },

  async getTotalMinutesForDates(
    planId: number,
    dates: string[],
  ): Promise<Record<string, number>> {
    const datesSet = new Set(dates)
    const blocks = await db.daily_blocks
      .where('plan_id')
      .equals(planId)
      .and((block) => datesSet.has(block.date))
      .toArray()
    const totals: Record<string, number> = {}
    for (const b of blocks) {
      totals[b.date] = (totals[b.date] ?? 0) + b.duration_minutes
    }
    return totals
  },

  create(block: Omit<DailyBlock, 'id'>): Promise<number> {
    return db.daily_blocks.add(block) as Promise<number>
  },

  update(id: number, changes: Partial<DailyBlock>): Promise<number> {
    return db.daily_blocks.update(id, changes)
  },

  delete(id: number): Promise<void> {
    return db.daily_blocks.delete(id)
  },
}
