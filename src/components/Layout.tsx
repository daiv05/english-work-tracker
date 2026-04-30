import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopHeader } from './TopHeader'
import { useRequestStore, selectIsLoading } from '#/store/requests'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const isLoading = useRequestStore(selectIsLoading)

  return (
    <div className="min-h-screen bg-surface">
      {/* Global request progress bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 h-0.5 bg-primary-dark transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}
        style={isLoading ? { animation: 'progress-indeterminate 1.4s ease-in-out infinite' } : undefined}
      />
      <Sidebar />
      {/* Main content: offset by sidebar width on desktop, offset top on mobile */}
      <main className="md:ml-64 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <TopHeader />
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
