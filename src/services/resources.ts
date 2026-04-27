// Service layer for resources and resource_categories.
// To migrate to API: replace each function body with a fetch() call to your backend.

import { db } from '#/db/index'
import type { Resource, ResourceCategory } from '#/db/index'

const DEFAULT_SEED: Array<{ name: string; resources: Array<{ title: string; url: string; tags: string[] }> }> = [
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
      { title: 'TED-Ed', url: 'https://www.youtube.com/@TED-Ed', tags: ['listening', 'ideas', 'education'] },
      { title: 'Crash Course', url: 'https://www.youtube.com/@crashcourse', tags: ['listening', 'education', 'varied'] },
    ],
  },
]

export const categoriesService = {
  getAll(planId: number): Promise<ResourceCategory[]> {
    return db.resource_categories.where('plan_id').equals(planId).sortBy('name')
  },

  create(planId: number, name: string): Promise<number> {
    return db.resource_categories.add({
      plan_id: planId,
      name,
      created_at: Date.now(),
    }) as Promise<number>
  },

  delete(id: number): Promise<void> {
    return db.resource_categories.delete(id)
  },
}

export const resourcesService = {
  getAll(planId: number): Promise<Resource[]> {
    return db.resources.where('plan_id').equals(planId).sortBy('title')
  },

  getForCategory(planId: number, categoryId: number): Promise<Resource[]> {
    return db.resources
      .where('[plan_id+category_id]')
      .equals([planId, categoryId])
      .toArray()
  },

  create(resource: Omit<Resource, 'id'>): Promise<number> {
    return db.resources.add(resource) as Promise<number>
  },

  update(id: number, changes: Partial<Resource>): Promise<number> {
    return db.resources.update(id, changes)
  },

  delete(id: number): Promise<void> {
    return db.resources.delete(id)
  },

  deleteForCategory(planId: number, categoryId: number): Promise<number> {
    return db.resources
      .where('[plan_id+category_id]')
      .equals([planId, categoryId])
      .delete()
  },
}

export async function seedDefaultResources(planId: number): Promise<void> {
  const existing = await db.resource_categories.where('plan_id').equals(planId).count()
  if (existing > 0) return

  const now = Date.now()
  for (const section of DEFAULT_SEED) {
    const catId = (await db.resource_categories.add({
      plan_id: planId,
      name: section.name,
      created_at: now,
    })) as number
    for (const r of section.resources) {
      await db.resources.add({
        plan_id: planId,
        category_id: catId,
        title: r.title,
        url: r.url,
        notes: '',
        tags: r.tags,
        created_at: now,
      })
    }
  }
}
