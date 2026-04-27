import { createFileRoute, Link } from '@tanstack/react-router'
import { ProgressBar } from '#/components/ui/ProgressBar'
import { typeConfig } from '#/components/ui/ActivityTypeChip'
import {
  useTodayStats,
  useStreak,
  useWeeklyProgress,
  useBlocksForDate,
} from '#/db/hooks'
import { useProfileStore } from '#/store/profile'
import { todayStr } from '#/lib/streak'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
  let barColor = 'bg-[#e0e3e5]'
  if (minutes >= goal) barColor = 'bg-[#006c49]'
  else if (minutes >= 30) barColor = 'bg-amber-400'
  else if (minutes > 0) barColor = 'bg-[#4edea3]/60'

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <span className="text-[10px] font-medium text-[#76777d] h-3.5 leading-none">
        {minutes > 0 ? `${minutes}m` : ''}
      </span>
      <div className="w-full flex flex-col justify-end h-16 bg-[#f2f4f6] rounded-full overflow-hidden">
        <div
          className={`w-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ height: `${Math.max(pct, minutes > 0 ? 8 : 0)}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-medium leading-none ${
          isToday ? 'text-[#006c49] font-bold' : 'text-[#76777d]'
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
  const { username, goalMinutesPerDay, plans, activePlanId } = useProfileStore()
  const activePlan = plans.find((plan) => plan.id === activePlanId)

  const goal = activePlan?.daily_goal_minutes ?? goalMinutesPerDay
  const pct = Math.min(100, Math.round((minutes / goal) * 100))
  const remaining = Math.max(0, goal - minutes)

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#76777d] mb-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h1 className="text-2xl font-bold text-[#191c1e]">
          {getGreeting()}, {username} 👋
        </h1>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Today's Progress — spans 8 cols */}
        <div className="md:col-span-8 bg-white border border-[#c6c6cd] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#76777d] mb-2">
                Today's Progress
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-[#191c1e] tabular-nums">{minutes}</span>
                <span className="text-lg text-[#76777d] font-medium">/ {goal} min</span>
              </div>
              <p className="text-sm text-[#76777d] mt-1">
                {blockCount} block{blockCount !== 1 ? 's' : ''} logged
                {remaining > 0 && (
                  <span className="ml-2 text-[#45464d]">· {remaining} min to go</span>
                )}
              </p>
              {activePlan && (
                <p className="text-xs text-[#76777d] mt-1">Plan: {activePlan.name}</p>
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
            <p className="text-xs text-[#76777d]">{pct}% of daily goal</p>
            {pct >= 100 && (
              <p className="text-xs text-[#006c49] font-semibold">✓ Goal reached!</p>
            )}
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Link
              to="/log"
              className="flex items-center justify-center gap-2 bg-[#0f172a] text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-[#1e293b] transition-colors"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Log Activity
            </Link>
            <Link
              to="/writing"
              className="flex items-center justify-center gap-2 bg-[#006c49] text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-[#005236] transition-colors"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Writing Mode
            </Link>
          </div>
        </div>

        {/* Streak card — spans 4 cols */}
        <div className="md:col-span-4 bg-[#0f172a] text-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.1)] flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">
              Current Streak
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold tabular-nums">{streak}</span>
              <span className="text-lg text-white/60 ml-1">days</span>
            </div>
            <p className="text-sm text-white/50 mt-2">
              {streak === 0 ? 'Log 30+ min to start' : streak === 1 ? 'Keep going!' : 'Consistent! 🎯'}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold">Valid day</p>
            <p className="text-xs text-white/50 mt-0.5">≥ 30 min accumulated</p>
          </div>
        </div>

        {/* Weekly Overview — spans 5 cols */}
        <div className="md:col-span-5 bg-white border border-[#c6c6cd] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#76777d] mb-4">
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
          <div className="flex gap-3 mt-4 text-[11px] text-[#76777d]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006c49] inline-block" /> Goal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Partial
            </span>
          </div>
        </div>

        {/* Today's Activity — spans 7 cols */}
        <div className="md:col-span-7 bg-white border border-[#c6c6cd] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#76777d]">
              Today's Activity
            </p>
            <Link to="/log" className="text-xs text-[#3980f4] font-semibold hover:underline">
              View all →
            </Link>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#f2f4f6] flex items-center justify-center mb-3">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#76777d" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-[#45464d] font-medium">No activity yet today</p>
              <p className="text-xs text-[#76777d] mt-1 mb-3">Start with a quick block — takes 10 seconds</p>
              <Link
                to="/log"
                className="inline-flex items-center gap-1.5 text-sm text-[#006c49] font-semibold hover:underline"
              >
                Log first block →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#f2f4f6]">
              {blocks.slice(0, 5).map((block) => (
                <li key={block.id} className="py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeConfig[block.type].bg}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${typeConfig[block.type].dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-[#191c1e]">{block.type}</span>
                      {block.start_time && (
                        <span className="text-xs text-[#76777d]">· {formatTime(block.start_time)}</span>
                      )}
                    </div>
                    {(block.custom_resource_text || block.notes) && (
                      <p className="text-xs text-[#76777d] truncate">
                        {block.custom_resource_text || block.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-[#006c49] whitespace-nowrap">
                    {block.duration_minutes}m
                  </span>
                </li>
              ))}
              {blocks.length > 5 && (
                <li className="pt-3 text-center">
                  <Link to="/log" className="text-xs text-[#3980f4] font-medium hover:underline">
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
