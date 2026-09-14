import { env } from '@/env'
import { neobrutalism } from '@clerk/ui/themes'
import { ClerkProvider as BaseClerkProvider } from 'clerk-solidjs-tanstack-start'
import type { ParentProps } from 'solid-js'

export function ClerkProvider(props: ParentProps) {
  return (
    <BaseClerkProvider
      publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={{
        theme: neobrutalism,
        layout: { unsafe_disableDevelopmentModeWarnings: true },
        ...elements,
      }}
    >
      {props.children}
    </BaseClerkProvider>
  )
}

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
