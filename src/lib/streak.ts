import { blocksService } from '#/services/blocks'

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

export async function getDailyTotals(
  dates: string[],
  planId: number,
): Promise<Record<string, number>> {
  return blocksService.getTotalMinutesForDates(planId, dates)
}

export async function calculateStreak(
  planId: number,
  minimumMinutes: number,
): Promise<number> {
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const date = i === 0 ? todayStr() : subtractDays(todayStr(), i)
    const total = await blocksService.getTotalMinutesForDate(planId, date)
    if (total >= minimumMinutes) {
      streak++
    } else {
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
