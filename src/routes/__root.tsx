import { env } from '@/env'
import AppConvexProvider from '@/integrations/convex/provider'
import { ErrorComponent, HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import { ClerkProvider } from 'clerk-solidjs-tanstack-start'
import { Suspense } from 'solid-js'
import { HydrationScript } from 'solid-js/web'
import styleCss from '../styles.css?url'

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
          <AppConvexProvider>
            <Suspense>
              <Outlet />
              <TanStackRouterDevtools />
            </Suspense>
          </AppConvexProvider>
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
