import type { Assets } from '@/routeAssets.gen'
import {
  SceneryPopoverBackdrop,
  SceneryPopoverMarkers,
  SceneryPopoverPortal,
} from '@/routes/_authed/-components/SceneryPopover'
import { cn } from 'cn'
import { For, type JSX } from 'solid-js'
import { useGlobalState } from './GlobalStateContext'
import { Asset, type AssetProps } from './Asset'
import { Hat } from './Hat'
import { OtherPlayer } from './OtherPlayer'

export function Root(props: { children: JSX.Element }) {
  const { scene } = useGlobalState()
  return (
    <div
      ref={(el) => (scene.ref = el)}
      class="w-min h-min relative z-1 overflow-hidden [view-transition-name:scene] origin-center"
    >
      {props.children}
    </div>
  )
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
    <>
      <Asset
        {...props}
        ref={(el) => {
          scene.backgroundRef = el
          typeof props.ref === 'function' ? props.ref(el) : (props.ref = el)
        }}
        class={cn(
          'w-(--scene-width-scaled) h-(--scene-height-scaled) bg-background translate-x-(--scene-tx) transform-gpu relative',
          props.class,
        )}
      />

      <SceneryPopoverPortal />
    </>
  )
}

export function Players() {
  return (
    <>
      <OtherPlayers />
      <MyPlayer />
      <SceneryPopoverMarkers />
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
