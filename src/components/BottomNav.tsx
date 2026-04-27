import { Link, useRouterState } from '@tanstack/react-router'

const navLinks = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        {active ? (
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        )}
      </svg>
    ),
  },
  {
    to: '/log',
    label: 'Log',
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        {active ? (
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        )}
      </svg>
    ),
  },
  {
    to: '/writing',
    label: 'Write',
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        {active ? (
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        )}
      </svg>
    ),
  },
  {
    to: '/resources',
    label: 'Resources',
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        {active ? (
          <path d="M20 6h-2.18c.07-.44.18-.86.18-1.3C18 2.57 15.43 0 12.3 0c-1.7 0-3.21.8-4.2 2.05L12 6.4l3.9-3.9C16.29 2.78 17 3.21 17 4c0 1.1-.9 2-2 2H9L5.5 2.5C4.57 1.57 3.28 1 2 1 .45 1-.13 2.82.89 3.84L2 5H2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        )}
      </svg>
    ),
  },
  {
    to: '/plan',
    label: 'Plan',
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        {active ? (
          <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-8 5h6v2h-6V8zm0 4h6v2h-6v-2zm0 4h4v2h-4v-2z" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h6"
          />
        )}
      </svg>
    ),
  },
]

export function BottomNav() {
  const { location } = useRouterState()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-outline-variant flex">
      {navLinks.map((link) => {
        const isActive =
          link.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(link.to)
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-outline'
            }`}
          >
            {link.icon(isActive)}
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
