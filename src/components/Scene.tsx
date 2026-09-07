import { For, type JSX } from 'solid-js'
import { useGlobalState } from './GlobalStateContext'
import { Hat } from './Hat'
import { OtherPlayer } from './OtherPlayer'
import type { Assets } from '@/routeAssets.gen'
import { Asset, type AssetProps } from './Asset'

export function Root(props: { children: JSX.Element }) {
  return <div class="w-min h-min relative z-1 overflow-hidden">{props.children}</div>
}

export function Elements(props: { children: JSX.Element }) {
  return (
    <div class="absolute top-0 left-0 transform-3d w-(--scene-width-scaled) h-(--scene-height-scaled)">
      {props.children}
    </div>
  )
}

export function Background<K extends keyof Assets, A extends keyof Assets[K]>(props: AssetProps<K, A>) {
  const { scene } = useGlobalState()
  return (
    <Asset
      {...props}
      ref={(el) => {
        scene.ref = el
        typeof props.ref === 'function' ? props.ref(el) : (props.ref = el)
      }}
      class="w-(--scene-width-scaled) h-(--scene-height-scaled) bg-background translate-x-(--scene-tx) transform-gpu relative"
    />
  )
}

export function Players() {
  return (
    <>
      <OtherPlayers />
      <MyPlayer />
    </>
  )
}

function MyPlayer() {
  const { player } = useGlobalState()
  return (
    <div ref={(el) => (player.ref = el)} class="player player-idle" data-me={true} data-is-admin={player.isAdmin()}>
      <Hat hat={player.isAdmin() ? 'admin' : 'baseball'} />
    </div>
  )
}

function OtherPlayers() {
  const { otherPlayers } = useGlobalState()
  return <For each={otherPlayers.list()}>{(userId) => <OtherPlayer id={userId} />}</For>
}
