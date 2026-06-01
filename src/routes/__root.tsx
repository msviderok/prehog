import { env } from '@/env'
import { ConvexClerkProvider } from '@/lib/integrations/convex-clerk'
import { neobrutalism } from '@clerk/ui/themes'
import { ErrorComponent, HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/solid-router'
import { ClerkProvider } from 'clerk-solidjs-tanstack-start'
import { Suspense } from 'solid-js'
import { HydrationScript } from 'solid-js/web'
import styleCss from '../styles/index.css?url'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Route = createRootRouteWithContext()({
  head: () => ({ links: [{ rel: 'stylesheet', href: styleCss }] }),
  errorComponent: ErrorComponent,
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
              <ClerkProvider
                publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
                appearance={{
                  theme: neobrutalism,
                  layout: {
                    unsafe_disableDevelopmentModeWarnings: true,
                  },
                  elements: {
                    socialButtonsBlockButtonText: {
                      color: 'var(--color-blue-text)',
                    },
                    lastAuthenticationStrategyBadge: {
                      backgroundColor: 'var(--color-blue-400)',
                      borderWidth: '2px',
                      borderColor: 'var(--color-blue-text)',
                      boxShadow: 'none',
                      color: 'var(--color-blue-text)',
                    },
                    button: {
                      backgroundColor: 'var(--color-blue-200)',
                      color: 'var(--color-blue-700)',
                      '&:hover': {
                        backgroundColor: 'var(--color-blue-400)',
                      },
                    },
                    footer: {
                      backgroundColor: 'var(--color-card)',
                    },
                    footerActionLink: {
                      color: 'var(--color-blue-600)',
                    },
                  },
                  variables: {
                    colorText: 'var(--color-blue-900)',
                    colorBackground: 'var(--color-card)',
                  },
                }}
              >
                <ConvexClerkProvider>
                  <Outlet />
                </ConvexClerkProvider>
              </ClerkProvider>
            </TooltipProvider>
          </Suspense>

          <Scripts />
        </body>
      </html>
    )
  },
})
