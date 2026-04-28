import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useBlocker } from '@tanstack/react-router'
import { Modal } from '#/components/ui/Modal'
import { Select } from '#/components/ui/Select'
import type { ActivityType } from '#/db/index'
import { useToast } from '#/components/ui/ToastProvider'
import { getDefaultPlanTemplate } from '#/services/plans'
import type { PlanTemplateBlock, StudyPlan, WeeklyPlanTemplate } from '#/services/types'
import { useProfileStore } from '#/store/profile'

export const Route = createFileRoute('/plan')({
  component: PlanEditor,
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

interface BlockConfig {
  color: string
  bg: string
  border: string
  icon: React.ReactNode
}

const BLOCK_CONFIG: Record<ActivityType, BlockConfig> = {
  Listening: {
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: (
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 000 12M8.464 15.536a5 5 0 010-7.072" />
      </svg>
    ),
  },
  Reading: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: (
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  Writing: {
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: (
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  Speaking: {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: (
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  Shadowing: {
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    icon: (
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  Vocabulary: {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: (
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  Other: {
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: (
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
}

const PLAN_DRAFT_KEY_PREFIX = 'ew_plan_draft_'

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
              minutes:
                Number.isFinite(minutes) && minutes > 0
                  ? Math.round(minutes)
                  : 15,
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

function buildFormFromPlan(plan: StudyPlan): PlanForm {
  return {
    name: plan.name,
    description: plan.description ?? '',
    level_from: plan.level_from,
    level_to: plan.level_to,
    daily_goal_minutes: String(plan.daily_goal_minutes),
    template: parseTemplate(plan.template_json),
  }
}

function parseDraft(raw: string): PlanForm | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const draft = parsed as Partial<PlanForm>
    return {
      name: String(draft.name ?? ''),
      description: String(draft.description ?? ''),
      level_from: String(draft.level_from ?? 'A2'),
      level_to: String(draft.level_to ?? 'B2'),
      daily_goal_minutes: String(draft.daily_goal_minutes ?? '90'),
      template: normalizeTemplate(draft.template),
    }
  } catch {
    return null
  }
}

function getDraftKey(planId: number): string {
  return `${PLAN_DRAFT_KEY_PREFIX}${planId}`
}

function sameForm(a: PlanForm, b: PlanForm): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

// ── Icons ──────────────────────────────────────────────────────────────────
function IcPlus({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
function IcTrash() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}
function IcEdit() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}
function IcCheck() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
function IcSave() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  )
}
function IcReset() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}
function IcStar() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
}
function IcClock() {
  return (
    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// ── Plan card ──────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  isActive,
  isEditing,
  canDelete,
  onEdit,
  onSetActive,
  onDelete,
}: {
  plan: StudyPlan
  isActive: boolean
  isEditing: boolean
  canDelete: boolean
  onEdit: () => void
  onSetActive: () => void
  onDelete: () => void
}) {
  let totalMinutes = 0
  let blockCount = 0
  try {
    const tpl = JSON.parse(plan.template_json) as WeeklyPlanTemplate
    for (const day of DAYS) {
      const blocks = tpl[day.key] ?? []
      blockCount += blocks.length
      totalMinutes += blocks.reduce(
        (s, b) => s + (Number.isFinite(b.minutes) ? b.minutes : 0),
        0,
      )
    }
  } catch { /* ignore */ }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onEdit() }}
      className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
        isEditing
          ? 'border-secondary bg-secondary/5 shadow-md'
          : 'border-outline-variant bg-white hover:border-outline hover:shadow-card-sm'
      }`}
    >
      {/* Status badge */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        {isActive && (
          <span className="inline-flex items-center gap-1 bg-primary-dark text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
            <svg width="5" height="5" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
            Active
          </span>
        )}
        {isEditing && (
          <span className="inline-flex items-center gap-1 bg-secondary/15 text-secondary text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-secondary/25">
            Editing
          </span>
        )}
      </div>

      {/* Plan info */}
      <div className="mb-3 pr-16">
        <h3 className="text-sm font-bold text-on-surface leading-tight truncate">{plan.name}</h3>
        {plan.description && (
          <p className="text-[11px] text-outline mt-0.5 line-clamp-2 leading-relaxed">{plan.description}</p>
        )}
      </div>

      {/* Metadata chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="inline-flex items-center gap-1 bg-surface-low text-on-surface-variant text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {plan.level_from} → {plan.level_to}
        </span>
        <span className="inline-flex items-center gap-1 bg-surface-low text-on-surface-variant text-[10px] font-semibold px-2 py-0.5 rounded-full">
          <IcClock />
          {plan.daily_goal_minutes} min/day
        </span>
        <span className="inline-flex items-center gap-1 bg-surface-low text-on-surface-variant text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {totalMinutes} min/wk · {blockCount} blocks
        </span>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1.5 border-t border-surface-high pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        {isActive ? (
          <span className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-outline/60">
            <IcCheck />
            Active
          </span>
        ) : (
          <button
            onClick={onSetActive}
            className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-dark/8 text-primary-dark text-[11px] font-semibold hover:bg-primary-dark/15 transition-colors"
            title="Set as active plan"
          >
            <IcStar />
            Set Active
          </button>
        )}
        <button
          onClick={onEdit}
          className={`cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
            isEditing
              ? 'bg-secondary/12 text-secondary'
              : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
          }`}
          title="Edit this plan"
        >
          <IcEdit />
          Edit
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            className="cursor-pointer ml-auto p-1.5 rounded-lg text-outline-variant hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete plan"
          >
            <IcTrash />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
function PlanEditor() {
  const { plans, activePlanId, setActivePlan, createPlan, deletePlan, updatePlanById } =
    useProfileStore()
  const toast = useToast()

  const [editingPlanId, setEditingPlanId] = useState<number | undefined>(undefined)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [creating, setCreating] = useState(false)

  // Default editing to active plan once store is ready
  useEffect(() => {
    if (editingPlanId === undefined && activePlanId) {
      setEditingPlanId(activePlanId)
    }
  }, [activePlanId, editingPlanId])

  const editingPlan = useMemo(
    () => plans.find((p) => p.id === editingPlanId),
    [plans, editingPlanId],
  )

  const [form, setForm] = useState<PlanForm>(() => {
    const { plans: plansLocal, activePlanId: activePlanIdLocal } = useProfileStore.getState()
    const ap = plansLocal.find((p) => p.id === activePlanIdLocal)
    if (ap?.id) {
      try {
        const rawDraft = localStorage.getItem(getDraftKey(ap.id))
        if (rawDraft) {
          const parsed = parseDraft(rawDraft)
          if (parsed) return parsed
          localStorage.removeItem(getDraftKey(ap.id))
        }
      } catch { /* ignore */ }
      return buildFormFromPlan(ap)
    }
    return {
      name: '',
      description: '',
      level_from: 'A2',
      level_to: 'B2',
      daily_goal_minutes: '90',
      template: getDefaultPlanTemplate(),
    }
  })

  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const baseForm = useMemo(
    () => (editingPlan ? buildFormFromPlan(editingPlan) : null),
    [editingPlan],
  )

  const hasUnsavedChanges = useMemo(() => {
    if (!baseForm) return false
    return !sameForm(form, baseForm)
  }, [form, baseForm])

  const blocker = useBlocker({
    shouldBlockFn: () => hasUnsavedChanges,
    enableBeforeUnload: () => hasUnsavedChanges,
    withResolver: true,
  })

  // Reload form when the editing plan ID switches
  const [prevEditId, setPrevEditId] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (!editingPlan || editingPlan.id === prevEditId) return
    setPrevEditId(editingPlan.id)
    const draftKey = getDraftKey(editingPlan.id!)
    try {
      const rawDraft = localStorage.getItem(draftKey)
      if (rawDraft) {
        const parsed = parseDraft(rawDraft)
        if (parsed) {
          setForm(parsed)
          setSavedAt(null)
          toast.success('Recovered unsaved plan draft.')
          return
        }
        localStorage.removeItem(draftKey)
      }
    } catch { /* ignore */ }
    setForm(buildFormFromPlan(editingPlan))
    setSavedAt(null)
  }, [editingPlan, prevEditId, toast])

  // Draft persistence
  useEffect(() => {
    if (!editingPlan?.id || !baseForm) return
    const draftKey = getDraftKey(editingPlan.id)
    try {
      if (!hasUnsavedChanges) {
        localStorage.removeItem(draftKey)
      } else {
        localStorage.setItem(draftKey, JSON.stringify(form))
      }
    } catch { /* best-effort */ }
  }, [editingPlan?.id, baseForm, form, hasUnsavedChanges])

  useEffect(() => {
    if (blocker.status !== 'blocked') return
    const el = document.activeElement as HTMLElement | null
    el?.blur()
  }, [blocker])

  function setField<TKey extends keyof PlanForm>(key: TKey, value: PlanForm[TKey]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateBlock(dayKey: string, index: number, changes: Partial<PlanTemplateBlock>) {
    setForm((prev) => {
      const next = { ...prev.template }
      const day = [...(next[dayKey] ?? [])]
      day[index] = { ...day[index], ...changes }
      next[dayKey] = day
      return { ...prev, template: next }
    })
  }

  function addBlock(dayKey: string) {
    setForm((prev) => {
      const next = { ...prev.template }
      next[dayKey] = [...(next[dayKey] ?? []), { block: 'Listening', minutes: 15, label: '' }]
      return { ...prev, template: next }
    })
  }

  function removeBlock(dayKey: string, index: number) {
    setForm((prev) => {
      const next = { ...prev.template }
      const day = [...(next[dayKey] ?? [])]
      day.splice(index, 1)
      next[dayKey] = day
      return { ...prev, template: next }
    })
  }

  function resetTemplate() {
    if (!confirm('Reset weekly template to the default Study Plan blocks?')) return
    setField('template', getDefaultPlanTemplate())
  }

  async function savePlan() {
    if (!editingPlan) return
    const goal = Number(form.daily_goal_minutes)
    if (!Number.isFinite(goal) || goal <= 0) {
      toast.error('Daily goal must be a positive number.')
      return
    }
    const savedName = form.name.trim() || editingPlan.name
    const savedGoal = Math.round(goal)
    const savedLevelFrom = form.level_from.trim() || 'A2'
    const savedLevelTo = form.level_to.trim() || 'B2'
    setSaving(true)
    try {
      await updatePlanById(editingPlan.id!, {
        name: savedName,
        description: form.description.trim() || undefined,
        level_from: savedLevelFrom,
        level_to: savedLevelTo,
        daily_goal_minutes: savedGoal,
        template_json: JSON.stringify(form.template),
      })
      setForm((prev) => ({
        ...prev,
        name: savedName,
        description: form.description.trim() ?? '',
        level_from: savedLevelFrom,
        level_to: savedLevelTo,
        daily_goal_minutes: String(savedGoal),
      }))
      if (editingPlan.id) localStorage.removeItem(getDraftKey(editingPlan.id))
      setSavedAt(Date.now())
      toast.success('Plan saved.')
    } catch {
      toast.error('Could not save plan. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleSwitchEditing(planId: number) {
    if (hasUnsavedChanges && !confirm('Switch plan? Unsaved changes will remain as a draft.')) return
    setEditingPlanId(planId)
  }

  async function handleSetActive(planId: number) {
    try {
      await setActivePlan(planId)
      toast.success('Active plan changed.')
    } catch {
      toast.error('Could not switch active plan.')
    }
  }

  async function handleDeletePlan(planId: number) {
    if (!confirm('Delete this plan and all its data?')) return
    try {
      await deletePlan(planId)
      if (editingPlanId === planId) setEditingPlanId(activePlanId)
      toast.success('Plan deleted.')
    } catch {
      toast.error('Could not delete plan.')
    }
  }

  async function handleCreatePlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newPlanName.trim()) return
    setCreating(true)
    try {
      const newId = await createPlan(newPlanName)
      setNewPlanName('')
      setShowCreateModal(false)
      setEditingPlanId(newId)
      toast.success('Plan created.')
    } catch {
      toast.error('Could not create plan.')
    } finally {
      setCreating(false)
    }
  }

  const totalMinutesPerWeek = useMemo(() => {
    return DAYS.reduce((sum, day) => {
      return (
        sum +
        (form.template[day.key] ?? []).reduce(
          (s, b) => s + (Number.isFinite(b.minutes) ? b.minutes : 0),
          0,
        )
      )
    }, 0)
  }, [form.template])

  return (
    <>
      <div className="px-4 md:px-8 py-6 space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Plan Editor</h1>
            <p className="text-sm text-outline mt-0.5">
              Manage your study plans and weekly templates.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors shadow-sm"
          >
            <IcPlus />
            New Plan
          </button>
        </div>

        {/* ── Plans list ── */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-3">
            Your Plans
          </p>
          {plans.length === 0 ? (
            <div className="border border-dashed border-outline-variant rounded-2xl p-10 text-center">
              <p className="text-sm text-on-surface-variant mb-3">No plans yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
              >
                <IcPlus />
                Create your first plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isActive={plan.id === activePlanId}
                  isEditing={plan.id === editingPlanId}
                  canDelete={plans.length > 1}
                  onEdit={() => handleSwitchEditing(plan.id!)}
                  onSetActive={() => handleSetActive(plan.id!)}
                  onDelete={() => handleDeletePlan(plan.id!)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Editor section ── */}
        {editingPlan ? (
          <section className="space-y-5 border-t border-outline-variant pt-6">

            {/* Editor header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-on-surface">{editingPlan.name}</h2>
                  {editingPlan.id === activePlanId && (
                    <span className="inline-flex items-center gap-1 bg-primary-dark text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-outline mt-0.5 flex items-center gap-1.5 flex-wrap">
                  Editing goals and weekly template
                  {hasUnsavedChanges && (
                    <span className="text-amber-600 font-semibold">· Unsaved changes</span>
                  )}
                  {savedAt && !hasUnsavedChanges && (
                    <span className="text-emerald-600 font-semibold">
                      · Saved {new Date(savedAt).toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetTemplate}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
                >
                  <IcReset />
                  Reset
                </button>
                <button
                  onClick={() => void savePlan()}
                  disabled={saving || !hasUnsavedChanges}
                  className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IcSave />
                  {saving ? 'Saving…' : 'Save Plan'}
                </button>
              </div>
            </div>

            {/* Plan metadata form */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3 bg-white border border-outline-variant rounded-2xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-4">
                  Plan Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5">
                      Plan Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5">
                      Level From
                    </label>
                    <input
                      value={form.level_from}
                      placeholder="A2"
                      onChange={(e) => setField('level_from', e.target.value)}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5">
                      Level To
                    </label>
                    <input
                      value={form.level_to}
                      placeholder="B2"
                      onChange={(e) => setField('level_to', e.target.value)}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5">
                      Daily Goal (minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.daily_goal_minutes}
                      onChange={(e) => setField('daily_goal_minutes', e.target.value)}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setField('description', e.target.value)}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tertiary resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Weekly summary */}
              <div className="bg-primary-dark text-white rounded-2xl p-5 flex flex-col">
                <p className="text-[11px] uppercase tracking-widest text-white/50 font-semibold mb-1">
                  Weekly Total
                </p>
                <p className="text-4xl font-bold tabular-nums">{totalMinutesPerWeek}</p>
                <p className="text-sm text-white/60 mb-auto">minutes planned</p>
                <div className="pt-4 space-y-1 border-t border-white/10 mt-4">
                  <p className="text-[11px] text-white/40">
                    {form.level_from} → {form.level_to}
                  </p>
                  <p className="text-[11px] text-white/40">
                    Goal: {form.daily_goal_minutes} min/day
                  </p>
                </div>
              </div>
            </div>

            {/* Weekly template */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-3">
                Weekly Template
              </p>
              <div className="space-y-3">
                {DAYS.map((day) => {
                  const blocks = form.template[day.key] ?? []
                  const dayMinutes = blocks.reduce(
                    (s, b) => s + (Number.isFinite(b.minutes) ? b.minutes : 0),
                    0,
                  )
                  return (
                    <section
                      key={day.key}
                      className="bg-white border border-outline-variant rounded-2xl overflow-hidden"
                    >
                      {/* Day header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-surface-low border-b border-outline-variant/50">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-on-surface">{day.label}</h3>
                          {dayMinutes > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-outline font-semibold bg-white border border-outline-variant px-1.5 py-0.5 rounded-full">
                              <IcClock />
                              {dayMinutes} min
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => addBlock(day.key)}
                          className="cursor-pointer flex items-center gap-1 text-xs font-semibold text-secondary hover:text-secondary-dark transition-colors"
                        >
                          <IcPlus size={12} />
                          Add Block
                        </button>
                      </div>

                      {/* Blocks */}
                      <div className="p-3">
                        {blocks.length === 0 ? (
                          <div
                            className="border-2 border-dashed border-surface-high rounded-xl py-5 text-center cursor-pointer hover:border-outline-variant transition-colors"
                            onClick={() => addBlock(day.key)}
                          >
                            <p className="text-xs text-outline">
                              No blocks —{' '}
                              <span className="text-secondary font-medium">click to add</span>
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {blocks.map((block, index) => {
                              const cfg = BLOCK_CONFIG[block.block] ?? BLOCK_CONFIG.Other
                              return (
                                <div
                                  key={`${day.key}-${index}`}
                                  className={`grid grid-cols-12 gap-2 rounded-xl p-2.5 border ${cfg.border} ${cfg.bg}`}
                                >
                                  {/* Type */}
                                  <div className="col-span-12 md:col-span-3">
                                    <div className="relative flex items-center">
                                      <span className={`absolute left-2.5 z-10 pointer-events-none ${cfg.color}`}>
                                        {cfg.icon}
                                      </span>
                                      <Select
                                        options={ACTIVITY_TYPES.map((t) => ({ value: t, label: t }))}
                                        value={block.block}
                                        onChange={(val) =>
                                          updateBlock(day.key, index, {
                                            block: val as ActivityType,
                                          })
                                        }
                                        className={`pl-7 text-[11px] font-bold ${cfg.color} border ${cfg.border} bg-white`}
                                      />
                                    </div>
                                  </div>

                                  {/* Minutes */}
                                  <div className="col-span-4 md:col-span-2">
                                    <div className="relative">
                                      <input
                                        type="number"
                                        min={1}
                                        value={block.minutes}
                                        onChange={(e) =>
                                          updateBlock(day.key, index, {
                                            minutes: Math.max(1, Number(e.target.value) || 1),
                                          })
                                        }
                                        className="w-full border border-white/70 bg-white rounded-lg px-2 pr-7 py-1.5 text-xs font-semibold text-on-surface text-center focus:outline-none focus:ring-1 focus:ring-secondary"
                                      />
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-outline pointer-events-none font-medium">
                                        min
                                      </span>
                                    </div>
                                  </div>

                                  {/* Label */}
                                  <div className="col-span-7 md:col-span-6">
                                    <input
                                      value={block.label}
                                      onChange={(e) =>
                                        updateBlock(day.key, index, { label: e.target.value })
                                      }
                                      placeholder="Description or instruction…"
                                      className="w-full border border-white/70 bg-white rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary placeholder:text-outline"
                                    />
                                  </div>

                                  {/* Remove */}
                                  <div className="col-span-1 flex items-center justify-end">
                                    <button
                                      onClick={() => removeBlock(day.key, index)}
                                      className="cursor-pointer p-1.5 rounded-lg hover:bg-red-100 text-outline-variant hover:text-red-600 transition-colors"
                                      title="Remove block"
                                      aria-label="Remove block"
                                    >
                                      <IcTrash />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          </section>
        ) : (
          <div className="border border-dashed border-outline-variant rounded-2xl p-10 text-center">
            <p className="text-sm text-on-surface-variant">
              Select a plan above to start editing.
            </p>
          </div>
        )}
      </div>

      {/* ── Create plan modal ── */}
      <Modal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setNewPlanName('') }}
        title="New Plan"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5">
              Plan Name *
            </label>
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="e.g. Intensive B2 Sprint"
              required
              autoFocus
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>
          <div className="p-3 rounded-xl bg-surface-low border border-outline-variant/50">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-1">
              Template
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Starts with the default Work English Study Plan (Mon–Sun + Express Day) with pre-loaded
              resource categories. Customize blocks after creating.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); setNewPlanName('') }}
              className="cursor-pointer flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !newPlanName.trim()}
              className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <IcPlus />
              {creating ? 'Creating…' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Navigation blocker modal ── */}
      <Modal
        open={blocker.status === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="Unsaved changes"
      >
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
          You have unsaved changes in this plan. If you leave now, those edits will stay as a
          draft but won't be applied until you save.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => blocker.reset?.()}
            className="cursor-pointer flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            Stay here
          </button>
          <button
            type="button"
            onClick={() => blocker.proceed?.()}
            className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
          >
            Leave page
          </button>
        </div>
      </Modal>
    </>
  )
}
