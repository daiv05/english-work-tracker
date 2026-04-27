import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ActivityType } from '#/db/index'
import { getDefaultPlanTemplate } from '#/services/plans'
import type { PlanTemplateBlock, WeeklyPlanTemplate } from '#/services/types'
import { useProfileStore } from '#/store/profile'

export const Route = createFileRoute('/plan')({
  component: PlanBuilder,
})

const DAYS: Array<{ key: string; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
  { key: 'express_day', label: 'Express Day' },
]

const ACTIVITY_TYPES: ActivityType[] = [
  'Listening',
  'Reading',
  'Writing',
  'Speaking',
  'Shadowing',
  'Vocabulary',
  'Other',
]

interface PlanForm {
  name: string
  description: string
  level_from: string
  level_to: string
  daily_goal_minutes: string
  template: WeeklyPlanTemplate
}

function normalizeTemplate(value: unknown): WeeklyPlanTemplate {
  const fallback = getDefaultPlanTemplate()
  if (!value || typeof value !== 'object') return fallback

  const out: WeeklyPlanTemplate = {}
  for (const day of DAYS) {
    const rawDay = (value as Record<string, unknown>)[day.key]
    const blocks: PlanTemplateBlock[] = Array.isArray(rawDay)
      ? rawDay
          .map((item) => {
            if (!item || typeof item !== 'object') return null
            const raw = item as Record<string, unknown>
            const block = String(raw.block ?? 'Listening') as ActivityType
            if (!ACTIVITY_TYPES.includes(block)) return null
            const minutes = Number(raw.minutes)
            const label = String(raw.label ?? '').trim()
            return {
              block,
              minutes: Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 15,
              label,
            }
          })
          .filter((item): item is PlanTemplateBlock => item !== null)
      : []

    out[day.key] = blocks.length > 0 ? blocks : []
  }

  return out
}

function parseTemplate(json: string): WeeklyPlanTemplate {
  try {
    return normalizeTemplate(JSON.parse(json))
  } catch {
    return getDefaultPlanTemplate()
  }
}

function PlanBuilder() {
  const { plans, activePlanId, updateActivePlan } = useProfileStore()
  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === activePlanId),
    [plans, activePlanId],
  )

  const [form, setForm] = useState<PlanForm>({
    name: '',
    description: '',
    level_from: 'A2',
    level_to: 'B2',
    daily_goal_minutes: '90',
    template: getDefaultPlanTemplate(),
  })
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    if (!activePlan) return
    setForm({
      name: activePlan.name,
      description: activePlan.description ?? '',
      level_from: activePlan.level_from,
      level_to: activePlan.level_to,
      daily_goal_minutes: String(activePlan.daily_goal_minutes),
      template: parseTemplate(activePlan.template_json),
    })
  }, [activePlan])

  function setField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateBlock(dayKey: string, index: number, changes: Partial<PlanTemplateBlock>) {
    setForm((prev) => {
      const next = { ...prev.template }
      const currentDay = [...(next[dayKey] ?? [])]
      const existing = currentDay[index]
      if (!existing) return prev
      currentDay[index] = { ...existing, ...changes }
      next[dayKey] = currentDay
      return { ...prev, template: next }
    })
  }

  function addBlock(dayKey: string) {
    setForm((prev) => {
      const next = { ...prev.template }
      const currentDay = [...(next[dayKey] ?? [])]
      currentDay.push({ block: 'Listening', minutes: 15, label: '' })
      next[dayKey] = currentDay
      return { ...prev, template: next }
    })
  }

  function removeBlock(dayKey: string, index: number) {
    setForm((prev) => {
      const next = { ...prev.template }
      const currentDay = [...(next[dayKey] ?? [])]
      currentDay.splice(index, 1)
      next[dayKey] = currentDay
      return { ...prev, template: next }
    })
  }

  function resetTemplate() {
    if (!confirm('Reset weekly template to default A2-B2 blocks?')) return
    setField('template', getDefaultPlanTemplate())
  }

  async function savePlan() {
    if (!activePlan) return
    const goal = Number(form.daily_goal_minutes)
    if (!Number.isFinite(goal) || goal <= 0) {
      alert('Daily goal must be a positive number.')
      return
    }

    setSaving(true)
    await updateActivePlan({
      name: form.name.trim() || activePlan.name,
      description: form.description.trim() || undefined,
      level_from: form.level_from.trim() || 'A2',
      level_to: form.level_to.trim() || 'B2',
      daily_goal_minutes: Math.round(goal),
      template_json: JSON.stringify(form.template),
    })
    setSaving(false)
    setSavedAt(Date.now())
  }

  const totalMinutesPerWeek = useMemo(() => {
    return DAYS.reduce((sum, day) => {
      const dayMinutes = (form.template[day.key] ?? []).reduce(
        (s, b) => s + (Number.isFinite(b.minutes) ? b.minutes : 0),
        0,
      )
      return sum + dayMinutes
    }, 0)
  }, [form.template])

  if (!activePlan) {
    return (
      <div className="px-4 md:px-8 py-8">
        <div className="bg-white border border-[#c6c6cd] rounded-2xl p-6 text-sm text-[#45464d]">
          No active plan found.
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1e]">Plan Builder</h1>
          <p className="text-sm text-[#76777d] mt-1">
            Edit your active plan goals and weekly study blocks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetTemplate}
            className="cursor-pointer px-3 py-2 rounded-lg border border-[#c6c6cd] text-sm font-semibold text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
          >
            Reset Template
          </button>
          <button
            onClick={() => void savePlan()}
            disabled={saving}
            className="cursor-pointer px-4 py-2 rounded-lg bg-[#0f172a] text-white text-sm font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white border border-[#c6c6cd] rounded-2xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#76777d] mb-1.5">Plan Name</label>
              <input
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3980f4]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#76777d] mb-1.5">Level From</label>
              <input
                value={form.level_from}
                onChange={(e) => setField('level_from', e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3980f4]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#76777d] mb-1.5">Level To</label>
              <input
                value={form.level_to}
                onChange={(e) => setField('level_to', e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3980f4]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#76777d] mb-1.5">Daily Goal Minutes</label>
              <input
                type="number"
                min={1}
                value={form.daily_goal_minutes}
                onChange={(e) => setField('daily_goal_minutes', e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3980f4]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#76777d] mb-1.5">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3980f4] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] text-white rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-widest text-white/50 font-semibold mb-2">
            Weekly Summary
          </p>
          <p className="text-3xl font-bold tabular-nums">{totalMinutesPerWeek}</p>
          <p className="text-sm text-white/60">minutes planned</p>
          <p className="text-xs text-white/40 mt-4">
            Active plan: {activePlan.name}
          </p>
          {savedAt && (
            <p className="text-xs text-[#4edea3] mt-2">
              Saved at {new Date(savedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const blocks = form.template[day.key] ?? []
          return (
            <section key={day.key} className="bg-white border border-[#c6c6cd] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-[#191c1e]">{day.label}</h2>
                <button
                  onClick={() => addBlock(day.key)}
                  className="cursor-pointer text-xs font-semibold text-[#3980f4] hover:underline"
                >
                  + Add Block
                </button>
              </div>

              {blocks.length === 0 ? (
                <p className="text-sm text-[#76777d] py-2">No blocks yet for this day.</p>
              ) : (
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <div
                      key={`${day.key}-${index}`}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 border border-[#e6e8ea] rounded-xl p-3"
                    >
                      <div className="md:col-span-3">
                        <select
                          value={block.block}
                          onChange={(e) =>
                            updateBlock(day.key, index, {
                              block: e.target.value as ActivityType,
                            })
                          }
                          className="w-full border border-[#c6c6cd] rounded-lg px-2.5 py-2 text-sm"
                        >
                          {ACTIVITY_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          min={1}
                          value={block.minutes}
                          onChange={(e) =>
                            updateBlock(day.key, index, {
                              minutes: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                          className="w-full border border-[#c6c6cd] rounded-lg px-2.5 py-2 text-sm"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <input
                          value={block.label}
                          onChange={(e) =>
                            updateBlock(day.key, index, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Block label or instruction"
                          className="w-full border border-[#c6c6cd] rounded-lg px-2.5 py-2 text-sm"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center justify-end">
                        <button
                          onClick={() => removeBlock(day.key, index)}
                          className="cursor-pointer text-xs text-red-500 hover:text-red-700 font-semibold"
                          aria-label="Remove block"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
