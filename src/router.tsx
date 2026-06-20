import { createRouter as createTanStackRouter, ErrorComponent } from '@tanstack/solid-router'
import { routeTree } from './routeTree.gen'
import { env } from './env'
import { getOfflineRouteTree } from './components/OfflineRouteTree'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree: env.VITE_OFFLINE ? getOfflineRouteTree() : routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultErrorComponent(props) {
      console.trace(props.error)
      return <ErrorComponent {...props} />
    },
    defaultNotFoundComponent: () => <p>Not Found!</p>,
  })

  return router
}

declare module '@tanstack/solid-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
