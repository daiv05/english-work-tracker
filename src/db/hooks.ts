import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '#/db/index'
import { todayStr, calculateStreak, getWeeklyTotalsForPlan } from '#/lib/streak'
import { useProfileStore } from '#/store/profile'

export function useBlocksForDate(date: string) {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return (
    useLiveQuery(
      () => {
        if (!activePlanId) return []
        return db.daily_blocks
          .where('[plan_id+date]')
          .equals([activePlanId, date])
          .sortBy('created_at')
      },
      [date, activePlanId],
    ) ?? []
  )
}

export function useTodayStats() {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useLiveQuery(async () => {
    if (!activePlanId) return { minutes: 0, blockCount: 0 }
    const today = todayStr()
    const blocks = await db.daily_blocks
      .where('[plan_id+date]')
      .equals([activePlanId, today])
      .toArray()
    const minutes = blocks.reduce((sum, b) => sum + b.duration_minutes, 0)
    return { minutes, blockCount: blocks.length }
  }, [activePlanId]) ?? { minutes: 0, blockCount: 0 }
}

export function useStreak() {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useLiveQuery(() => {
    if (!activePlanId) return 0
    return calculateStreak(activePlanId)
  }, [activePlanId]) ?? 0
}

export function useWeeklyProgress() {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useLiveQuery(() => {
    if (!activePlanId) return []
    return getWeeklyTotalsForPlan(activePlanId)
  }, [activePlanId]) ?? []
}

export function useWritingHistory() {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return (
    useLiveQuery(
      async () => {
        if (!activePlanId) return []
        const entries = await db.writing_entries.where('plan_id').equals(activePlanId).toArray()
        return entries.sort((a, b) => b.created_at - a.created_at)
      },
      [activePlanId],
    ) ?? []
  )
}

export function useWritingEntriesForDate(date: string) {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return (
    useLiveQuery(
      () => {
        if (!activePlanId) return []
        return db.writing_entries
          .where('[plan_id+date]')
          .equals([activePlanId, date])
          .sortBy('created_at')
      },
      [date, activePlanId],
    ) ?? []
  )
}

export function useResourceCategories() {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return (
    useLiveQuery(() => {
      if (!activePlanId) return []
      return db.resource_categories.where('plan_id').equals(activePlanId).sortBy('name')
    }, [activePlanId]) ??
    []
  )
}

export function useResources() {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return (
    useLiveQuery(() => {
      if (!activePlanId) return []
      return db.resources.where('plan_id').equals(activePlanId).sortBy('title')
    }, [activePlanId]) ?? []
  )
}

export function useResourcesForCategory(categoryId: number) {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return (
    useLiveQuery(
      () => {
        if (!activePlanId) return []
        return db.resources
          .where('[plan_id+category_id]')
          .equals([activePlanId, categoryId])
          .toArray()
      },
      [categoryId, activePlanId],
    ) ?? []
  )
}
