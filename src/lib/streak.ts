import { db } from '#/db/index'

export function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayStr(): string {
  return toDateStr(new Date())
}

export function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() - days)
  return toDateStr(d)
}

// Returns an object with the total minutes for each date in the given set
export async function getDailyTotals(
  dates: string[],
  planId: number,
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
}

export async function calculateStreak(
  planId: number,
  minimumMinutes = 30,
): Promise<number> {
  let streak = 0
  const cursor = todayStr()
  // Check up to 365 days back
  for (let i = 0; i < 365; i++) {
    const dateToCheck = i === 0 ? cursor : subtractDays(todayStr(), i)
    const total = await db.daily_blocks
      .where('[plan_id+date]')
      .equals([planId, dateToCheck])
      .toArray()
      .then((blocks) => blocks.reduce((sum, b) => sum + b.duration_minutes, 0))
    if (total >= minimumMinutes) {
      streak++
    } else {
      // Allow today to be incomplete without breaking streak
      if (i === 0) continue
      break
    }
  }
  return streak
}

export async function getWeeklyTotalsForPlan(
  planId: number,
): Promise<{ date: string; minutes: number }[]> {
  const today = todayStr()
  const dates = Array.from({ length: 7 }, (_, i) => subtractDays(today, 6 - i))
  const totals = await getDailyTotals(dates, planId)
  return dates.map((date) => ({ date, minutes: totals[date] ?? 0 }))
}
