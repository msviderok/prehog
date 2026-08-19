import { ClerkProvider } from '@/components/ClerkProvider'
import { ConvexClerkProvider } from '@/components/ConvexClerkProvider'
import { GlobalStateProvider } from '@/components/GlobalStateProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { env } from '@/env'
import { ClientOnly, createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import posthog from 'posthog-js'
import { onMount, Suspense, type ParentProps } from 'solid-js'
import { HydrationScript } from 'solid-js/web'
import styleCss from '../styles/index.css?url'

export const Route = createRootRouteWithContext()({
  head: () => ({ links: [{ rel: 'stylesheet', href: styleCss }] }),
  shellComponent() {
    return (
      <html class="dark">
        <head>
          <HydrationScript />
          <HeadContent />
        </head>
        <body>
          <Suspense>
            <ClientOnly>
              <PosthogProvider>
                <TooltipProvider>
                  <ClerkProvider>
                    <ConvexClerkProvider>
                      <GlobalStateProvider>
                        <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden">
                          <Outlet />
                        </main>
                      </GlobalStateProvider>
                    </ConvexClerkProvider>
                  </ClerkProvider>
                </TooltipProvider>
              </PosthogProvider>
            </ClientOnly>
          </Suspense>

          <TanStackRouterDevtools />
          <Scripts />
        </body>
      </html>
    )
  },
})

function PosthogProvider(props: ParentProps) {
  onMount(() => {
    if (!window.location.host.includes('127.0.0.1') && !window.location.host.includes('localhost')) {
      posthog.init(env.VITE_POSTHOG_PROJECT_TOKEN, { api_host: env.VITE_POSTHOG_HOST, defaults: '2026-05-30' })
    }
  })

  return <>{props.children}</>
}
