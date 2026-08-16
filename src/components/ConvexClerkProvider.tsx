import { api } from '@/convex/api'
import { env } from '@/env'
import { useRouter } from '@tanstack/solid-router'
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
  const auth = useAuth()
  const client = setupConvex(env.VITE_CONVEX_URL, { unsavedChangesWarning: import.meta.env.PROD, expectAuth: true })
  const [isConvexAuthenticated, setIsConvexAuthenticated] = createSignal<boolean | null>(null)
  const [hasResolvedInitialAuth, setHasResolvedInitialAuth] = createSignal(false)

  const isLoading = createMemo(() => !hasResolvedInitialAuth())
  const isAuthenticated = createMemo(() => !!(auth.isSignedIn() && isConvexAuthenticated()))
  const authBindingKey = createMemo(() => {
    if (!auth.isLoaded()) return null
    if (!auth.isSignedIn()) return 'signed-out'
    return JSON.stringify({ orgId: auth.orgId() ?? null, orgRole: auth.orgRole() ?? null })
  })

  async function fetchAccessToken(args: { forceRefreshToken: boolean }) {
    try {
      const token = await auth.getToken({ template: 'convex', skipCache: args.forceRefreshToken })
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

    const authClient = (client as unknown as ConvexClientWithNestedAuth).client
    const bindingKey = authBindingKey()
    const isLoaded = auth.isLoaded()
    const isSignedIn = auth.isSignedIn() ?? false

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
      <ConvexProvider client={client}>{props.children}</ConvexProvider>
    </ConvexClerkAuthContext.Provider>
  )
}

function decodeJwtPayload(token: string) {
  const [, payload] = token.split('.')
  if (!payload) return null

  try {
    const jwt = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(jwt) as { aud?: string | string[]; azp?: string; exp?: number; iss?: string; sub?: string }
  } catch {
    return null
  }
}

function hasConvexAudience(token: string) {
  const payload = decodeJwtPayload(token)
  const audiences = Array.isArray(payload?.aud) ? payload.aud : payload?.aud ? [payload.aud] : []
  return audiences.includes('convex')
}
