import { createRouter as createTanStackRouter, ErrorComponent } from '@tanstack/solid-router'
import { getOfflineRouteTree } from './components/OfflineRouteTree'
import { env } from './env'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree: env.VITE_OFFLINE ? getOfflineRouteTree() : routeTree,
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
