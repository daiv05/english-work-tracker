import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ActivityTypeChip, typeConfig } from '#/components/ui/ActivityTypeChip'
import { Modal } from '#/components/ui/Modal'
import { useToast } from '#/components/ui/ToastProvider'
import { SearchSelect } from '#/components/ui/SearchSelect'
import { db } from '#/db/index'
import type { ActivityType, DailyBlock } from '#/db/index'
import {
  useBlocksForDate,
  useResources,
  useResourceCategories,
} from '#/db/hooks'
import { todayStr } from '#/lib/streak'
import { useProfileStore } from '#/store/profile'

export const Route = createFileRoute('/log')({
  component: ActivityLog,
})

const ACTIVITY_TYPES: ActivityType[] = [
  'Listening',
  'Reading',
  'Writing',
  'Speaking',
  'Shadowing',
  'Vocabulary',
  'Other',
]

function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatDisplayDate(dateStr: string): string {
  const today = todayStr()
  const yesterday = offsetDate(today, -1)
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(t?: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`
}

// Reusable input/label styles
const S = {
  input:
    'w-full border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-transparent placeholder:text-outline',
  label:
    'block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5',
}

interface FormData {
  type: ActivityType
  start_time: string
  duration_minutes: string
  resource_id: string
  custom_resource_text: string
  notes: string
}

const emptyForm: FormData = {
  type: 'Listening',
  start_time: '',
  duration_minutes: '',
  resource_id: '',
  custom_resource_text: '',
  notes: '',
}

function ActivityTypeGrid({
  selected,
  onSelect,
}: {
  selected: ActivityType
  onSelect: (t: ActivityType) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {ACTIVITY_TYPES.map((t) => {
        const cfg = typeConfig[t]
        const isActive = selected === t
        return (
          <button
            key={t}
            type="button"
            onClick={() => onSelect(t)}
            className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              isActive
                ? `border-current ${cfg.bg} ${cfg.text} shadow-sm`
                : 'border-surface-high text-on-surface-variant hover:border-outline-variant hover:bg-surface'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isActive ? cfg.dot : 'bg-outline-variant'}`}
            />
            <span className="truncate">{t}</span>
          </button>
        )
      })}
    </div>
  )
}

function BlockForm({
  initial,
  planId,
  date,
  onSave,
  onCancel,
  submitLabel = 'Save Block',
}: {
  initial?: FormData
  planId?: number
  date: string
  onSave: () => void
  onCancel?: () => void
  submitLabel?: string
}) {
  const toast = useToast()
  const [form, setForm] = useState<FormData>(initial ?? { ...emptyForm })
  const resources = useResources()
  const categories = useResourceCategories()

  const set = (k: keyof FormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!planId) return
    const mins = parseInt(form.duration_minutes)
    if (!mins || mins <= 0) {
      toast.error('Duration must be greater than 0.')
      return
    }
    const block: DailyBlock = {
      plan_id: planId,
      date,
      type: form.type,
      duration_minutes: mins,
      created_at: Date.now(),
    }
    if (form.start_time) block.start_time = form.start_time
    if (form.resource_id) block.resource_id = parseInt(form.resource_id)
    if (form.custom_resource_text)
      block.custom_resource_text = form.custom_resource_text
    if (form.notes) block.notes = form.notes
    try {
      await db.daily_blocks.add(block)
      setForm({ ...emptyForm })
      toast.success('Activity block saved.')
      onSave()
    } catch {
      toast.error('Could not save activity block. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type grid */}
      <div>
        <label className={S.label}>Activity Type</label>
        <ActivityTypeGrid
          selected={form.type}
          onSelect={(t) => set('type', t)}
        />
      </div>

      {/* Time + Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={S.label}>Start Time</label>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => set('start_time', e.target.value)}
            className={S.input}
          />
        </div>
        <div>
          <label className={S.label}>Duration (min) *</label>
          <input
            type="number"
            min="1"
            max="480"
            placeholder="30"
            value={form.duration_minutes}
            onChange={(e) => set('duration_minutes', e.target.value)}
            required
            className={S.input}
          />
        </div>
      </div>

      {/* Resource select */}
      {resources.length > 0 && (
        <div>
          <label className={S.label}>Resource</label>
          <SearchSelect
            options={categories.flatMap((cat) =>
              resources
                .filter((r) => r.category_id === cat.id)
                .map((r) => ({ value: r.id!, label: r.title, group: cat.name }))
            )}
            value={form.resource_id !== '' ? Number(form.resource_id) : undefined}
            onChange={(val) => set('resource_id', String(val))}
            placeholder="— Select resource —"
            searchPlaceholder="Search resources…"
          />
        </div>
      )}

      {/* Free text resource */}
      <div>
        <label className={S.label}>
          {resources.length > 0 ? 'Or custom resource' : 'Resource used'}
        </label>
        <input
          type="text"
          placeholder="e.g. Syntax Podcast, BBC article…"
          value={form.custom_resource_text}
          onChange={(e) => set('custom_resource_text', e.target.value)}
          className={S.input}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={S.label}>Quick note</label>
        <textarea
          placeholder="What exactly did you practice? Any highlights?"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          className={`${S.input} resize-none`}
        />
      </div>

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function TimelineItem({
  block,
  onEdit,
  onDelete,
}: {
  block: DailyBlock
  onEdit: (b: DailyBlock) => void
  onDelete: (id: number) => void
}) {
  const cfg = typeConfig[block.type]

  return (
    <li className="relative group flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center w-10 shrink-0">
        <div
          className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shadow-sm shrink-0`}
        >
          <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
        </div>
        <div className="flex-1 w-px bg-surface-high mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-5 min-w-0">
        <div className="bg-white border border-surface-high rounded-xl p-4 shadow-card-sm hover:shadow-card-hover transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <ActivityTypeChip type={block.type} size="sm" />
                <span className="text-xs text-outline">
                  {[
                    block.start_time ? formatTime(block.start_time) : null,
                    `${block.duration_minutes} min`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              {block.custom_resource_text && (
                <p className="text-sm text-on-surface font-medium mt-1.5">
                  {block.custom_resource_text}
                </p>
              )}
              {block.notes && (
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  {block.notes}
                </p>
              )}
            </div>
            {/* Actions — visible on hover */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onEdit(block)}
                className="cursor-pointer p-1.5 rounded-lg hover:bg-surface-low text-outline hover:text-on-surface transition-colors"
              >
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete(block.id!)}
                className="cursor-pointer p-1.5 rounded-lg hover:bg-red-50 text-outline hover:text-red-500 transition-colors"
              >
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

function EditBlockModal({
  block,
  onSave,
  onClose,
}: {
  block: DailyBlock
  onSave: () => void
  onClose: () => void
}) {
  const toast = useToast()
  const resources = useResources()
  const categories = useResourceCategories()
  const [form, setForm] = useState<FormData>({
    type: block.type,
    start_time: block.start_time ?? '',
    duration_minutes: String(block.duration_minutes),
    resource_id: block.resource_id ? String(block.resource_id) : '',
    custom_resource_text: block.custom_resource_text ?? '',
    notes: block.notes ?? '',
  })

  const set = (k: keyof FormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const mins = parseInt(form.duration_minutes)
    if (!mins || mins <= 0) {
      toast.error('Duration must be greater than 0.')
      return
    }
    try {
      await db.daily_blocks.update(block.id!, {
        type: form.type,
        duration_minutes: mins,
        start_time: form.start_time || undefined,
        resource_id: form.resource_id ? parseInt(form.resource_id) : undefined,
        custom_resource_text: form.custom_resource_text || undefined,
        notes: form.notes || undefined,
      })
      toast.success('Activity block updated.')
      onSave()
    } catch {
      toast.error('Could not update block. Please try again.')
    }
  }

  return (
    <Modal open onClose={onClose} title="Edit Block">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={S.label}>Activity Type</label>
          <ActivityTypeGrid
            selected={form.type}
            onSelect={(t) => set('type', t)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={S.label}>Start Time</label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => set('start_time', e.target.value)}
              className={S.input}
            />
          </div>
          <div>
            <label className={S.label}>Duration (min) *</label>
            <input
              type="number"
              min="1"
              max="480"
              value={form.duration_minutes}
              onChange={(e) => set('duration_minutes', e.target.value)}
              required
              className={S.input}
            />
          </div>
        </div>
        {resources.length > 0 && (
          <div>
            <label className={S.label}>Resource</label>
            <SearchSelect
              options={categories.flatMap((cat) =>
                resources
                  .filter((r) => r.category_id === cat.id)
                  .map((r) => ({ value: r.id!, label: r.title, group: cat.name }))
              )}
              value={form.resource_id !== '' ? Number(form.resource_id) : undefined}
              onChange={(val) => set('resource_id', String(val))}
              placeholder="— Select resource —"
              searchPlaceholder="Search resources…"
            />
          </div>
        )}
        <div>
          <label className={S.label}>Resource used</label>
          <input
            type="text"
            placeholder="e.g. Syntax Podcast…"
            value={form.custom_resource_text}
            onChange={(e) => set('custom_resource_text', e.target.value)}
            className={S.input}
          />
        </div>
        <div>
          <label className={S.label}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            className={`${S.input} resize-none`}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}

function ActivityLog() {
  const toast = useToast()
  const today = todayStr()
  const activePlanId = useProfileStore((s) => s.activePlanId)
  const [selectedDate, setSelectedDate] = useState(today)
  const [editingBlock, setEditingBlock] = useState<DailyBlock | null>(null)
  const [showMobileForm, setShowMobileForm] = useState(false)
  const blocks = useBlocksForDate(selectedDate)

  const navigate = (dir: -1 | 1) => setSelectedDate((d) => offsetDate(d, dir))
  const totalMin = blocks.reduce((s, b) => s + b.duration_minutes, 0)

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm('Delete this block?')) return
      try {
        await db.daily_blocks.delete(id)
        toast.success('Activity block deleted.')
      } catch {
        toast.error('Could not delete block. Please try again.')
      }
    },
    [toast],
  )

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Activity Log</h1>
          <p className="text-sm text-outline mt-0.5">
            Track and review your study blocks
          </p>
        </div>
        {/* Mobile: floating add button */}
        <button
          onClick={() => setShowMobileForm(true)}
          className="cursor-pointer md:hidden flex items-center gap-1.5 bg-primary-dark text-white rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
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
          Log
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-2 mb-6 bg-white border border-outline-variant rounded-xl px-4 py-3 shadow-card-sm">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer p-1.5 rounded-lg hover:bg-surface-low text-on-surface-variant transition-colors"
        >
          <svg
            width="17"
            height="17"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-on-surface">
            {formatDisplayDate(selectedDate)}
          </p>
          {selectedDate !== today && (
            <p className="text-xs text-outline">{selectedDate}</p>
          )}
        </div>
        <button
          onClick={() => navigate(1)}
          disabled={selectedDate >= today}
          className="cursor-pointer p-1.5 rounded-lg hover:bg-surface-low text-on-surface-variant transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg
            width="17"
            height="17"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        {selectedDate !== today && (
          <button
            onClick={() => setSelectedDate(today)}
            className="cursor-pointer text-xs text-tertiary font-semibold hover:underline ml-1 px-2"
          >
            Today
          </button>
        )}
        {totalMin > 0 && (
          <div className="ml-auto pl-3 border-l border-surface-high">
            <span className="text-sm font-bold text-secondary">
              {totalMin} min
            </span>
            <span className="text-xs text-outline ml-1">total</span>
          </div>
        )}
      </div>

      {/* Two-column desktop layout */}
      <div className="flex gap-6 items-start">
        {/* Timeline — left column */}
        <div className="flex-1 min-w-0">
          {blocks.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-outline-variant rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
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
              <p className="text-sm font-semibold text-on-surface-variant">
                No blocks logged
              </p>
              <p className="text-xs text-outline mt-1">
                {selectedDate === today
                  ? 'Log your first study block today'
                  : 'No activity on this day'}
              </p>
            </div>
          ) : (
            <ul className="space-y-0">
              {blocks.map((block) => (
                <TimelineItem
                  key={block.id}
                  block={block}
                  onEdit={setEditingBlock}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Sticky form — right column, desktop only */}
        <div className="hidden md:block w-80 shrink-0">
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-primary-dark flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-on-surface">
                Log New Activity
              </h2>
            </div>
            <BlockForm
              planId={activePlanId}
              date={selectedDate}
              onSave={() => {}}
              submitLabel="Save Activity Block"
            />
          </div>
        </div>
      </div>

      {/* Mobile: form modal */}
      <Modal
        open={showMobileForm}
        onClose={() => setShowMobileForm(false)}
        title="Log Activity Block"
      >
        <BlockForm
          planId={activePlanId}
          date={selectedDate}
          onSave={() => setShowMobileForm(false)}
          onCancel={() => setShowMobileForm(false)}
        />
      </Modal>

      {/* Edit modal */}
      {editingBlock && (
        <EditBlockModal
          block={editingBlock}
          onSave={() => setEditingBlock(null)}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  )
}
