import type { ActivityType } from '#/db/index'

const typeConfig: Record<
  ActivityType,
  { bg: string; text: string; dot: string }
> = {
  Listening: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  Reading: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-400',
  },
  Writing: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  Speaking: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-400',
  },
  Shadowing: { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-400' },
  Vocabulary: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  Other: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
}

interface ActivityTypeChipProps {
  type: ActivityType
  size?: 'sm' | 'md'
}

export function ActivityTypeChip({ type, size = 'md' }: ActivityTypeChipProps) {
  const cfg = typeConfig[type]
  const sizeClass =
    size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.bg} ${cfg.text} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {type}
    </span>
  )
}

export { typeConfig }
