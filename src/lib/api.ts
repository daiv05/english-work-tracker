import { useRequestStore } from '#/store/requests'

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8010'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string }
    if (body.detail) return body.detail
  } catch {
    // ignore parse errors
  }
  return 'API error'
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string; _isRetry?: boolean },
): Promise<T> {
  const { token, _isRetry, ...rest } = options ?? {}
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const { increment, decrement, invalidate } = useRequestStore.getState()
  const method = (rest.method ?? 'GET').toUpperCase()
  const isMutation = method !== 'GET'
  increment()

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { ...rest, headers })
  } finally {
    decrement()
  }

  if (res.status === 401 && !_isRetry) {
    // Lazy import to avoid circular dependency at module load time
    const { useAuthStore } = await import('#/store/auth')
    const refreshed = await useAuthStore.getState().refreshToken()
    if (refreshed) {
      const newToken = useAuthStore.getState().accessToken ?? undefined
      return apiFetch<T>(path, { ...options, token: newToken, _isRetry: true })
    }
    useAuthStore.getState().logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
    throw new ApiError(401, 'Session expired. Please log in again.')
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res))
  }

  if (isMutation) invalidate()
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
