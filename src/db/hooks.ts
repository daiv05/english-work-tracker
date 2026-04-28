import { useEffect, useState, useCallback } from 'react'
import { blocksService } from '#/services/blocks'
import { writingService } from '#/services/writing'
import { categoriesService, resourcesService } from '#/services/resources'
import { todayStr, calculateStreak, getWeeklyTotalsForPlan } from '#/lib/streak'
import { useProfileStore } from '#/store/profile'
import type { DailyBlock, WritingEntry, ResourceCategory, Resource } from '#/db/index'

function useApiData<T>(
  fetcher: () => Promise<T>,
  initial: T,
  deps: unknown[],
): T {
  const [data, setData] = useState<T>(initial)
  const fetch = useCallback(fetcher, deps) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false
    fetch().then((result) => {
      if (!cancelled) setData(result)
    }).catch(() => {/* ignore */})
    return () => { cancelled = true }
  }, [fetch])
  return data
}

export function useBlocksForDate(date: string): DailyBlock[] {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useApiData(
    () => activePlanId ? blocksService.getForDate(activePlanId, date) : Promise.resolve([]),
    [],
    [activePlanId, date],
  )
}

export function useTodayStats(): { minutes: number; blockCount: number } {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useApiData(
    async () => {
      if (!activePlanId) return { minutes: 0, blockCount: 0 }
      const today = todayStr()
      const blocks = await blocksService.getForDate(activePlanId, today)
      const minutes = blocks.reduce((sum, b) => sum + b.duration_minutes, 0)
      return { minutes, blockCount: blocks.length }
    },
    { minutes: 0, blockCount: 0 },
    [activePlanId],
  )
}

export function useStreak(): number {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  const plans = useProfileStore((s) => s.plans)
  const goalMinutes = plans.find((p) => p.id === activePlanId)?.daily_goal_minutes ?? 60
  return useApiData(
    () => activePlanId ? calculateStreak(activePlanId, goalMinutes) : Promise.resolve(0),
    0,
    [activePlanId, goalMinutes],
  )
}

export function useWeeklyProgress(): { date: string; minutes: number }[] {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useApiData(
    () => activePlanId ? getWeeklyTotalsForPlan(activePlanId) : Promise.resolve([]),
    [],
    [activePlanId],
  )
}

export function useWritingHistory(): WritingEntry[] {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useApiData(
    () => activePlanId ? writingService.getAll(activePlanId) : Promise.resolve([]),
    [],
    [activePlanId],
  )
}

export function useWritingEntriesForDate(date: string): WritingEntry[] {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useApiData(
    () => activePlanId ? writingService.getForDate(activePlanId, date) : Promise.resolve([]),
    [],
    [activePlanId, date],
  )
}

export function useResourceCategories(): ResourceCategory[] {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useApiData(
    () => activePlanId ? categoriesService.getAll(activePlanId) : Promise.resolve([]),
    [],
    [activePlanId],
  )
}

export function useResources(): Resource[] {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useApiData(
    () => activePlanId ? resourcesService.getAll(activePlanId) : Promise.resolve([]),
    [],
    [activePlanId],
  )
}

export function useResourcesForCategory(categoryId: number): Resource[] {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  return useApiData(
    () => activePlanId ? resourcesService.getForCategory(activePlanId, categoryId) : Promise.resolve([]),
    [],
    [activePlanId, categoryId],
  )
}
