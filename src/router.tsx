import { createRouter, ErrorComponent } from '@tanstack/solid-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultStructuralSharing: true,
    defaultPendingMs: 0,
    defaultErrorComponent(props) {
      console.trace(props.error)
      return <ErrorComponent {...props} />
    },
    defaultNotFoundComponent() {
      return <p>Not Found</p>
    },
  })

  return router
}

declare module '@tanstack/solid-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }

  interface HistoryState {
    clerkToken?: string | null // add your custom property here
  }

  interface StaticDataRouteOption {
    scene?: CurrentScene
  }
}
