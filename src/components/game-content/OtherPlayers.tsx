import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { useQuery } from 'convex-solidjs'
import { createEffect, For, onCleanup, onMount } from 'solid-js'
import { useGlobalState } from '../global-state/GlobalStateContext'
import { Hat } from './Hat'

export function OtherPlayers() {
  const { data: onlineUsersList } = useQuery(api.users.listOnlineUsers, {})
  return <For each={onlineUsersList()}>{(userId) => <OtherPlayer id={userId} />}</For>
}

function OtherPlayer(props: { id: Id<'users'> }) {
  let ref!: HTMLDivElement
  const { onlineUsers } = useGlobalState()
  const { data: isAdmin } = useQuery(api.gameState.isUserAdmin, { userId: props.id })
  const { data: actionsBatch } = useQuery(api.gameState.getPlayerBatch, { userId: props.id })
  const { data: state } = useQuery(api.gameState.getPlayerGameState, { userId: props.id })

  createEffect(() => {
    const b = actionsBatch()

    // this is an initial load so we need to set the user
    if (!b) {
      onlineUsers.data.users[props.id] = { ref, batchQueue: [] }
      return
    }

    onlineUsers.data.users[props.id]?.batchQueue.push(...b)
  })

  onCleanup(() => {
    delete onlineUsers.data.users[props.id]
  })

  onMount(() => {
    console.log('mount', props.id, ref)
  })

  createEffect(() => {
    if (!ref) return
    console.log(ref)
    const dir = state()?.movementDir
    ref.style.setProperty('--facing-dir', dir === 'left' ? '-1' : '1')
  })

  createEffect(() => {
    if (!ref) return
    const isWalking = state()?.isWalking ?? false
    console.log({ isWalking }, ref)
    ref.classList.toggle('player-walk', isWalking)
    ref.classList.toggle('player-idle', !isWalking)
  })

  return (
    <div ref={ref} class="player" data-is-admin={isAdmin() ?? false}>
      <Hat hat={isAdmin() ? 'admin' : 'baseball'} />
    </div>
  )
}
