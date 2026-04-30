import { apiFetch } from '#/lib/api'
import { useAuthStore } from '#/store/auth'

function token() {
  return useAuthStore.getState().accessToken ?? undefined
}

export interface AdminUserRow {
  id: number
  email: string
  display_name: string
  created_at: string
  is_active: boolean
  total_minutes: number
}

export const adminService = {
  async getUsers(): Promise<AdminUserRow[]> {
    return apiFetch<AdminUserRow[]>('/superadmin/users', { token: token() })
  },
}

export interface ActivityTipItem {
  id: number
  activity_type: string
  how: string
  tips: string[]
  sort_order: number
}

interface ActivityTipCreateBody {
  activity_type: string
  how: string
  tips: string[]
  sort_order: number
}

interface ActivityTipUpdateBody {
  activity_type?: string
  how?: string
  tips?: string[]
  sort_order?: number
}

export const activityTipsService = {
  async getAll(): Promise<ActivityTipItem[]> {
    return apiFetch<ActivityTipItem[]>('/superadmin/activity-tips', { token: token() })
  },

  async create(body: ActivityTipCreateBody): Promise<ActivityTipItem> {
    return apiFetch<ActivityTipItem>('/superadmin/activity-tips', {
      method: 'POST',
      token: token(),
      body: JSON.stringify(body),
    })
  },

  async update(id: number, body: ActivityTipUpdateBody): Promise<ActivityTipItem> {
    return apiFetch<ActivityTipItem>(`/superadmin/activity-tips/${id}`, {
      method: 'PUT',
      token: token(),
      body: JSON.stringify(body),
    })
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/superadmin/activity-tips/${id}`, { method: 'DELETE', token: token() })
  },
}
