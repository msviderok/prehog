import { GameContent } from '@/components/game-content/GameContent'
import { GameUI } from '@/components/game-ui/GameUI'
import { GlobalStateProvider } from '@/components/GlobalStateContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { env } from '@/env'
import { ConvexClerkProvider } from '@/lib/integrations/convex-clerk'
import { neobrutalism } from '@clerk/ui/themes'
import { createFileRoute } from '@tanstack/solid-router'
import { ClerkProvider, SignedIn, SignedOut, SignIn } from 'clerk-solidjs-tanstack-start'

export const Route = createFileRoute('/')({
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
            <SignedIn>
              <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden">
                <GlobalStateProvider>
                  <GameContent />
                  <GameUI />
                </GlobalStateProvider>
              </main>
            </SignedIn>
            <SignedOut>
              <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden justify-center">
                <SignIn />
              </main>
            </SignedOut>
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
