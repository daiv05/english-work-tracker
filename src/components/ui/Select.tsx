import { useEffect, useRef, useState } from 'react'

export interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  variant?: 'light' | 'dark'
  className?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  variant = 'light',
  className = '',
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = options.find((o) => o.value === value)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focusedIndex < 0) return
    const item = listRef.current?.children[focusedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex, open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
        setFocusedIndex(options.findIndex((o) => o.value === value))
      }
      return
    }
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault()
      onChange(options[focusedIndex].value)
      setOpen(false)
    }
  }

  const isDark = variant === 'dark'

  const triggerBase = isDark
    ? 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
    : 'border border-outline-variant bg-white text-on-surface hover:bg-surface-low'

  const dropdownBase = isDark
    ? 'bg-[#1a2235] border border-white/10'
    : 'bg-white border border-outline-variant'

  const optionBase = isDark
    ? 'text-white hover:bg-white/10'
    : 'text-on-surface hover:bg-surface-low'

  const optionActive = isDark ? 'bg-secondary/20 text-secondary-light' : 'bg-secondary/10 text-secondary'

  const chevronColor = isDark ? 'text-white/40' : 'text-outline'

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen((o) => !o); setFocusedIndex(options.findIndex((o) => o.value === value)) } }}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-light/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${triggerBase} ${className}`}
      >
        <span className={`truncate ${!selected ? (isDark ? 'text-white/40' : 'text-outline') : ''}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${chevronColor}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto ${dropdownBase}`}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value
            const isFocused = i === focusedIndex
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setFocusedIndex(i)}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  isSelected ? optionActive : isFocused ? (isDark ? 'bg-white/8' : 'bg-surface-low') : optionBase
                }`}
              >
                {opt.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
