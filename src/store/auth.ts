import { create } from 'zustand'
import { apiFetch } from '#/lib/api'

const REFRESH_KEY = 'ew_rt'

interface UserInfo {
  id: number
  email: string
  display_name: string
  avatar_data: string | null
  is_superadmin: boolean
}

interface AuthTokenResponse {
  access_token: string
  refresh_token: string
  user: UserInfo
}

interface AccessTokenResponse {
  access_token: string
}

interface AuthState {
  isAuthenticated: boolean
  isSessionRestored: boolean
  accessToken: string | null
  user: UserInfo | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<boolean>
  _restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isSessionRestored: false,
  accessToken: null,
  user: null,
  isLoading: false,

  async login(email, password) {
    set({ isLoading: true })
    try {
      const data = await apiFetch<AuthTokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem(REFRESH_KEY, data.refresh_token)
      set({ isAuthenticated: true, accessToken: data.access_token, user: data.user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async register(email, password, displayName) {
    set({ isLoading: true })
    try {
      const data = await apiFetch<AuthTokenResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name: displayName }),
      })
      localStorage.setItem(REFRESH_KEY, data.refresh_token)
      set({ isAuthenticated: true, accessToken: data.access_token, user: data.user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout() {
    localStorage.removeItem(REFRESH_KEY)
    set({ isAuthenticated: false, accessToken: null, user: null })
  },

  async refreshToken() {
    const rt = localStorage.getItem(REFRESH_KEY)
    if (!rt) return false
    try {
      const data = await apiFetch<AccessTokenResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: rt }),
      })
      set({ accessToken: data.access_token, isAuthenticated: true })
      return true
    } catch {
      localStorage.removeItem(REFRESH_KEY)
      set({ isAuthenticated: false, accessToken: null, user: null })
      return false
    }
  },

  async _restoreSession() {
    const rt = localStorage.getItem(REFRESH_KEY)
    if (!rt) {
      set({ isSessionRestored: true })
      return
    }

    set({ isLoading: true })
    const ok = await get().refreshToken()
    if (ok) {
      try {
        const user = await apiFetch<UserInfo>('/users/me', {
          token: get().accessToken ?? undefined,
        })
        set({ user, isLoading: false, isSessionRestored: true })
      } catch {
        set({ isLoading: false, isSessionRestored: true })
      }
    } else {
      set({ isLoading: false, isSessionRestored: true })
    }
  },
}))
