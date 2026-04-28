import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Layout } from '#/components/Layout'
import { ToastProvider } from '#/components/ui/ToastProvider'
import { useProfileStore } from '#/store/profile'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#000000' },
      { title: 'English Work Tracker' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: RootNotFound,
  errorComponent: ErrorComponent,
  onCatch(error) {
    console.error('Route error:', error)
  },
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  useEffect(() => {
    void useProfileStore.getState()._init()
  }, [])

  return (
    <ToastProvider>
      <Layout>
        <Outlet />
      </Layout>
    </ToastProvider>
  )
}

function RootNotFound() {
  return (
    <div className="px-4 md:px-8 py-10">
      <div className="max-w-xl bg-white border border-outline-variant rounded-2xl p-6 shadow-card">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-2">
          Error 404
        </p>
        <h1 className="text-2xl font-bold text-on-surface mb-2">Page not found</h1>
        <p className="text-sm text-on-surface-variant mb-4">
          The page you are looking for does not exist or was moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-dark text-white px-4 py-2 text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

function ErrorComponent() {
  return (
    <div className="px-4 md:px-8 py-10">
      <div className="max-w-xl bg-white border border-outline-variant rounded-2xl p-6 shadow-card">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-outline mb-2">
          Error
        </p>
        <h1 className="text-2xl font-bold text-on-surface mb-2">An error occurred</h1>
        <p className="text-sm text-on-surface-variant mb-4">
          Something went wrong while loading the page. Please try again later.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-dark text-white px-4 py-2 text-sm font-semibold hover:bg-primary-dark-hover transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}