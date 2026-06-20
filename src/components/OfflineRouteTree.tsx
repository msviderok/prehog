import { TooltipProvider } from '@/components/ui/tooltip'
import {
  createRootRouteWithContext,
  createRoute,
  ErrorComponent,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { HydrationScript } from 'solid-js/web'
import styleCss from '../styles/index.css?url'
import { GameContent } from './game-content/GameContent'
import { GlobalStateProvider } from './GlobalStateContext'
import { PosthogJobApplication } from './PosthogJobApplication'

const LayoutRoute = createRootRouteWithContext()({
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
            <TooltipProvider>
              <Outlet />
            </TooltipProvider>
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

const IndexRoute = createRoute({
  getParentRoute: () => LayoutRoute,
  path: '/',
  component() {
    return (
      <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen items-center overflow-hidden grid grid-rows-[2fr_1fr]">
        <GlobalStateProvider>
          <GameContent />
          <PosthogJobApplication />
        </GlobalStateProvider>
      </main>
    )
  },
})

export function getOfflineRouteTree() {
  return LayoutRoute.addChildren([IndexRoute])
}
