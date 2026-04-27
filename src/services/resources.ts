// Service layer for resources and resource_categories.
// To migrate to API: replace each function body with a fetch() call to your backend.

import { db, type Resource, type ResourceCategory } from '#/db/index'

export const categoriesService = {
  getAll(planId: number): Promise<ResourceCategory[]> {
    return db.resource_categories.where('plan_id').equals(planId).sortBy('name')
  },

  create(planId: number, name: string): Promise<number> {
    return db.resource_categories.add({ plan_id: planId, name, created_at: Date.now() }) as Promise<number>
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
    return db.resources.where('[plan_id+category_id]').equals([planId, categoryId]).toArray()
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
    return db.resources.where('[plan_id+category_id]').equals([planId, categoryId]).delete()
  },
}
