import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopHeader } from './TopHeader'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f9fb]">
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
