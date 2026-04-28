import { db } from '#/db/index'

export async function exportAllLocalData() {
  const plans = await db.plans.toArray()
  const planIdMap = new Map<number, number>()
  plans.forEach((p, i) => {
    if (p.id) planIdMap.set(p.id, p.id)
    void i
  })

  const [daily_blocks, writing_entries, resource_categories, resources, monthly_reviews] = await Promise.all([
    db.daily_blocks.toArray(),
    db.writing_entries.toArray(),
    db.resource_categories.toArray(),
    db.resources.toArray(),
    db.monthly_reviews.toArray(),
  ])

  return {
    plans: plans.map((p) => ({
      local_id: p.id,
      name: p.name,
      description: p.description,
      level_from: p.level_from,
      level_to: p.level_to,
      daily_goal_minutes: p.daily_goal_minutes,
      template_json: p.template_json,
      is_active: p.is_active,
      created_at: p.created_at,
      updated_at: p.updated_at,
    })),
    daily_blocks: daily_blocks.map((b) => ({
      plan_local_id: b.plan_id,
      date: b.date,
      start_time: b.start_time,
      type: b.type,
      resource_id: undefined,
      custom_resource_text: b.custom_resource_text,
      duration_minutes: b.duration_minutes,
      notes: b.notes,
      created_at: b.created_at,
    })),
    writing_entries: writing_entries.map((w) => ({
      plan_local_id: w.plan_id,
      date: w.date,
      text: w.text,
      word_count: w.word_count,
      active_time_minutes: w.active_time_minutes,
      prompt: w.prompt,
      created_at: w.created_at,
    })),
    resource_categories: resource_categories.map((c) => ({
      local_id: c.id,
      plan_local_id: c.plan_id,
      name: c.name,
      created_at: c.created_at,
    })),
    resources: resources.map((r) => ({
      plan_local_id: r.plan_id,
      category_local_id: r.category_id,
      title: r.title,
      url: r.url,
      notes: r.notes,
      tags: r.tags ?? [],
      created_at: r.created_at,
    })),
    monthly_reviews: monthly_reviews.map((rev) => ({
      plan_local_id: rev.plan_id,
      month: rev.month,
      answers_json: rev.answers_json ?? '{}',
      notes: rev.notes,
      created_at: rev.created_at,
    })),
  }
}

export async function hasLocalData(): Promise<boolean> {
  const count = await db.plans.count()
  return count > 0
}
