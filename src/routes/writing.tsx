import { useState, useEffect, useRef, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db/index'
import { useWritingEntriesForDate } from '#/db/hooks'
import { useToast } from '#/components/ui/ToastProvider'
import { Select } from '#/components/ui/Select'
import { todayStr } from '#/lib/streak'
import { useProfileStore } from '#/store/profile'

export const Route = createFileRoute('/writing')({
  component: WritingMode,
})

const PROMPTS = [
  { label: 'Free Write', value: '' },
  {
    label: 'Describe a bug fix',
    value:
      'Describe a bug you fixed recently. What was the root cause? How did you find it? What did you learn?',
  },
  {
    label: 'Daily work summary',
    value:
      'Summarize what you worked on today. What did you accomplish? What was challenging?',
  },
  {
    label: 'Explain a feature',
    value:
      'Explain a technical feature or system you work with. How does it work? What are its tradeoffs?',
  },
  {
    label: 'Draft an email',
    value:
      'Write a professional email to a colleague or manager. Choose a realistic work scenario.',
  },
  {
    label: 'Simulate a meeting',
    value:
      'Write a short transcript or summary of a team meeting. What decisions were made? Who said what?',
  },
  {
    label: 'System improvement',
    value:
      'Describe a process or system improvement you would propose at work. What problem does it solve?',
  },
]

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatEntryDate(dateStr: string): string {
  const today = todayStr()
  if (dateStr === today) return 'Today'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function WritingMode() {
  const activePlanId = useProfileStore((s) => s.activePlanId)
  const toast = useToast()
  const [promptIndex, setPromptIndex] = useState(0)
  const [text, setText] = useState('')
  const [elapsedSec, setElapsedSec] = useState(0)
  const [hasStarted, setHasStarted] = useState(false) // timer only starts on first keystroke
  const [savedId, setSavedId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [historyDate, setHistoryDate] = useState(todayStr())
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const historyEntries = useWritingEntriesForDate(historyDate)
  const today = todayStr()

  function resetComposer() {
    setText('')
    setSavedId(null)
    setHasStarted(false)
    startTimeRef.current = null
    setElapsedSec(0)
    setLastSaved(null)
  }

  async function ensureLinkedBlock(entryId: number, mins: number, wc: number) {
    if (!activePlanId) return
    const entry = await db.writing_entries.get(entryId)
    if (!entry) return

    if (entry.linked_block_id) {
      await db.daily_blocks.update(entry.linked_block_id, {
        duration_minutes: mins,
        notes: `Writing: ${wc} words`,
      })
      return
    }

    const blockId = (await db.daily_blocks.add({
      plan_id: activePlanId,
      date: today,
      type: 'Writing',
      duration_minutes: mins,
      notes: `Writing: ${wc} words`,
      created_at: Date.now(),
    })) as number

    await db.writing_entries.update(entryId, { linked_block_id: blockId })
  }

  // Timer — only ticks after user starts typing
  useEffect(() => {
    if (!hasStarted) return
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSec(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [hasStarted])

  function handleTextChange(value: string) {
    setText(value)
    if (!hasStarted && value.trim().length > 0) {
      setHasStarted(true)
      startTimeRef.current = Date.now()
    }
  }

  const doAutoSave = useCallback(async () => {
    if (!activePlanId) return
    if (text.trim().length < 10) return
    setIsSaving(true)
    const wc = countWords(text)
    const mins = Math.max(1, Math.round(elapsedSec / 60))
    if (savedId) {
      await db.writing_entries.update(savedId, {
        text,
        word_count: wc,
        active_time_minutes: mins,
      })
    } else {
      const id = await db.writing_entries.add({
        plan_id: activePlanId,
        date: today,
        text,
        word_count: wc,
        active_time_minutes: mins,
        prompt: PROMPTS[promptIndex].value || undefined,
        created_at: Date.now(),
      })
      setSavedId(Number(id))
    }
    setIsSaving(false)
    setLastSaved(new Date())
  }, [text, elapsedSec, savedId, promptIndex, today, activePlanId])

  useEffect(() => {
    if (!hasStarted) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(doAutoSave, 30_000)
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [text, hasStarted, doAutoSave])

  async function handleSave() {
    if (!activePlanId) {
      toast.error('Select an active plan before saving.')
      return
    }
    if (text.trim().length < 10) {
      toast.error('Write at least 10 characters to save.')
      return
    }

    setIsSaving(true)
    try {
      const wc = countWords(text)
      const mins = Math.max(1, Math.round(elapsedSec / 60))
      if (savedId) {
        await db.writing_entries.update(savedId, {
          text,
          word_count: wc,
          active_time_minutes: mins,
        })
        await ensureLinkedBlock(savedId, mins, wc)
      } else {
        const entryId = await db.writing_entries.add({
          plan_id: activePlanId,
          date: today,
          text,
          word_count: wc,
          active_time_minutes: mins,
          prompt: PROMPTS[promptIndex].value || undefined,
          created_at: Date.now(),
        })
        await ensureLinkedBlock(Number(entryId), mins, wc)
      }

      resetComposer()
      setShowHistory(true)
      setHistoryDate(today)
      toast.success('Writing entry saved and logged as activity.')
    } catch {
      toast.error('Could not save writing entry. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDiscard() {
    if (text.trim() && !confirm('Discard this writing session?')) return

    if (savedId) {
      const entry = await db.writing_entries.get(savedId)
      if (entry?.linked_block_id) {
        await db.daily_blocks.delete(entry.linked_block_id)
      }
      await db.writing_entries.delete(savedId)
    }

    resetComposer()
    toast.success('Draft discarded.')
  }

  function offsetHistoryDate(dir: -1 | 1) {
    setHistoryDate((d) => {
      const dt = new Date(d + 'T00:00:00')
      dt.setDate(dt.getDate() + dir)
      const next = dt.toISOString().slice(0, 10)
      if (dir === 1 && next > today) return d
      return next
    })
  }

  const wordCount = countWords(text)
  const prompt = PROMPTS[promptIndex]

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Writing Mode</h1>
          <p className="text-sm text-outline mt-0.5">
            Practice professional English writing
          </p>
        </div>
        <button
          onClick={() => setShowHistory((s) => !s)}
          className="cursor-pointer flex items-center gap-1.5 text-sm text-tertiary font-semibold hover:underline"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {showHistory ? 'Hide History' : 'History'}
        </button>
      </div>

      {/* Editor card */}
      <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-card">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-low flex-wrap">
          {/* Prompt selector */}
          <Select
            options={PROMPTS.map((p, i) => ({ value: i, label: p.label }))}
            value={promptIndex}
            onChange={(val) => setPromptIndex(Number(val))}
            className="flex-1 min-w-40"
          />

          {/* Metrics */}
          <div className="flex items-center gap-4 text-sm ml-auto">
            <span className="flex items-center gap-1.5 text-outline">
              <svg
                width="13"
                height="13"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                />
              </svg>
              <span
                className={`font-semibold tabular-nums ${hasStarted ? 'text-on-surface' : 'text-outline-variant'}`}
              >
                {formatDuration(elapsedSec)}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-outline">
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
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              <span className="font-semibold text-on-surface">{wordCount}</span>
              <span>words</span>
            </span>
            {isSaving && (
              <span className="text-xs text-outline italic">Saving…</span>
            )}
            {lastSaved && !isSaving && (
              <span className="text-xs text-secondary flex items-center gap-1">
                <svg
                  width="11"
                  height="11"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>

        {/* Prompt display */}
        {prompt.value && (
          <div className="px-5 pt-4 pb-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5">
              Current Prompt
            </p>
            <p className="text-base font-semibold text-on-surface leading-snug">
              {prompt.value}
            </p>
            <div className="border-b border-surface-low mt-4" />
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={
            hasStarted
              ? ''
              : prompt.value
                ? 'Start writing here…'
                : 'Write freely in English. Express yourself clearly and professionally…'
          }
          className="w-full px-5 py-4 text-base text-on-surface bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-outline-variant"
          style={{ fontFamily: 'Inter, sans-serif', minHeight: '280px' }}
          autoFocus
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-low bg-surface">
          <button
            onClick={handleDiscard}
            className="cursor-pointer px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            Discard
          </button>
          <div className="flex items-center gap-2">
            {!hasStarted && (
              <p className="text-xs text-outline-variant">
                Timer starts when you write
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={wordCount < 10}
              className="cursor-pointer px-5 py-2 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Entry
              {wordCount > 0 && (
                <span className="ml-1.5 opacity-70">({wordCount}w)</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      {showHistory && (
        <div className="mt-6 bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-low">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-outline">
              Writing History
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => offsetHistoryDate(-1)}
                className="cursor-pointer p-1.5 rounded-lg hover:bg-surface-low text-on-surface-variant transition-colors"
              >
                <svg
                  width="14"
                  height="14"
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
              <span className="text-sm font-semibold text-on-surface min-w-20 text-center">
                {formatEntryDate(historyDate)}
              </span>
              <button
                onClick={() => offsetHistoryDate(1)}
                disabled={historyDate >= today}
                className="cursor-pointer p-1.5 rounded-lg hover:bg-surface-low text-on-surface-variant transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  width="14"
                  height="14"
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
            </div>
          </div>

          {historyEntries.length === 0 ? (
            <div className="text-center py-10 text-outline text-sm">
              No entries for this day.
            </div>
          ) : (
            <ul className="divide-y divide-surface-low">
              {historyEntries.map((entry) => (
                <li key={entry.id} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-2.5 text-xs text-outline">
                    <span className="font-bold text-secondary text-sm">
                      {entry.word_count} words
                    </span>
                    <span>·</span>
                    <span>{entry.active_time_minutes} min</span>
                    {entry.prompt && (
                      <>
                        <span>·</span>
                        <span className="italic truncate max-w-50">
                          {entry.prompt.slice(0, 50)}…
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed line-clamp-5 whitespace-pre-wrap">
                    {entry.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
