import { useQuery, useMutation, useConvexClient } from 'convex-solidjs'
import type { FunctionReference } from 'convex/server'
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  on,
  onMount,
  type Accessor,
} from 'solid-js'

// Interface in your Convex app /convex directory that implements these
// functions by calling into the presence component, e.g., like this:
//
// export const presence = new Presence(components.presence);
//
// export const heartbeat = mutation({
//   args: { roomId: v.string(), userId: v.string(), sessionId: v.string(), interval: v.number() },
//   handler: async (ctx, { roomId, userId, sessionId, interval }) => {
//     // TODO: Add your auth checks here.
//     return await presence.heartbeat(ctx, roomId, userId, sessionId, interval);
//   },
// });
//
// export const list = query({
//   args: { roomToken: v.string() },
//   handler: async (ctx, { roomToken }) => {
//     // Avoid adding per-user reads so all subscriptions can share same cache.
//     return await presence.list(ctx, roomToken);
//   },
// });
//
// export const disconnect = mutation({
//   args: { sessionToken: v.string() },
//   handler: async (ctx, { sessionToken }) => {
//     // Can't check auth here because it's called over http from sendBeacon.
//     return await presence.disconnect(ctx, sessionToken);
//   },
// });
export interface PresenceAPI {
  list: FunctionReference<'query', 'public', { roomToken: string }, PresenceState[]>
  heartbeat: FunctionReference<
    'mutation',
    'public',
    { roomId: string; userId: string; sessionId: string; interval: number },
    { roomToken: string; sessionToken: string }
  >
  disconnect: FunctionReference<'mutation', 'public', { sessionToken: string }>
}

// Presence state for a user within the given room.
export interface PresenceState {
  userId: string
  online: boolean
  lastDisconnected: number
  data?: unknown
  // Set these accordingly in your Convex app.
  name?: string
  image?: string
}

interface Props {
  presence: PresenceAPI
  roomId: string
  userId: string
  interval: number
  convexUrl?: string
}

export function createConvexPresence(args: Props): Accessor<PresenceState[] | undefined> {
  const props = mergeProps({ interval: 10000 } as Props, args)
  const convex = useConvexClient()

  let hasMounted = false
  const baseUrl = createMemo(() => props.convexUrl ?? convex?.client.url)

  // Each session (browser tab etc) has a unique ID and a token used to disconnect it.
  const [sessionId, setSessionId] = createSignal(createUniqueId())
  const [sessionToken, setSessionToken] = createSignal<string | null>(null)
  const [roomToken, setRoomToken] = createSignal<string | null>(null)

  let intervalRef: ReturnType<typeof setInterval> | null = null

  const heartbeat = useMutation(props.presence.heartbeat)
  const disconnect = useMutation(props.presence.disconnect)

  createEffect(
    on([() => props.roomId, () => props.userId], () => {
      // Reset session state when roomId or userId changes.
      if (intervalRef) {
        clearInterval(intervalRef)
        intervalRef = null
      }

      const session = sessionToken()
      if (session) {
        void disconnect.mutate({ sessionToken: session })
      }

      batch(() => {
        setSessionId(createUniqueId())
        setSessionToken(null)
        setRoomToken(null)
      })
    }),
  )

  createEffect(
    on(
      [() => props.roomId, () => props.userId, () => props.interval, baseUrl, sessionId],
      ([roomId, userId, interval, baseUrlResolved, sessionIdResolved]) => {
        // Periodic heartbeats.
        const sendHeartbeat = async () => {
          const result = await heartbeat.mutateAsync({ roomId, userId, interval, sessionId: sessionIdResolved })
          batch(() => {
            setRoomToken(result.roomToken)
            setSessionToken(result.sessionToken)
          })
        }

        // Send initial heartbeat
        void sendHeartbeat()

        // Clear any existing interval before setting a new one
        if (intervalRef) {
          clearInterval(intervalRef)
        }
        intervalRef = setInterval(sendHeartbeat, interval)

        // Handle page unload.
        const handleUnload = () => {
          const session = sessionToken()
          if (session) {
            const blob = new Blob(
              [
                JSON.stringify({
                  path: 'presence:disconnect',
                  args: { sessionToken: session },
                }),
              ],
              {
                type: 'application/json',
              },
            )
            navigator.sendBeacon(`${baseUrlResolved}/api/mutation`, blob)
          }
        }
        window.addEventListener('beforeunload', handleUnload)

        // Handle visibility changes.
        const handleVisibility = async () => {
          if (document.hidden) {
            if (intervalRef) {
              clearInterval(intervalRef)
              intervalRef = null
            }
            const session = sessionToken()
            if (session) {
              await disconnect.mutateAsync({ sessionToken: session })
            }
          } else {
            void sendHeartbeat()
            if (intervalRef) {
              clearInterval(intervalRef)
            }
            intervalRef = setInterval(sendHeartbeat, props.interval)
          }
        }
        const wrappedHandleVisibility = () => {
          handleVisibility().catch(console.error)
        }
        document.addEventListener('visibilitychange', wrappedHandleVisibility)

        // Cleanup.
        return () => {
          if (intervalRef) {
            clearInterval(intervalRef)
          }
          document.removeEventListener('visibilitychange', wrappedHandleVisibility)
          window.removeEventListener('beforeunload', handleUnload)
          // Don't disconnect on first render in strict mode.
          if (hasMounted) {
            const session = sessionToken()
            if (session) {
              void disconnect.mutate({ sessionToken: session })
            }
          }
        }
      },
    ),
  )

  onMount(() => {
    hasMounted = true
  })

  const state = useQuery(
    props.presence.list,
    () => ({ roomToken: roomToken()! }),
    () => ({ enabled: roomToken() != null }),
  )

  const result = createMemo(() => {
    const data = state.data()
    const userId = props.userId
    if (!data) return undefined

    return data.sort((a, b) => {
      if (a.userId === userId) return -1
      if (b.userId === userId) return 1
      return 0
    })
  })

  return result
}
