import { api } from '@/convex/api'
import { env } from '@/env'
import { hasConvexAudience } from '@/lib/utils'
import { useAuth, useClerk } from 'clerk-solidjs-tanstack-start'
import { ConvexProvider, setupConvex, useQuery } from 'convex-solidjs'
import type { ConvexClient } from 'convex/browser'
import posthog from 'posthog-js'
import {
  batch,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  useContext,
  type Accessor,
  type ParentProps,
} from 'solid-js'

if (!env.VITE_CONVEX_URL) {
  console.error('Missing: VITE_CONVEX_URL')
}

const ConvexClerkAuthContext = createContext<{
  isAuthenticated: Accessor<boolean>
  isLoading: Accessor<boolean>
}>()

type ConvexClientWithNestedAuth = ConvexClient & {
  client: {
    clearAuth: () => void
    setAuth: ConvexClient['setAuth']
  }
}

export function useConvexClerkAuth() {
  const context = useContext(ConvexClerkAuthContext)
  if (!context) throw new Error('useConvexClerkAuth must be used within ConvexClerkProvider')
  return context
}

export function useCurrentUser() {
  const clerk = useClerk()
  const auth = useConvexClerkAuth()
  const { data: currentUser } = useQuery(api.users.current, {}, () => ({
    enabled: auth.isAuthenticated(),
    keepPreviousData: true,
  }))

  createEffect(
    on(currentUser, (u) => {
      if (!u) return
      posthog.identify(u._id, {
        fullname: u.fullname,
        email: clerk().user ? (clerk().user!.emailAddresses[0]?.emailAddress ?? 'Unknown email') : 'Clerk not loaded',
      })
    }),
  )

  return currentUser
}

export function ConvexClerkProvider(props: ParentProps<{ onAuthChanged?: () => void }>) {
  const clerkAuth = useAuth()
  const convexClient = setupConvex(env.VITE_CONVEX_URL, {
    unsavedChangesWarning: import.meta.env.PROD,
    expectAuth: true,
  })
  const [isConvexAuthenticated, setIsConvexAuthenticated] = createSignal<boolean | null>(null)
  const [hasResolvedInitialAuth, setHasResolvedInitialAuth] = createSignal(false)

  const isLoading = createMemo(() => !hasResolvedInitialAuth())
  const isAuthenticated = createMemo(() => !!(clerkAuth.isSignedIn() && isConvexAuthenticated()))
  const authBindingKey = createMemo(() => {
    if (!clerkAuth.isLoaded()) return null
    if (!clerkAuth.isSignedIn()) return 'signed-out'
    return JSON.stringify({ orgId: clerkAuth.orgId() ?? null, orgRole: clerkAuth.orgRole() ?? null })
  })

  async function fetchAccessToken(args: { forceRefreshToken: boolean }) {
    try {
      const token = await clerkAuth.getToken({ template: 'convex', skipCache: args.forceRefreshToken })
      return token && !hasConvexAudience(token) ? null : token
    } catch {
      return null
    }
  }

  let releaseAuthBinding: (() => void) | undefined
  let currentBindingKey: string | null = null

  createEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const authClient = (convexClient as unknown as ConvexClientWithNestedAuth).client
    const bindingKey = authBindingKey()
    const isLoaded = clerkAuth.isLoaded()
    const isSignedIn = clerkAuth.isSignedIn() ?? false

    if (!isLoaded) {
      return
    }

    if (!isSignedIn || bindingKey === 'signed-out') {
      batch(() => {
        releaseAuthBinding?.()
        releaseAuthBinding = undefined
        currentBindingKey = 'signed-out'
        authClient.clearAuth()
        setIsConvexAuthenticated(false)
        setHasResolvedInitialAuth(true)
        props.onAuthChanged?.()
      })
      return
    }

    if (bindingKey === currentBindingKey) {
      return
    }

    releaseAuthBinding?.()
    currentBindingKey = bindingKey

    let isCurrentBinding = true

    authClient.setAuth(fetchAccessToken, (backendReportsIsAuthenticated) => {
      if (isCurrentBinding) {
        batch(() => {
          setIsConvexAuthenticated(backendReportsIsAuthenticated)
          setHasResolvedInitialAuth(true)
          props.onAuthChanged?.()
        })
      }
    })

    releaseAuthBinding = () => {
      isCurrentBinding = false
      authClient.clearAuth()
      props.onAuthChanged?.()
    }
  })

  onCleanup(() => releaseAuthBinding?.())

  return (
    <ConvexClerkAuthContext.Provider value={{ isAuthenticated, isLoading }}>
      <ConvexProvider client={convexClient}>{props.children}</ConvexProvider>
    </ConvexClerkAuthContext.Provider>
  )
}
