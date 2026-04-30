import { useMemo, useState, useCallback, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ProgressBar } from '#/components/ui/ProgressBar'
import { Modal } from '#/components/ui/Modal'
import { typeConfig } from '#/components/ui/ActivityTypeChip'
import {
  useTodayStats,
  useStreak,
  useWeeklyProgress,
  useBlocksForDate,
  useResources,
  useWritingEntriesForDate,
} from '#/db/hooks'
import { useProfileStore } from '#/store/profile'
import { todayStr } from '#/lib/streak'
import { activityTipsService } from '#/services/admin'
import type { ActivityTipItem } from '#/services/admin'
import type { WeeklyPlanTemplate, PlanTemplateBlock } from '#/services/types'
import type { DailyBlock, Resource } from '#/db/index'

function useActivityTips(): ActivityTipItem[] {
  const [tips, setTips] = useState<ActivityTipItem[]>([])
  useEffect(() => {
    activityTipsService.getAll().then(setTips).catch(() => {/* non-critical */})
  }, [])
  return tips
}

export const Route = createFileRoute('/app/')({
  component: Dashboard,
})

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getRecommendedResources(activityType: string, resources: Resource[]): Resource[] {
  const tag = activityType.toLowerCase()
  const matched = resources.filter((r) => r.tags.some((t) => t.toLowerCase() === tag))
  return matched.length > 0 ? matched : resources.slice(0, 3)
}

function PlanItemModal({
  item,
  resources,
  activityTips,
  onClose,
}: {
  item: PlanTemplateBlock | null
  resources: Resource[]
  activityTips: ActivityTipItem[]
  onClose: () => void
}) {
  if (!item) return null
  const cfg = typeConfig[item.block] ?? typeConfig.Other
  const tips = activityTips.find((t) => t.activity_type === item.block)
    ?? activityTips.find((t) => t.activity_type === 'Other')
    ?? null
  const recommended = getRecommendedResources(item.block, resources)

  return (
    <Modal
      open
      onClose={onClose}
      title={item.label || item.block}
    >
      {/* Activity header */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
          <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{item.block}</p>
          <p className="text-xs text-outline">{item.minutes} min planned</p>
        </div>
      </div>

      {/* How to do it */}
      {tips && (
        <section className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-2">
            How to approach this
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">{tips.how}</p>
        </section>
      )}

      {/* Tips */}
      {tips && tips.tips.length > 0 && (
        <section className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-2">
            Tips
          </p>
          <ul className="space-y-2">
            {tips.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-on-surface-variant">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recommended resources */}
      {recommended.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-2">
            Recommended resources
          </p>
          <ul className="space-y-2">
            {recommended.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-2.5 rounded-xl border border-surface-high bg-surface-low px-3 py-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-surface-high flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-tertiary hover:underline truncate block"
                    >
                      {r.title}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-on-surface truncate">{r.title}</p>
                  )}
                  {r.notes && (
                    <p className="text-xs text-outline mt-0.5 line-clamp-2">{r.notes}</p>
                  )}
                  {r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {r.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-high text-outline font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Link
            to="/app/resources"
            className="mt-3 block text-center text-xs text-tertiary font-semibold hover:underline"
            onClick={onClose}
          >
            View all resources →
          </Link>
        </section>
      )}
    </Modal>
  )
}

function TodaysPlanCard({
  activePlanTemplate,
  dayName,
  blocks,
  resources,
  activityTips,
}: {
  activePlanTemplate: WeeklyPlanTemplate | null
  dayName: string
  blocks: DailyBlock[]
  resources: Resource[]
  activityTips: ActivityTipItem[]
}) {
  const [selectedItem, setSelectedItem] = useState<PlanTemplateBlock | null>(null)
  const handleClose = useCallback(() => setSelectedItem(null), [])

  const plannedBlocks: PlanTemplateBlock[] = activePlanTemplate?.[dayName] ?? []

  // Sum logged minutes per activity type
  const loggedByType: Record<string, number> = {}
  for (const b of blocks) {
    loggedByType[b.type] = (loggedByType[b.type] ?? 0) + b.duration_minutes
  }

  const totalPlanned = plannedBlocks.reduce((s, b) => s + b.minutes, 0)
  const totalLogged = Math.min(
    plannedBlocks.reduce((s, b) => s + Math.min(loggedByType[b.block] ?? 0, b.minutes), 0),
    totalPlanned,
  )
  const blocksDone = plannedBlocks.filter((b) => (loggedByType[b.block] ?? 0) >= b.minutes).length

  const dayLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1)

  return (
    <>
      <PlanItemModal item={selectedItem} resources={resources} activityTips={activityTips} onClose={handleClose} />

      <div className="md:col-span-12 bg-white border border-outline-variant rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-1">
              Today's Plan
            </p>
            <span className="inline-block text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
              {dayLabel}
            </span>
          </div>
          {totalPlanned > 0 && (
            <p className="text-xs text-outline">
              <span className="font-semibold text-on-surface">{totalLogged}</span>
              {' / '}{totalPlanned} min
              {' · '}
              <span className="font-semibold text-on-surface">{blocksDone}</span>
              /{plannedBlocks.length} blocks done
            </p>
          )}
        </div>

        {plannedBlocks.length === 0 ? (
          <p className="text-sm text-outline text-center py-4">
            No plan template for {dayLabel}. You can set one in the{' '}
            <Link to="/app/plan" className="text-tertiary font-semibold hover:underline">
              Plan Builder
            </Link>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {plannedBlocks.map((b, i) => {
              const logged = loggedByType[b.block] ?? 0
              const done = logged >= b.minutes
              const pct = Math.min(100, b.minutes > 0 ? (logged / b.minutes) * 100 : 0)
              const cfg = typeConfig[b.block] ?? typeConfig.Other
              return (
                <li
                  key={i}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedItem(b)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedItem(b)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors cursor-pointer hover:border-outline-variant hover:shadow-sm ${
                    done
                      ? 'bg-secondary/5 border-secondary/20'
                      : 'bg-surface-low border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-on-surface truncate">
                        {b.label || b.block}
                      </span>
                      {done ? (
                        <span className="text-secondary shrink-0">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-[10px] text-outline whitespace-nowrap shrink-0">
                          {logged > 0 ? `${logged}/` : ''}{b.minutes}m
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1 rounded-full bg-surface-high overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-secondary' : 'bg-secondary/40'}`}
                        style={{ width: `${Math.max(pct, logged > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatTime(t?: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function WeeklyBar({
  minutes,
  label,
  goal,
  isToday,
}: {
  minutes: number
  label: string
  goal: number
  isToday: boolean
}) {
  const pct = Math.min(100, goal > 0 ? (minutes / goal) * 100 : 0)
  let barColor = 'bg-track'
  if (minutes >= goal) barColor = 'bg-secondary'
  else if (minutes >= 30) barColor = 'bg-amber-400'
  else if (minutes > 0) barColor = 'bg-secondary-light/60'

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <span className="text-[10px] font-medium text-outline h-3.5 leading-none">
        {minutes > 0 ? `${minutes}m` : ''}
      </span>
      <div className="w-full flex flex-col justify-end h-16 bg-surface-low rounded-full overflow-hidden">
        <div
          className={`w-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ height: `${Math.max(pct, minutes > 0 ? 8 : 0)}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-medium leading-none ${
          isToday ? 'text-secondary font-bold' : 'text-outline'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function Dashboard() {
  const today = todayStr()
  const { minutes, blockCount } = useTodayStats()
  const streak = useStreak()
  const weekly = useWeeklyProgress()
  const blocks = useBlocksForDate(today)
  const writingToday = useWritingEntriesForDate(today)
  const resources = useResources()
  const activityTips = useActivityTips()
  const { username, plans, activePlanId } = useProfileStore()
  const activePlan = plans.find((plan) => plan.id === activePlanId)

  const goal = activePlan?.daily_goal_minutes ?? 0

  const activePlanTemplate: WeeklyPlanTemplate | null = useMemo(() => {
    if (!activePlan) return null
    try { return JSON.parse(activePlan.template_json) } catch { return null }
  }, [activePlan?.template_json])
  const todayDayName = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase()
  const pct = Math.min(100, Math.round((minutes / goal) * 100))
  const remaining = Math.max(0, goal - minutes)
  const hasReviewedPlan =
    !!activePlan && activePlan.updated_at > activePlan.created_at
  const onboardingItems = [
    {
      label: 'Review your daily goal in Plan Builder',
      done: hasReviewedPlan,
      to: '/app/plan' as const,
      cta: 'Open Plan Builder',
    },
    {
      label: 'Log your first activity block',
      done: blockCount > 0,
      to: '/app/log' as const,
      cta: 'Log activity',
    },
    {
      label: 'Save your first Writing entry',
      done: writingToday.length > 0,
      to: '/app/writing' as const,
      cta: 'Open Writing Mode',
    },
    {
      label: 'Add your first resource link',
      done: resources.length > 0,
      to: '/app/resources' as const,
      cta: 'Add resource',
    },
  ]
  const onboardingDone = onboardingItems.filter((item) => item.done).length
  const showOnboarding = streak === 0 && onboardingDone < onboardingItems.length

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-outline mb-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h1 className="text-2xl font-bold text-on-surface">
          {getGreeting()}, {username} 👋
        </h1>
      </div>

      {showOnboarding && (
        <section className="mb-4 bg-white border border-outline-variant rounded-2xl p-5 shadow-card">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-1">
                First Session Checklist
              </p>
              <p className="text-sm text-on-surface-variant">
                Start with these 4 steps to match your plan, activity, writing,
                and resources.
              </p>
            </div>
            <span className="text-sm font-semibold text-secondary shrink-0">
              {onboardingDone}/4
            </span>
          </div>

          <ul className="space-y-2">
            {onboardingItems.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-3 border border-surface-high rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${item.done ? 'bg-secondary' : 'bg-outline-variant'}`}
                  />
                  <span
                    className={`text-sm ${item.done ? 'text-on-surface' : 'text-on-surface-variant'}`}
                  >
                    {item.label}
                  </span>
                </div>
                {!item.done && (
                  <Link
                    to={item.to}
                    className="text-xs text-tertiary font-semibold hover:underline"
                  >
                    {item.cta}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Today's Plan - full row */}
        <TodaysPlanCard
          activePlanTemplate={activePlanTemplate}
          dayName={todayDayName}
          blocks={blocks}
          resources={resources}
          activityTips={activityTips}
        />

        {/* Today's Progress - spans 8 cols */}
        <div className="md:col-span-8 bg-white border border-outline-variant rounded-2xl p-6 shadow-card">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-2">
                Today's Progress
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-on-surface tabular-nums">
                  {minutes}
                </span>
                <span className="text-lg text-outline font-medium">
                  / {goal} min
                </span>
              </div>
              <p className="text-sm text-outline mt-1">
                {blockCount} block{blockCount !== 1 ? 's' : ''} logged
                {remaining > 0 && (
                  <span className="ml-2 text-on-surface-variant">
                    · {remaining} min to go
                  </span>
                )}
              </p>
              {activePlan && (
                <p className="text-xs text-outline mt-1">
                  Plan: {activePlan.name}
                </p>
              )}
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full text-sm font-semibold shrink-0">
                🔥 {streak} day{streak !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <ProgressBar value={pct} />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-outline">
              {pct}% of goal ({goal} min) from your active plan
            </p>
            {pct >= 100 && (
              <p className="text-xs text-secondary font-semibold">
                ✓ Goal reached!
              </p>
            )}
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Link
              to="/app/log"
              className="flex items-center justify-center gap-2 bg-primary-dark text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-primary-dark-hover transition-colors"
            >
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Log Activity
            </Link>
            <Link
              to="/app/writing"
              className="flex items-center justify-center gap-2 bg-secondary text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-secondary-hover transition-colors"
            >
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Writing Mode
            </Link>
          </div>
        </div>

        {/* Streak card - spans 4 cols */}
        <div className="md:col-span-4 bg-primary-dark text-white rounded-2xl p-6 shadow-card-dark flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
              Current Streak
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold tabular-nums">{streak}</span>
              <span className="text-lg text-white/60 ml-1">days</span>
            </div>
            <p className="text-sm text-white/50 mt-2">
              {streak === 0
                ? 'Reach your plan goal to start'
                : streak === 1
                  ? 'Keep going!'
                  : 'Consistent! 🎯'}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold">
              Valid day
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              ≥ {goal > 0 ? `${goal} min` : 'plan goal'} accumulated
            </p>
          </div>
        </div>

        {/* Weekly Overview - spans 5 cols */}
        <div className="md:col-span-5 bg-white border border-outline-variant rounded-2xl p-6 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-4">
            Weekly Overview
          </p>
          <div className="flex gap-1.5 items-end w-full overflow-hidden">
            {weekly.map((day) => {
              const jsDay = new Date(day.date + 'T00:00:00').getDay()
              const label = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1]
              return (
                <WeeklyBar
                  key={day.date}
                  minutes={day.minutes}
                  label={label}
                  goal={goal}
                  isToday={day.date === today}
                />
              )
            })}
          </div>
          <div className="flex gap-3 mt-4 text-[11px] text-outline">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block" />{' '}
              Goal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{' '}
              Partial
            </span>
          </div>
        </div>

        {/* Today's Activity - spans 7 cols */}
        <div className="md:col-span-7 bg-white border border-outline-variant rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
              Today's Activity
            </p>
            <Link
              to="/app/log"
              className="text-xs text-tertiary font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-low flex items-center justify-center mb-3">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="var(--color-outline)"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">
                No activity yet today
              </p>
              <p className="text-xs text-outline mt-1 mb-3">
                Start with a quick block - takes 10 seconds
              </p>
              <Link
                to="/app/log"
                className="inline-flex items-center gap-1.5 text-sm text-secondary font-semibold hover:underline"
              >
                Log first block →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-surface-low">
              {blocks.slice(0, 5).map((block) => (
                <li key={block.id} className="py-3 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeConfig[block.type].bg}`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${typeConfig[block.type].dot}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-on-surface">
                        {block.type}
                      </span>
                      {block.start_time && (
                        <span className="text-xs text-outline">
                          · {formatTime(block.start_time)}
                        </span>
                      )}
                    </div>
                    {(block.custom_resource_text || block.notes) && (
                      <p className="text-xs text-outline truncate">
                        {block.custom_resource_text || block.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-secondary whitespace-nowrap">
                    {block.duration_minutes}m
                  </span>
                </li>
              ))}
              {blocks.length > 5 && (
                <li className="pt-3 text-center">
                  <Link
                    to="/app/log"
                    className="text-xs text-tertiary font-medium hover:underline"
                  >
                    +{blocks.length - 5} more blocks
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
