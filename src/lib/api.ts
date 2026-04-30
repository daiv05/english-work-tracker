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

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...rest } = options ?? {}
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const { increment, decrement, invalidate } = useRequestStore.getState()
  const method = (rest.method ?? 'GET').toUpperCase()
  const isMutation = method !== 'GET'
  increment()
  try {
    const res = await fetch(`${BASE}${path}`, { ...rest, headers })

    if (!res.ok) {
      let detail = 'API error'
      try {
        const body = (await res.json()) as { detail?: string }
        if (body.detail) detail = body.detail
      } catch {
        // ignore parse errors
      }
      throw new ApiError(res.status, detail)
    }

    if (isMutation) invalidate()
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  } finally {
    decrement()
  }
}
