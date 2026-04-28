import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Layout } from '#/components/Layout'
import { useAuthStore } from '#/store/auth'
import { useProfileStore } from '#/store/profile'
import { MigrationBanner } from '#/components/MigrationBanner'

export const Route = createFileRoute('/app')({
  component: AppLayout,
})

function AppLayout() {
  const { isAuthenticated, isSessionRestored } = useAuthStore()
  const isInitialized = useProfileStore((s) => s.isInitialized)
  const navigate = useNavigate()

  useEffect(() => {
    if (isSessionRestored && !isAuthenticated) {
      void navigate({ to: '/auth/login', replace: true })
    }
  }, [isAuthenticated, isSessionRestored, navigate])

  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      void useProfileStore.getState()._init()
    }
  }, [isAuthenticated, isInitialized])

  if (!isSessionRestored) return null

  return (
    <Layout>
      <MigrationBanner />
      <Outlet />
    </Layout>
  )
}
