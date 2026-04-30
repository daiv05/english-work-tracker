import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '#/store/auth'
import { useToast } from '#/components/ui/ToastProvider'
import { adminService, activityTipsService   } from '#/services/admin'
import type {AdminUserRow, ActivityTipItem} from '#/services/admin';
import { defaultResourcesService  } from '#/services/resources'
import type {DefaultResourceItem} from '#/services/resources';

export const Route = createFileRoute('/app/admin')({
  component: AdminPage,
})

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const toast = useToast()

  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [resources, setResources] = useState<DefaultResourceItem[]>([])
  const [tips, setTips] = useState<ActivityTipItem[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingResources, setLoadingResources] = useState(true)
  const [loadingTips, setLoadingTips] = useState(true)

  // Accordion state
  const [expandedSections, setExpandedSections] = useState({ users: true, resources: true, tips: true })

  // Add resource form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newTags, setNewTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Edit resource state
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null)
  const [editCategory, setEditCategory] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editTags, setEditTags] = useState('')
  const [savingEditResource, setSavingEditResource] = useState(false)

  // Add activity tip form state
  const [showAddTipForm, setShowAddTipForm] = useState(false)
  const [newTipActivityType, setNewTipActivityType] = useState('')
  const [newTipHow, setNewTipHow] = useState('')
  const [newTipTips, setNewTipTips] = useState('')
  const [savingTip, setSavingTip] = useState(false)
  const [deletingTipId, setDeletingTipId] = useState<number | null>(null)

  // Edit tip state
  const [editingTipId, setEditingTipId] = useState<number | null>(null)
  const [editTipActivityType, setEditTipActivityType] = useState('')
  const [editTipHow, setEditTipHow] = useState('')
  const [editTipTips, setEditTipTips] = useState('')
  const [savingEditTip, setSavingEditTip] = useState(false)

  const ACTIVITY_TYPES = ['Listening', 'Reading', 'Writing', 'Speaking', 'Shadowing', 'Vocabulary', 'Other']

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  useEffect(() => {
    if (user !== null && !user.is_superadmin) {
      void navigate({ to: '/app', replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (!user?.is_superadmin) return
    void adminService.getUsers()
      .then(setUsers)
      .catch(() => toast.error('Could not load users.'))
      .finally(() => setLoadingUsers(false))
    void defaultResourcesService.getAll()
      .then(setResources)
      .catch(() => toast.error('Could not load default resources.'))
      .finally(() => setLoadingResources(false))
    void activityTipsService.getAll()
      .then(setTips)
      .catch(() => toast.error('Could not load activity tips.'))
      .finally(() => setLoadingTips(false))
  }, [user])

  if (!user?.is_superadmin) return null

  const groupedResources = resources.reduce<Record<string, DefaultResourceItem[]>>((acc, item) => {
    if (!acc[item.category_name]) acc[item.category_name] = []
    acc[item.category_name].push(item)
    return acc
  }, {})

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newCategory.trim()) return
    setSaving(true)
    try {
      const created = await defaultResourcesService.create({
        category_name: newCategory.trim(),
        title: newTitle.trim(),
        url: newUrl.trim() || null,
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
        sort_order: 0,
      })
      setResources((prev) => [...prev, created])
      setShowAddForm(false)
      setNewCategory('')
      setNewTitle('')
      setNewUrl('')
      setNewTags('')
      toast.success('Resource added.')
    } catch {
      toast.error('Could not add resource.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await defaultResourcesService.delete(id)
      setResources((prev) => prev.filter((r) => r.id !== id))
      toast.success('Resource removed.')
    } catch {
      toast.error('Could not delete resource.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleEditResource(resource: DefaultResourceItem) {
    setEditingResourceId(resource.id)
    setEditCategory(resource.category_name)
    setEditTitle(resource.title)
    setEditUrl(resource.url || '')
    setEditTags(resource.tags.join(', '))
  }

  async function handleSaveEditResource(id: number) {
    if (!editTitle.trim() || !editCategory.trim()) return
    setSavingEditResource(true)
    try {
      const updated = await defaultResourcesService.update(id, {
        category_name: editCategory.trim(),
        title: editTitle.trim(),
        url: editUrl.trim() || null,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      setResources((prev) => prev.map((r) => (r.id === id ? updated : r)))
      setEditingResourceId(null)
      toast.success('Resource updated.')
    } catch {
      toast.error('Could not update resource.')
    } finally {
      setSavingEditResource(false)
    }
  }

  async function handleCancelEditResource() {
    setEditingResourceId(null)
    setEditCategory('')
    setEditTitle('')
    setEditUrl('')
    setEditTags('')
  }

  async function handleAddTip(e: React.FormEvent) {
    e.preventDefault()
    if (!newTipActivityType.trim() || !newTipHow.trim()) return
    setSavingTip(true)
    try {
      const created = await activityTipsService.create({
        activity_type: newTipActivityType.trim(),
        how: newTipHow.trim(),
        tips: newTipTips.split('\n').map((t) => t.trim()).filter(Boolean),
        sort_order: 0,
      })
      setTips((prev) => [...prev, created])
      setShowAddTipForm(false)
      setNewTipActivityType('')
      setNewTipHow('')
      setNewTipTips('')
      toast.success('Activity tip added.')
    } catch {
      toast.error('Could not add activity tip.')
    } finally {
      setSavingTip(false)
    }
  }

  async function handleDeleteTip(id: number) {
    setDeletingTipId(id)
    try {
      await activityTipsService.delete(id)
      setTips((prev) => prev.filter((t) => t.id !== id))
      toast.success('Activity tip removed.')
    } catch {
      toast.error('Could not delete activity tip.')
    } finally {
      setDeletingTipId(null)
    }
  }

  async function handleEditTip(tip: ActivityTipItem) {
    setEditingTipId(tip.id)
    setEditTipActivityType(tip.activity_type)
    setEditTipHow(tip.how)
    setEditTipTips(tip.tips.join('\n'))
  }

  async function handleSaveEditTip(id: number) {
    if (!editTipActivityType.trim() || !editTipHow.trim()) return
    setSavingEditTip(true)
    try {
      const updated = await activityTipsService.update(id, {
        activity_type: editTipActivityType.trim(),
        how: editTipHow.trim(),
        tips: editTipTips.split('\n').map((t) => t.trim()).filter(Boolean),
      })
      setTips((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setEditingTipId(null)
      toast.success('Activity tip updated.')
    } catch {
      toast.error('Could not update activity tip.')
    } finally {
      setSavingEditTip(false)
    }
  }

  async function handleCancelEditTip() {
    setEditingTipId(null)
    setEditTipActivityType('')
    setEditTipHow('')
    setEditTipTips('')
  }

  const inp = 'w-full border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-transparent placeholder:text-outline'
  const lbl = 'block text-[11px] font-semibold uppercase tracking-widest text-outline mb-1.5'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Superadmin Panel</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage users and default resources.</p>
      </div>

      {/* Users table */}
      <section className="border border-surface-high rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('users')}
          className="w-full flex items-center justify-between px-6 py-4 bg-surface-low hover:bg-surface-high transition-colors cursor-pointer"
        >
          <h2 className="text-lg font-semibold text-on-surface">All Users</h2>
          <span className="text-outline transition-transform" style={{ transform: expandedSections.users ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>
        {expandedSections.users && (
          <div className="px-6 py-4">
            {loadingUsers ? (
              <p className="text-sm text-on-surface-variant">Loading users…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-high">
                      <th className="px-2 py-3 text-left font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">User</th>
                      <th className="px-2 py-3 text-left font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Email</th>
                      <th className="px-2 py-3 text-left font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Total Time</th>
                      <th className="px-2 py-3 text-left font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Joined</th>
                      <th className="px-2 py-3 text-left font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-high">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-low transition-colors">
                        <td className="px-2 py-3 font-medium text-on-surface">{u.display_name}</td>
                        <td className="px-2 py-3 text-on-surface-variant">{u.email}</td>
                        <td className="px-2 py-3 font-semibold text-secondary">{formatMinutes(u.total_minutes)}</td>
                        <td className="px-2 py-3 text-on-surface-variant">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-2 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-2 py-6 text-center text-on-surface-variant text-sm">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Default resources */}
      <section className="border border-surface-high rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('resources')}
          className="w-full flex items-center justify-between px-6 py-4 bg-surface-low hover:bg-surface-high transition-colors cursor-pointer"
        >
          <h2 className="text-lg font-semibold text-on-surface">Default / Recommended Resources</h2>
          <span className="text-outline transition-transform" style={{ transform: expandedSections.resources ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>
        {expandedSections.resources && (
          <div className="px-6 py-4 space-y-4 border-t border-surface-high">
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="cursor-pointer px-4 py-2 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
            >
              {showAddForm ? 'Cancel' : '+ Add Resource'}
            </button>

            {showAddForm && (
              <form onSubmit={(e) => void handleAddResource(e)} className="p-5 rounded-2xl border border-surface-high bg-surface-low space-y-4">
                <p className="text-sm font-semibold text-on-surface">New Default Resource</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Category</label>
                    <input className={inp} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g. Daily Life" required />
                  </div>
                  <div>
                    <label className={lbl}>Title</label>
                    <input className={inp} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. BBC Learning English" required />
                  </div>
                  <div>
                    <label className={lbl}>URL</label>
                    <input className={inp} value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://…" type="url" />
                  </div>
                  <div>
                    <label className={lbl}>Tags (comma-separated)</label>
                    <input className={inp} value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="listening, reading" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer px-5 py-2 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Resource'}
                </button>
              </form>
            )}

            {loadingResources ? (
              <p className="text-sm text-on-surface-variant">Loading resources…</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedResources).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-2">{category}</p>
                    <div className="space-y-1.5">
                      {items.map((item) =>
                        editingResourceId === item.id ? (
                          <form
                            key={item.id}
                            onSubmit={(e) => {
                              e.preventDefault()
                              void handleSaveEditResource(item.id)
                            }}
                            className="p-4 rounded-xl border border-surface-high bg-surface-low space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className={lbl}>Category</label>
                                <input className={inp} value={editCategory} onChange={(e) => setEditCategory(e.target.value)} required />
                              </div>
                              <div>
                                <label className={lbl}>Title</label>
                                <input className={inp} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                              </div>
                              <div>
                                <label className={lbl}>URL</label>
                                <input className={inp} value={editUrl} onChange={(e) => setEditUrl(e.target.value)} type="url" />
                              </div>
                              <div>
                                <label className={lbl}>Tags</label>
                                <input className={inp} value={editTags} onChange={(e) => setEditTags(e.target.value)} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={savingEditResource}
                                className="cursor-pointer px-3 py-1.5 rounded-lg bg-primary-dark text-white text-xs font-semibold hover:bg-primary-dark-hover transition-colors disabled:opacity-50"
                              >
                                {savingEditResource ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleCancelEditResource()}
                                className="cursor-pointer px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-high transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-surface-high bg-white hover:bg-surface-low transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-on-surface truncate">{item.title}</p>
                              {item.url && (
                                <p className="text-[11px] text-outline truncate">{item.url}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {item.tags.map((t) => (
                                  <span key={t} className="text-[10px] text-outline font-medium bg-surface-low px-1.5 py-0.5 rounded-full">{t}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => void handleEditResource(item)}
                                className="cursor-pointer px-2.5 py-1 rounded-lg text-secondary text-[11px] font-semibold hover:bg-secondary/10 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(item.id)}
                                disabled={deletingId === item.id}
                                className="cursor-pointer px-2.5 py-1 rounded-lg text-red-600 text-[11px] font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {deletingId === item.id ? '…' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))}
                {resources.length === 0 && (
                  <p className="text-sm text-on-surface-variant">No default resources yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Activity tips */}
      <section className="border border-surface-high rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('tips')}
          className="w-full flex items-center justify-between px-6 py-4 bg-surface-low hover:bg-surface-high transition-colors cursor-pointer"
        >
          <h2 className="text-lg font-semibold text-on-surface">Activity Tips & Guidance</h2>
          <span className="text-outline transition-transform" style={{ transform: expandedSections.tips ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>
        {expandedSections.tips && (
          <div className="px-6 py-4 space-y-4 border-t border-surface-high">
            <button
              type="button"
              onClick={() => setShowAddTipForm((v) => !v)}
              className="cursor-pointer px-4 py-2 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
            >
              {showAddTipForm ? 'Cancel' : '+ Add Tip'}
            </button>

            {showAddTipForm && (
              <form onSubmit={(e) => void handleAddTip(e)} className="p-5 rounded-2xl border border-surface-high bg-surface-low space-y-4">
                <p className="text-sm font-semibold text-on-surface">New Activity Tip</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Activity Type</label>
                    <select
                      className={inp}
                      value={newTipActivityType}
                      onChange={(e) => setNewTipActivityType(e.target.value)}
                      required
                    >
                      <option value="">Select activity type…</option>
                      {ACTIVITY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={lbl}>How to Approach This (guidance text)</label>
                  <textarea
                    className={inp}
                    value={newTipHow}
                    onChange={(e) => setNewTipHow(e.target.value)}
                    placeholder="Describe how users should approach this activity…"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className={lbl}>Tips (one per line)</label>
                  <textarea
                    className={inp}
                    value={newTipTips}
                    onChange={(e) => setNewTipTips(e.target.value)}
                    placeholder="Tip 1&#10;Tip 2&#10;Tip 3"
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingTip}
                  className="cursor-pointer px-5 py-2 rounded-lg bg-primary-dark text-white text-sm font-semibold hover:bg-primary-dark-hover transition-colors disabled:opacity-50"
                >
                  {savingTip ? 'Saving…' : 'Save Tip'}
                </button>
              </form>
            )}

            {loadingTips ? (
              <p className="text-sm text-on-surface-variant">Loading activity tips…</p>
            ) : (
              <div className="space-y-3">
                {tips.map((tip) =>
                  editingTipId === tip.id ? (
                    <form
                      key={tip.id}
                      onSubmit={(e) => {
                        e.preventDefault()
                        void handleSaveEditTip(tip.id)
                      }}
                      className="p-4 rounded-xl border border-surface-high bg-surface-low space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Activity Type</label>
                          <select
                            className={inp}
                            value={editTipActivityType}
                            onChange={(e) => setEditTipActivityType(e.target.value)}
                            required
                          >
                            <option value="">Select activity type…</option>
                            {ACTIVITY_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={lbl}>How to Approach This</label>
                        <textarea
                          className={inp}
                          value={editTipHow}
                          onChange={(e) => setEditTipHow(e.target.value)}
                          rows={3}
                          required
                        />
                      </div>
                      <div>
                        <label className={lbl}>Tips (one per line)</label>
                        <textarea
                          className={inp}
                          value={editTipTips}
                          onChange={(e) => setEditTipTips(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={savingEditTip}
                          className="cursor-pointer px-3 py-1.5 rounded-lg bg-primary-dark text-white text-xs font-semibold hover:bg-primary-dark-hover transition-colors disabled:opacity-50"
                        >
                          {savingEditTip ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleCancelEditTip()}
                          className="cursor-pointer px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-high transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      key={tip.id}
                      className="rounded-xl border border-surface-high bg-white hover:bg-surface-low transition-colors p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block text-xs font-semibold bg-secondary/10 text-secondary px-2 py-1 rounded-full mb-2">
                            {tip.activity_type}
                          </span>
                          <p className="text-sm text-on-surface-variant leading-relaxed">{tip.how}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => void handleEditTip(tip)}
                            className="cursor-pointer px-2.5 py-1 rounded-lg text-secondary text-[11px] font-semibold hover:bg-secondary/10 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteTip(tip.id)}
                            disabled={deletingTipId === tip.id}
                            className="cursor-pointer px-2.5 py-1 rounded-lg text-red-600 text-[11px] font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingTipId === tip.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      {tip.tips.length > 0 && (
                        <ul className="mt-3 space-y-1 pl-4">
                          {tip.tips.map((t, i) => (
                            <li key={i} className="text-[13px] text-on-surface-variant flex gap-2">
                              <span className="text-outline">•</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ),
                )}
                {tips.length === 0 && (
                  <p className="text-sm text-on-surface-variant">No activity tips yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
