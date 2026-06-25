import { createRootRouteWithContext, ErrorComponent, HeadContent, Outlet, Scripts } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
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
            <Outlet />
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
