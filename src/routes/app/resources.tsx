import { useState, useMemo, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Modal } from '#/components/ui/Modal'
import { useToast } from '#/components/ui/ToastProvider'
import { SearchSelect } from '#/components/ui/SearchSelect'
import { categoriesService, resourcesService, DEFAULT_SEED } from '#/services/resources'
import { exportResources, importResources } from '#/services/importExport'
import type { Resource, ResourceCategory } from '#/db/index'
import { useResourceCategories, useResources } from '#/db/hooks'
import { useProfileStore } from '#/store/profile'

export const Route = createFileRoute('/app/resources')({
  component: ResourceLibrary,
})

// Color themes per category (cycles through these)
const CATEGORY_THEMES = [
  {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
  {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-500',
  },
  {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  {
    bg: 'bg-pink-50',
    icon: 'text-pink-600',
    badge: 'bg-pink-100 text-pink-700',
    dot: 'bg-pink-500',
  },
]

function CategoryIcon({ index }: { index: number }) {
  const theme = CATEGORY_THEMES[index % CATEGORY_THEMES.length]
  const icons = [
    // headphones
    <svg
      key="0"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>,
    // play
    <svg
      key="1"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>,
    // book
    <svg
      key="2"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>,
    // document
    <svg
      key="3"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>,
    // link
    <svg
      key="4"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>,
    // star
    <svg
      key="5"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>,
  ]
  return (
    <div
      className={`w-8 h-8 rounded-lg ${theme.bg} flex items-center justify-center ${theme.icon} shrink-0`}
    >
      {icons[index % icons.length]}
    </div>
  )
}

function TagChip({ tag }: { tag: string }) {
  return (
    <span className="inline-block bg-surface-low text-on-surface-variant text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full">
      {tag}
    </span>
  )
}

function ResourceCard({
  resource,
  onDelete,
}: {
  resource: Resource
  onDelete: (id: number) => void
}) {
  return (
    <div className="bg-white border border-surface-high hover:border-outline-variant rounded-xl p-4 shadow-card-sm hover:shadow-card-hover transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center shrink-0">
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="var(--color-outline)"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <button
          onClick={() => onDelete(resource.id!)}
          className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-outline-variant hover:text-red-500"
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
      <div className="mt-2.5">
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-on-surface hover:text-secondary transition-colors block leading-tight line-clamp-2"
          >
            {resource.title}
            <svg
              className="inline ml-1 mb-0.5"
              width="10"
              height="10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ) : (
          <p className="text-sm font-semibold text-on-surface leading-tight line-clamp-2">
            {resource.title}
          </p>
        )}
        {resource.url && (
          <p className="text-[11px] text-outline mt-0.5 truncate">
            {resource.url}
          </p>
        )}
      </div>
      {resource.notes && (
        <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
          {resource.notes}
        </p>
      )}
      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {resource.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  )
}

function RecommendedModal({
  open,
  onClose,
  planId,
  existingResources,
}: {
  open: boolean
  onClose: () => void
  planId?: number
  existingResources: Resource[]
}) {
  const toast = useToast()
  const [adding, setAdding] = useState<string | null>(null)

  function isAdded(url: string) {
    return existingResources.some((r) => r.url === url)
  }

  async function addSingle(categoryName: string, res: { title: string; url: string; tags: string[] }) {
    if (!planId) return
    setAdding(res.url)
    try {
      let catId: number | undefined
      const existingCats = await categoriesService.getAll(planId)
      const existing = existingCats.find((c) => c.name === categoryName)
      if (existing) {
        catId = existing.id
      } else {
        catId = await categoriesService.create(planId, categoryName)
      }
      await resourcesService.create({
        plan_id: planId,
        category_id: catId!,
        title: res.title,
        url: res.url,
        notes: '',
        tags: res.tags,
        created_at: Date.now(),
      })
      toast.success(`Added "${res.title}".`)
    } catch {
      toast.error('Could not add resource.')
    } finally {
      setAdding(null)
    }
  }

  async function addAll() {
    if (!planId) return
    setAdding('__all__')
    try {
      const existingCats = await categoriesService.getAll(planId)
      for (const section of DEFAULT_SEED) {
        let catId: number | undefined
        const existing = existingCats.find((c) => c.name === section.name)
        if (existing) {
          catId = existing.id
        } else {
          catId = await categoriesService.create(planId, section.name)
          existingCats.push({ id: catId, name: section.name, plan_id: planId, created_at: Date.now() })
        }
        for (const res of section.resources) {
          if (isAdded(res.url)) continue
          await resourcesService.create({
            plan_id: planId,
            category_id: catId!,
            title: res.title,
            url: res.url,
            notes: '',
            tags: res.tags,
            created_at: Date.now(),
          })
        }
      }
      toast.success('All recommended resources added.')
      onClose()
    } catch {
      toast.error('Could not add all resources.')
    } finally {
      setAdding(null)
    }
  }

  const totalNew = DEFAULT_SEED.reduce(
    (sum, section) => sum + section.resources.filter((r) => !isAdded(r.url)).length,
    0,
  )

  return (
    <Modal open={open} onClose={onClose} title="Recommended Resources">
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          A curated starter list. Add resources individually or all at once — categories are created automatically.
        </p>
        <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1">
          {DEFAULT_SEED.map((section) => (
            <div key={section.name}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-2">
                {section.name}
              </p>
              <div className="space-y-1.5">
                {section.resources.map((res) => {
                  const added = isAdded(res.url)
                  const isLoading = adding === res.url
                  return (
                    <div
                      key={res.url}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-surface-high bg-white"
                    >
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-tight truncate ${added ? 'text-outline line-through' : 'text-on-surface'}`}>
                          {res.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {res.tags.map((t) => (
                            <span key={t} className="text-[10px] text-outline font-medium bg-surface-low px-1.5 py-0.5 rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      {added ? (
                        <span className="shrink-0 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Added
                        </span>
                      ) : (
                        <button
                          onClick={() => void addSingle(section.name, res)}
                          disabled={isLoading || adding === '__all__'}
                          className="cursor-pointer shrink-0 px-2.5 py-1 rounded-lg bg-primary-dark/8 text-primary-dark text-[11px] font-semibold hover:bg-primary-dark/15 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? '…' : '+ Add'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-1 border-t border-surface-high">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            Close
          </button>
          {totalNew > 0 && (
            <button
              type="button"
              onClick={() => void addAll()}
              disabled={adding === '__all__'}
              className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors disabled:opacity-50"
            >
              {adding === '__all__' ? 'Adding…' : `Add All (${totalNew})`}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function AddResourceForm({
  planId,
  categories,
  onSave,
  onCancel,
}: {
  planId?: number
  categories: ResourceCategory[]
  onSave: () => void
  onCancel: () => void
}) {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id ? String(categories[0].id) : '',
  )
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [creatingCat, setCreatingCat] = useState(false)

  const inp =
    'w-full border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-transparent placeholder:text-outline'
  const lbl =
    'block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5'

  async function createCategory() {
    if (!planId) return
    if (!newCatName.trim()) return
    try {
      const id = await categoriesService.create(planId, newCatName.trim())
      setCategoryId(String(id))
      setNewCatName('')
      setCreatingCat(false)
      toast.success('Category created.')
    } catch {
      toast.error('Could not create category.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!planId) return
    if (!title.trim() || !categoryId) return
    try {
      await resourcesService.create({
        plan_id: planId,
        category_id: parseInt(categoryId),
        title: title.trim(),
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        created_at: Date.now(),
      })
      toast.success('Resource added.')
      onSave()
    } catch {
      toast.error('Could not add resource. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={lbl}>Title *</label>
        <input
          type="text"
          placeholder="e.g. Syntax Podcast"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inp}
          autoFocus
        />
      </div>
      <div>
        <label className={lbl}>URL (optional)</label>
        <input
          type="url"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inp}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={lbl.replace('mb-1.5', '')}>Category *</label>
          <button
            type="button"
            onClick={() => setCreatingCat((s) => !s)}
            className="cursor-pointer text-xs text-tertiary font-semibold hover:underline"
          >
            + New category
          </button>
        </div>
        {creatingCat ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Category name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className={`${inp} flex-1`}
            />
            <button
              type="button"
              onClick={createCategory}
              className="cursor-pointer px-3 py-2 bg-primary-dark text-white rounded-lg text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
            >
              Add
            </button>
          </div>
        ) : (
          <SearchSelect
            options={categories.map((c) => ({ value: c.id!, label: c.name }))}
            value={categoryId !== '' ? Number(categoryId) : undefined}
            onChange={(val) => setCategoryId(String(val))}
            placeholder="— Select category —"
            searchPlaceholder="Search categories…"
          />
        )}
      </div>
      <div>
        <label className={lbl}>Notes (optional)</label>
        <textarea
          placeholder="Short description or notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={`${inp} resize-none`}
        />
      </div>
      <div>
        <label className={lbl}>Tags (comma-separated)</label>
        <input
          type="text"
          placeholder="e.g. technical, advanced, podcast"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={inp}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
        >
          Add Resource
        </button>
      </div>
    </form>
  )
}

function ResourceLibrary() {
  const toast = useToast()
  const activePlanId = useProfileStore((s) => s.activePlanId)
  const [search, setSearch] = useState('')
  const [showAddResource, setShowAddResource] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [showRecommended, setShowRecommended] = useState(false)
  const [importing, setImporting] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)
  const categories = useResourceCategories()
  const allResources = useResources()

  async function handleExport() {
    if (!activePlanId) return
    try {
      await exportResources(activePlanId)
      toast.success('Resources exported.')
    } catch {
      toast.error('Export failed.')
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !activePlanId) return
    setImporting(true)
    try {
      const text = await file.text()
      await importResources(activePlanId, text)
      toast.success('Resources imported.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setImporting(false)
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return allResources
    return allResources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [allResources, search])

  async function handleDeleteResource(id: number) {
    if (!confirm('Delete this resource?')) return
    try {
      await resourcesService.delete(id)
      toast.success('Resource deleted.')
    } catch {
      toast.error('Could not delete resource.')
    }
  }

  async function handleDeleteCategory(id: number) {
    const count = allResources.filter((r) => r.category_id === id).length
    if (
      confirm(
        count > 0
          ? `Delete category and its ${count} resource${count !== 1 ? 's' : ''}?`
          : 'Delete this empty category?',
      )
    ) {
      try {
        await categoriesService.delete(id)
        toast.success('Category deleted.')
      } catch {
        toast.error('Could not delete category.')
      }
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!activePlanId) return
    if (!newCatName.trim()) return
    try {
      await categoriesService.create(activePlanId, newCatName.trim())
      setNewCatName('')
      setShowAddCategory(false)
      toast.success('Category created.')
    } catch {
      toast.error('Could not create category.')
    }
  }

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            Resource Library
          </h1>
          <p className="text-sm text-outline mt-0.5">
            Your curated English learning links
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="cursor-pointer px-3 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors flex items-center gap-1.5"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={importing}
            className="cursor-pointer px-3 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {importing ? 'Importing…' : 'Import'}
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => setShowAddCategory(true)}
            className="cursor-pointer px-3 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            + Category
          </button>
          <button
            onClick={() => setShowAddResource(true)}
            className="cursor-pointer flex items-center gap-2 bg-primary-dark text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
          >
            <svg
              width="14"
              height="14"
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
            Add Resource
          </button>
        </div>
      </div>

      {/* Recommended */}
      <div className="mb-4">
        <button
          onClick={() => setShowRecommended(true)}
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-secondary/30 bg-secondary/5 text-secondary text-sm font-semibold hover:bg-secondary/10 transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Recommended
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
          width="15"
          height="15"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search resources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-tertiary placeholder:text-outline shadow-card-sm"
        />
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-outline-variant rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-surface-low flex items-center justify-center mx-auto mb-4">
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--color-outline)"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <p className="text-base font-semibold text-on-surface-variant">
            No resources yet
          </p>
          <p className="text-sm text-outline mt-1 mb-5">
            Create categories to organize your learning links.
          </p>
          <button
            onClick={() => setShowAddCategory(true)}
            className="cursor-pointer inline-flex items-center gap-2 bg-primary-dark text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
          >
            + Create first category
          </button>
        </div>
      )}

      {/* Search results */}
      {search && (
        <div>
          <p className="text-xs text-outline mb-3 font-medium">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "
            {search}"
          </p>
          {filtered.length === 0 ? (
            <p className="text-sm text-outline text-center py-10">
              No resources match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onDelete={handleDeleteResource}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category sections */}
      {!search && (
        <div className="space-y-10">
          {categories.map((cat, i) => {
            const catResources = allResources.filter(
              (r) => r.category_id === cat.id,
            )
            return (
              <section key={cat.id}>
                {/* Section header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CategoryIcon index={i} />
                    <div>
                      <h2 className="text-base font-bold text-on-surface leading-tight">
                        {cat.name}
                      </h2>
                      <p className="text-xs text-outline">
                        {catResources.length} resource
                        {catResources.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddResource(true)}
                      className="cursor-pointer text-xs font-semibold text-tertiary hover:underline"
                    >
                      + Add link
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id!)}
                      className="cursor-pointer text-xs text-outline-variant hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {catResources.length === 0 ? (
                  <div className="border border-dashed border-surface-high rounded-xl py-8 text-center">
                    <p className="text-sm text-outline">
                      Empty.{' '}
                      <button
                        onClick={() => setShowAddResource(true)}
                        className="cursor-pointer text-tertiary hover:underline font-medium"
                      >
                        Add your first link
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catResources.map((r) => (
                      <ResourceCard
                        key={r.id}
                        resource={r}
                        onDelete={handleDeleteResource}
                      />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {/* Recommended Resources Modal */}
      <RecommendedModal
        open={showRecommended}
        onClose={() => setShowRecommended(false)}
        planId={activePlanId}
        existingResources={allResources}
      />

      {/* Add Resource Modal */}
      <Modal
        open={showAddResource}
        onClose={() => setShowAddResource(false)}
        title="Add Resource"
      >
        {categories.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-on-surface-variant mb-4">
              Create a category before adding resources.
            </p>
            <button
              onClick={() => {
                setShowAddResource(false)
                setShowAddCategory(true)
              }}
              className="cursor-pointer bg-primary-dark text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
            >
              Create a category first
            </button>
          </div>
        ) : (
          <AddResourceForm
            planId={activePlanId}
            categories={categories}
            onSave={() => setShowAddResource(false)}
            onCancel={() => setShowAddResource(false)}
          />
        )}
      </Modal>

      {/* Add Category Modal */}
      <Modal
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="New Category"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5">
              Category name *
            </label>
            <input
              type="text"
              placeholder="e.g. Podcasts, YouTube, Articles"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              autoFocus
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAddCategory(false)}
              className="cursor-pointer flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer flex-1 py-2.5 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
