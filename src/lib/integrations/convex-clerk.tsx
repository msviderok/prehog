import { env } from '@/env'
import { useAuth } from 'clerk-solidjs-tanstack-start'
import { ConvexProvider, setupConvex } from 'convex-solidjs'
import type { ConvexClient } from 'convex/browser'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
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

function decodeJwtPayload(token: string) {
  const [, payload] = token.split('.')

  if (!payload) {
    return null
  }

  try {
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      aud?: string | string[]
      azp?: string
      exp?: number
      iss?: string
      sub?: string
    }
  } catch {
    return null
  }
}

function hasConvexAudience(token: string) {
  const payload = decodeJwtPayload(token)
  const audiences = Array.isArray(payload?.aud) ? payload.aud : payload?.aud ? [payload.aud] : []
  return audiences.includes('convex')
}

export function useConvexClerkAuth() {
  const context = useContext(ConvexClerkAuthContext)
  if (!context) throw new Error('useConvexClerkAuth must be used within ConvexClerkProvider')
  return context
}

export function ConvexClerkProvider(props: ParentProps) {
  const client = setupConvex(env.VITE_CONVEX_URL)
  const auth = useAuth()
  const [isConvexAuthenticated, setIsConvexAuthenticated] = createSignal<boolean | null>(null)
  const [hasResolvedInitialAuth, setHasResolvedInitialAuth] = createSignal(false)
  const isLoading = createMemo(() => !hasResolvedInitialAuth())
  const isAuthenticated = createMemo(() => !!(auth.isSignedIn() && isConvexAuthenticated()))
  const authBindingKey = createMemo(() => {
    if (!auth.isLoaded()) {
      return null
    }

    if (!auth.isSignedIn()) {
      return 'signed-out'
    }

    return JSON.stringify({
      orgId: auth.orgId() ?? null,
      orgRole: auth.orgRole() ?? null,
    })
  })

  async function fetchAccessToken({ forceRefreshToken }: { forceRefreshToken: boolean }) {
    try {
      const token = await auth.getToken({ template: 'convex', skipCache: forceRefreshToken })

      if (token && !hasConvexAudience(token)) {
        return null
      }

      return token
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

    const authClient = (client as ConvexClientWithNestedAuth).client
    const bindingKey = authBindingKey()
    const isLoaded = auth.isLoaded()
    const isSignedIn = auth.isSignedIn() ?? false

    if (!isLoaded) {
      return
    }

    if (!isSignedIn || bindingKey === 'signed-out') {
      releaseAuthBinding?.()
      releaseAuthBinding = undefined
      currentBindingKey = 'signed-out'
      authClient.clearAuth()
      setIsConvexAuthenticated(false)
      setHasResolvedInitialAuth(true)
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
        setIsConvexAuthenticated(backendReportsIsAuthenticated)
        setHasResolvedInitialAuth(true)
      }
    })

    releaseAuthBinding = () => {
      isCurrentBinding = false
      authClient.clearAuth()
    }
  })

  onCleanup(() => {
    releaseAuthBinding?.()
  })

  return (
    <ConvexClerkAuthContext.Provider value={{ isAuthenticated, isLoading }}>
      <ConvexProvider client={client}>{props.children}</ConvexProvider>
    </ConvexClerkAuthContext.Provider>
  )
}
