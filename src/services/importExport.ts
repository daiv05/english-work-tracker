import { categoriesService, resourcesService } from '#/services/resources'
import type { StudyPlan } from '#/db/index'
import type { WeeklyPlanTemplate } from '#/services/types'

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Resources ──────────────────────────────────────────────────────────────

interface ResourceExportItem {
  title: string
  url?: string
  notes?: string
  tags: string[]
}

interface CategoryExportItem {
  name: string
  resources: ResourceExportItem[]
}

interface ResourcesExport {
  version: 1
  exported_at: number
  categories: CategoryExportItem[]
}

export async function exportResources(planId: number): Promise<void> {
  const [categories, resources] = await Promise.all([
    categoriesService.getAll(planId),
    resourcesService.getAll(planId),
  ])

  const data: ResourcesExport = {
    version: 1,
    exported_at: Date.now(),
    categories: categories.map((cat) => ({
      name: cat.name,
      resources: resources
        .filter((r) => r.category_id === cat.id)
        .map((r) => ({
          title: r.title,
          url: r.url || undefined,
          notes: r.notes || undefined,
          tags: r.tags ?? [],
        })),
    })),
  }

  downloadJson('resources-export.json', data)
}

export async function importResources(planId: number, jsonString: string): Promise<void> {
  let data: ResourcesExport
  try {
    data = JSON.parse(jsonString) as ResourcesExport
  } catch {
    throw new Error('Invalid JSON file.')
  }

  if (!Array.isArray(data.categories)) {
    throw new Error('Invalid resources export format.')
  }

  const existingCats = await categoriesService.getAll(planId)
  const existingNames = new Set(existingCats.map((c) => c.name.toLowerCase()))

  for (const catItem of data.categories) {
    if (!catItem.name || !Array.isArray(catItem.resources)) continue

    let catId: number
    const existing = existingCats.find((c) => c.name.toLowerCase() === catItem.name.toLowerCase())
    if (existing) {
      catId = existing.id!
    } else {
      catId = await categoriesService.create(planId, catItem.name)
      existingNames.add(catItem.name.toLowerCase())
    }

    for (const r of catItem.resources) {
      if (!r.title) continue
      await resourcesService.create({
        plan_id: planId,
        category_id: catId,
        title: r.title,
        url: r.url,
        notes: r.notes,
        tags: r.tags ?? [],
        created_at: Date.now(),
      })
    }
  }
}

// ── Plan template ──────────────────────────────────────────────────────────

interface PlanTemplateExport {
  version: 1
  exported_at: number
  plan_name: string
  template: WeeklyPlanTemplate
}

export function exportPlanTemplate(plan: StudyPlan): void {
  const template = JSON.parse(plan.template_json) as WeeklyPlanTemplate
  const data: PlanTemplateExport = {
    version: 1,
    exported_at: Date.now(),
    plan_name: plan.name,
    template,
  }
  downloadJson('plan-template.json', data)
}

export function importPlanTemplate(jsonString: string): WeeklyPlanTemplate | null {
  let data: PlanTemplateExport
  try {
    data = JSON.parse(jsonString) as PlanTemplateExport
  } catch {
    return null
  }

  const template = data.template ?? data
  if (typeof template !== 'object' || Array.isArray(template)) return null

  // Validate at least one known day key with an array of blocks
  const knownDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'express_day']
  const hasValidDay = knownDays.some(
    (day) => Array.isArray((template as Record<string, unknown>)[day]),
  )
  if (!hasValidDay) return null

  return template
}
