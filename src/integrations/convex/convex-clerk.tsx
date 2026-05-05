import { useAuth } from 'clerk-solidjs-tanstack-start'
import type { ConvexClient } from 'convex/browser'
import { ConvexProvider, useQuery } from 'convex-solidjs'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  useContext,
  type Accessor,
  type ParentProps,
} from 'solid-js'
import { api } from '../../../convex/_generated/api'

type ConvexClerkAuthState = {
  isAuthenticated: Accessor<boolean>
  isLoading: Accessor<boolean>
}

const ConvexClerkAuthContext = createContext<ConvexClerkAuthState>()

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

function useConvexClerkAuth() {
  const context = useContext(ConvexClerkAuthContext)

  if (!context) {
    throw new Error('useConvexClerkAuth must be used within ConvexClerkProvider')
  }

  return context
}

export function useCurrentUser() {
  const { isLoading, isAuthenticated } = useConvexClerkAuth()
  const user = useQuery(api.users.current, {})

  // Combine the authentication state with the user existence check
  return {
    data: user.data,
    get isLoading() {
      return isLoading() || (isAuthenticated() && user === null)
    },
    get isAuthenticated() {
      return isAuthenticated() && user !== null
    },
  }
}

export function ConvexClerkProvider(props: ParentProps<{ client: ConvexClient }>) {
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

  const fetchAccessToken = async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
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

    const authClient = (props.client as ConvexClientWithNestedAuth).client
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
      <ConvexProvider client={props.client}>{props.children}</ConvexProvider>
    </ConvexClerkAuthContext.Provider>
  )
}
