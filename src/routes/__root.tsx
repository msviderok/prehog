import { ClerkProvider } from '@/routes/-components/ClerkProvider'
import { ConvexClerkProvider } from '@/routes/-components/ConvexClerkProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { api } from '@/convex/api'
import { env } from '@/env'
import { authClerkServerFn } from '@/lib/server.functions'
import { ClientOnly, createRootRouteWithContext, HeadContent, Outlet, redirect, Scripts } from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import { setupConvexHttp } from 'convex-solidjs'
import posthog from 'posthog-js'
import { onMount, Suspense, type ParentProps } from 'solid-js'
import { HydrationScript } from 'solid-js/web'
import styleCss from '../styles/index.css?url'
import { assets } from '@/routeAssets.gen'

export const Route = createRootRouteWithContext()({
  staticData: { scene: null },
  head: () => ({ links: [{ rel: 'stylesheet', href: styleCss }] }),
  /**
   * Authentication is based on two parts:
   *  - Clerk JWT token
   *  - User's data present in Convex
   */
  async beforeLoad({ matches }) {
    const clerkAuth = await authClerkServerFn()
    const isCurrentPathLogin = matches.some((m) => m.routeId === '/login')

    /** If there's no Clerk JWT token – redirect to login  */
    if (clerkAuth == null) {
      /** Unless the current path is '/login' – redirect to it */
      if (isCurrentPathLogin == false) throw redirect({ to: '/login' })
      return
    }

    const convexHttpClient = setupConvexHttp(env.VITE_CONVEX_URL)
    convexHttpClient.setAuth(clerkAuth.token)
    await convexHttpClient.mutation(api.users.ensureCurrent, { clerkUserId: clerkAuth.userId })
  },
  shellComponent() {
    return (
      <html class="dark size-full overfow-hidden">
        <head>
          <HydrationScript />
          <HeadContent />
        </head>
        <body
          class="font-base text-foreground bg-background size-full bg-size-[100px] bg-repeat"
          style={{ 'background-image': `url(${assets['//']['bg_pattern.png'].src})` }}
        >
          <Suspense>
            <ClientOnly>
              <PosthogProvider>
                <TooltipProvider>
                  <ClerkProvider>
                    <ConvexClerkProvider>
                      <Outlet />
                    </ConvexClerkProvider>
                  </ClerkProvider>
                </TooltipProvider>
              </PosthogProvider>
            </ClientOnly>
          </Suspense>

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
