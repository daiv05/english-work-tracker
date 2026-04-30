import { apiFetch } from '#/lib/api'
import { useAuthStore } from '#/store/auth'
import type { Resource, ResourceCategory } from '#/db/index'

function token() {
  return useAuthStore.getState().accessToken ?? undefined
}

export const DEFAULT_SEED: Array<{ name: string; resources: Array<{ title: string; url: string; tags: string[] }> }> = [
  {
    name: 'Daily Life',
    resources: [
      { title: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish', tags: ['listening', 'reading', 'general'] },
      { title: 'VOA Learning English', url: 'https://learningenglish.voanews.com', tags: ['listening', 'reading', 'news'] },
      { title: 'News in Levels', url: 'https://www.newsinlevels.com', tags: ['reading', 'news', 'leveled'] },
      { title: 'TED Talks', url: 'https://www.ted.com/talks', tags: ['listening', 'speaking', 'ideas'] },
      { title: 'Merriam-Webster', url: 'https://www.merriam-webster.com', tags: ['vocabulary', 'reference', 'dictionary'] },
    ],
  },
  {
    name: 'Tech & Dev',
    resources: [
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', tags: ['reading', 'tech', 'reference'] },
      { title: 'CSS-Tricks', url: 'https://css-tricks.com', tags: ['reading', 'tech', 'css'] },
      { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org', tags: ['reading', 'tech', 'tutorials'] },
      { title: 'Dev.to', url: 'https://dev.to', tags: ['reading', 'tech', 'community'] },
      { title: 'Hacker News', url: 'https://news.ycombinator.com', tags: ['reading', 'tech', 'news'] },
    ],
  },
  {
    name: 'Podcasts',
    resources: [
      { title: '6 Minute English (BBC)', url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', tags: ['listening', 'podcast', 'general'] },
      { title: 'English Learning for Curious Minds', url: 'https://www.leonardoenglish.com/podcasts', tags: ['listening', 'podcast', 'intermediate'] },
      { title: 'Syntax.fm', url: 'https://syntax.fm', tags: ['listening', 'podcast', 'tech'] },
      { title: 'The Changelog', url: 'https://changelog.com/podcast', tags: ['listening', 'podcast', 'tech'] },
      { title: 'The English We Speak (BBC)', url: 'https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak', tags: ['listening', 'vocabulary', 'idioms'] },
    ],
  },
  {
    name: 'Grammar & Reference',
    resources: [
      { title: 'Cambridge Dictionary', url: 'https://dictionary.cambridge.org', tags: ['vocabulary', 'reference', 'grammar'] },
      { title: 'Grammarly Blog', url: 'https://www.grammarly.com/blog', tags: ['writing', 'grammar', 'tips'] },
      { title: 'British Council Grammar', url: 'https://www.britishcouncil.org/english/grammar', tags: ['grammar', 'exercises', 'reference'] },
      { title: "Oxford Learner's Dictionaries", url: 'https://www.oxfordlearnersdictionaries.com', tags: ['vocabulary', 'reference', 'dictionary'] },
    ],
  },
  {
    name: 'YouTube',
    resources: [
      { title: 'English with Lucy', url: 'https://www.youtube.com/@EnglishWithLucy', tags: ['listening', 'speaking', 'general'] },
      { title: 'Learn English with TV Series', url: 'https://www.youtube.com/@LearnEnglishWithTVSeries', tags: ['listening', 'vocabulary', 'entertainment'] },
      { title: 'TED', url: 'https://www.youtube.com/@TED', tags: ['listening', 'ideas', 'education'] },
      { title: 'Crash Course', url: 'https://www.youtube.com/@crashcourse', tags: ['listening', 'education', 'varied'] },
    ],
  },
]

interface ApiCategory {
  id: number
  plan_id: number
  name: string
  created_at: number
}

interface ApiResource {
  id: number
  plan_id: number
  category_id: number
  title: string
  url: string | null
  notes: string | null
  tags: string[]
  created_at: number
}

export const categoriesService = {
  async getAll(planId: number): Promise<ResourceCategory[]> {
    return apiFetch<ApiCategory[]>(`/resource-categories?plan_id=${planId}`, { token: token() })
  },

  async create(planId: number, name: string): Promise<number> {
    const cat = await apiFetch<ApiCategory>('/resource-categories', {
      method: 'POST',
      token: token(),
      body: JSON.stringify({ plan_id: planId, name, created_at: Date.now() }),
    })
    return cat.id
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/resource-categories/${id}`, { method: 'DELETE', token: token() })
  },
}

function mapResource(r: ApiResource): Resource {
  return { ...r, url: r.url ?? undefined, notes: r.notes ?? undefined }
}

export const resourcesService = {
  async getAll(planId: number): Promise<Resource[]> {
    const items = await apiFetch<ApiResource[]>(`/resources?plan_id=${planId}`, { token: token() })
    return items.map(mapResource)
  },

  async getForCategory(planId: number, categoryId: number): Promise<Resource[]> {
    const items = await apiFetch<ApiResource[]>(`/resources?plan_id=${planId}&category_id=${categoryId}`, { token: token() })
    return items.map(mapResource)
  },

  async create(resource: Omit<Resource, 'id'>): Promise<number> {
    const created = await apiFetch<ApiResource>('/resources', {
      method: 'POST',
      token: token(),
      body: JSON.stringify(resource),
    })
    return created.id
  },

  async update(id: number, changes: Partial<Resource>): Promise<number> {
    await apiFetch(`/resources/${id}`, { method: 'PUT', token: token(), body: JSON.stringify(changes) })
    return 1
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/resources/${id}`, { method: 'DELETE', token: token() })
  },

  async deleteForCategory(_planId: number, categoryId: number): Promise<number> {
    // Category deletion cascades on the server side; this is a no-op
    void categoryId
    return 0
  },
}

export interface DefaultResourceItem {
  id: number
  category_name: string
  title: string
  url: string | null
  tags: string[]
  sort_order: number
}

interface DefaultResourceCreateBody {
  category_name: string
  title: string
  url: string | null
  tags: string[]
  sort_order: number
}

interface DefaultResourceUpdateBody {
  category_name?: string
  title?: string
  url?: string | null
  tags?: string[]
  sort_order?: number
}

export const defaultResourcesService = {
  async getAll(): Promise<DefaultResourceItem[]> {
    return apiFetch<DefaultResourceItem[]>('/superadmin/default-resources', { token: token() })
  },

  async create(body: DefaultResourceCreateBody): Promise<DefaultResourceItem> {
    return apiFetch<DefaultResourceItem>('/superadmin/default-resources', {
      method: 'POST',
      token: token(),
      body: JSON.stringify(body),
    })
  },

  async update(id: number, body: DefaultResourceUpdateBody): Promise<DefaultResourceItem> {
    return apiFetch<DefaultResourceItem>(`/superadmin/default-resources/${id}`, {
      method: 'PUT',
      token: token(),
      body: JSON.stringify(body),
    })
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/superadmin/default-resources/${id}`, { method: 'DELETE', token: token() })
  },
}

export async function seedDefaultResources(planId: number): Promise<void> {
  const existing = await categoriesService.getAll(planId)
  if (existing.length > 0) return

  const now = Date.now()
  for (const section of DEFAULT_SEED) {
    const catId = await categoriesService.create(planId, section.name)
    // Use plan_id's first category as the created_at anchor
    void now
    for (const r of section.resources) {
      await resourcesService.create({
        plan_id: planId,
        category_id: catId,
        title: r.title,
        url: r.url,
        notes: '',
        tags: r.tags,
        created_at: Date.now(),
      })
    }
  }
}
