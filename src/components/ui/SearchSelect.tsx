import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface SearchSelectOption {
  value: string | number
  label: string
  group?: string
}

interface SearchSelectProps {
  options: SearchSelectOption[]
  value?: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  variant?: 'light' | 'dark'
  className?: string
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-secondary/20 text-secondary font-semibold rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  disabled = false,
  variant = 'light',
  className = '',
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  // Group the filtered options
  const grouped = filtered.reduce<{ group: string | undefined; items: SearchSelectOption[] }[]>(
    (acc, opt) => {
      const last = acc[acc.length - 1]
      if (last && last.group === opt.group) {
        last.items.push(opt)
      } else {
        acc.push({ group: opt.group, items: [opt] })
      }
      return acc
    },
    [],
  )

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      const target = e.target as Node
      const clickedTrigger = !!containerRef.current?.contains(target)
      const clickedDropdown = !!dropdownRef.current?.contains(target)
      if (!clickedTrigger && !clickedDropdown) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Position dropdown in a portal so it doesn't expand scrollable parents
  useEffect(() => {
    if (!open) {
      setDropdownStyle(null)
      return
    }

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const gap = 4
      const width = Math.max(rect.width, 180)
      setDropdownStyle({
        top: rect.bottom + gap,
        left: rect.left,
        width,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  // Focus search input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery('')
    }
  }, [open])

  const isDark = variant === 'dark'

  const triggerBase = isDark
    ? 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
    : 'border border-outline-variant bg-white text-on-surface hover:bg-surface-low'

  const dropdownBase = isDark
    ? 'bg-[#1a2235] border border-white/10'
    : 'bg-white border border-outline-variant'

  const searchBase = isDark
    ? 'bg-white/5 border-b border-white/10 text-white placeholder:text-white/30'
    : 'bg-surface-low border-b border-outline-variant text-on-surface placeholder:text-outline'

  const optionBase = isDark
    ? 'text-white hover:bg-white/10 cursor-pointer'
    : 'text-on-surface hover:bg-surface-low cursor-pointer'

  const optionActive = isDark ? 'bg-secondary/20 text-secondary-light' : 'bg-secondary/10 text-secondary'

  const groupLabel = isDark ? 'text-white/35' : 'text-outline'

  const chevronColor = isDark ? 'text-white/40' : 'text-outline'

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen((o) => !o) }}
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

      {open && typeof document !== 'undefined' && dropdownStyle &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`z-[60] rounded-lg shadow-lg overflow-hidden ${dropdownBase}`}
            style={{
              position: 'fixed',
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
            }}
          >
            {/* Search input */}
            <div className="p-1.5">
              <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${searchBase}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={isDark ? 'text-white/40 shrink-0' : 'text-outline shrink-0'}>
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false) } }}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
                />
              </div>
            </div>

            {/* Options list */}
            <ul className="max-h-48 overflow-y-auto pb-1">
              {grouped.length === 0 ? (
                <li className={`px-3 py-3 text-sm text-center ${isDark ? 'text-white/40' : 'text-outline'}`}>
                  No results
                </li>
              ) : (
                grouped.map((section, si) => (
                  <li key={si}>
                    {section.group && (
                      <p className={`px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest ${groupLabel}`}>
                        {section.group}
                      </p>
                    )}
                    <ul>
                      {section.items.map((opt) => (
                        <li
                          key={opt.value}
                          role="option"
                          aria-selected={opt.value === value}
                          onClick={() => { onChange(opt.value); setOpen(false); setQuery('') }}
                          className={`px-3 py-2 text-sm transition-colors ${
                            opt.value === value ? optionActive : optionBase
                          }`}
                        >
                          {highlight(opt.label, query)}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}
