import { env } from '@/env'
import { ConvexClerkProvider } from '@/lib/integrations/convex-clerk'
import { ErrorComponent, HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/solid-router'
import { ClerkProvider } from 'clerk-solidjs-tanstack-start'
import { Suspense } from 'solid-js'
import { HydrationScript } from 'solid-js/web'
import styleCss from '../styles/index.css?url'

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [{ rel: 'stylesheet', href: styleCss }],
  }),
  shellComponent: RootComponent,
  errorComponent: ErrorComponent,
})

function RootComponent() {
  return (
    <html>
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body>
        <ClerkProvider publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}>
          <ConvexClerkProvider>
            <Suspense>
              <Outlet />
            </Suspense>
          </ConvexClerkProvider>
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
