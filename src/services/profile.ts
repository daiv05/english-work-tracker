import { apiFetch } from '#/lib/api'
import { useAuthStore } from '#/store/auth'
import type { UserProfile } from './types'

export const profileService = {
  getDefaults(): UserProfile {
    return { username: 'You' }
  },

  async get(): Promise<UserProfile> {
    const token = useAuthStore.getState().accessToken
    if (!token) return { username: 'You' }
    const data = await apiFetch<{ display_name: string; avatar_data: string | null }>('/users/me', { token })
    return { username: data.display_name, avatarData: data.avatar_data ?? undefined }
  },

  async update(changes: Partial<UserProfile>): Promise<UserProfile> {
    const token = useAuthStore.getState().accessToken
    if (!token) return profileService.getDefaults()
    const body: Record<string, unknown> = {}
    if (changes.username !== undefined) body.display_name = changes.username
    if (changes.avatarData !== undefined) body.avatar_data = changes.avatarData
    const data = await apiFetch<{ display_name: string; avatar_data: string | null }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    })
    return { username: data.display_name, avatarData: data.avatar_data ?? undefined }
  },
}
