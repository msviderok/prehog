import { GlobalStateProvider } from '@/components/global-state/GlobalStateContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { env } from '@/env'
import { ConvexClerkProvider } from '@/lib/convex-clerk'
import { neobrutalism } from '@clerk/ui/themes'
import { ClientOnly, createFileRoute } from '@tanstack/solid-router'
import { ClerkProvider } from 'clerk-solidjs-tanstack-start'

export const Route = createFileRoute('/')({
  ssr: false,
  component() {
    return (
      <TooltipProvider>
        <ClerkProvider
          publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
          appearance={{
            theme: neobrutalism,
            layout: { unsafe_disableDevelopmentModeWarnings: true },
            ...elements,
          }}
        >
          <ConvexClerkProvider>
            <ClientOnly>
              <GlobalStateProvider />
            </ClientOnly>
          </ConvexClerkProvider>
        </ClerkProvider>
      </TooltipProvider>
    )
  },
})

const elements: any = {
  // elements: {
  //   socialButtonsBlockButtonText: {
  //     color: 'var(--color-blue-text)',
  //   },
  //   lastAuthenticationStrategyBadge: {
  //     backgroundColor: 'var(--color-blue-400)',
  //     borderWidth: '2px',
  //     borderColor: 'var(--color-blue-text)',
  //     boxShadow: 'none',
  //     color: 'var(--color-blue-text)',
  //   },
  //   button: {
  //     backgroundColor: 'var(--color-blue-200)',
  //     color: 'var(--color-blue-700)',
  //     '&:hover': {
  //       backgroundColor: 'var(--color-blue-400)',
  //     },
  //   },
  //   footer: {
  //     backgroundColor: 'var(--color-card)',
  //   },
  //   footerActionLink: {
  //     color: 'var(--color-blue-600)',
  //   },
  // },
  // variables: {
  //   colorText: 'var(--color-blue-900)',
  //   colorBackground: 'var(--color-card)',
  // },
}
