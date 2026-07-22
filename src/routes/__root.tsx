import { createRootRouteWithContext, ErrorComponent, HeadContent, Outlet, Scripts } from '@tanstack/solid-router'
import { Suspense, onMount } from 'solid-js'
import { HydrationScript } from 'solid-js/web'
import styleCss from '../styles/index.css?url'
import posthog from 'posthog-js'
import { env } from '@/env'
import type { ParentProps } from 'solid-js/types/server/rendering.js'

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
            <PosthogProvider>
              <Outlet />
            </PosthogProvider>
          </Suspense>
          <Scripts />
        </body>
      </html>
    )
  },
  errorComponent(props) {
    console.error(props.error)
    return <ErrorComponent {...props} />
  },
  notFoundComponent() {
    return <p>Not Found!</p>
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
