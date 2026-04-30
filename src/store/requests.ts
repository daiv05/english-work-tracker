import { create } from 'zustand'

interface RequestStore {
  activeCount: number
  refreshKey: number
  increment: () => void
  decrement: () => void
  invalidate: () => void
}

export const useRequestStore = create<RequestStore>((set) => ({
  activeCount: 0,
  refreshKey: 0,
  increment: () => set((s) => ({ activeCount: s.activeCount + 1 })),
  decrement: () => set((s) => ({ activeCount: Math.max(0, s.activeCount - 1) })),
  invalidate: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}))

export function selectIsLoading(s: RequestStore) {
  return s.activeCount > 0
}

export function selectRefreshKey(s: RequestStore) {
  return s.refreshKey
}
