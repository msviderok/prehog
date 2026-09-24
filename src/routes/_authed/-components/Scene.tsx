import type { Assets } from '@/routeAssets.gen'
import { SceneryPopoverMarkers, SceneryPopoverPortal } from '@/routes/_authed/-components/SceneryPopover'
import { cn } from 'cn'
import { For, Index, Show, type JSX } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Asset, type AssetProps } from './Asset'
import { useGlobalState } from './GlobalStateContext'
import { Hat } from './Hat'
import { OtherPlayer } from './OtherPlayer'

const DEBUG = false

export function Root(props: { children: JSX.Element }) {
  const { scene } = useGlobalState()
  return (
    <div data-viewport class="box-content w-min h-[calc(var(--original-scene-height)*var(--scale))] overflow-hidden">
      <div
        data-scaled-box
        class="relative z-1 box-content w-[calc(var(--original-scene-width)*var(--scale))] h-[calc(var(--original-scene-height)*var(--scale))]"
      >
        <div
          data-scrollable-scene
          class="w-(--original-scene-width) h-(--original-scene-height) scale-(--scale) origin-top-left"
        >
          <div ref={(el) => (scene.ref = el)} class="size-full relative z-1 [view-transition-name:scene]">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Elements(props: { children: JSX.Element }) {
  const { scene } = useGlobalState()
  return (
    <div ref={(el) => (scene.elementsContainerRef = el)} class="absolute top-0 left-0 size-[inherit]">
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
        class={cn('bg-background relative size-[inherit]', props.class)}
      />

      <SceneryPopoverPortal />
    </>
  )
}

export function Debug() {
  const { debugData, scene } = useGlobalState()

  return (
    <Show when={DEBUG}>
      <div class="absolute bottom-0 left-0 right-0 h-10 bg-cyan-500 flex items-center translate-x-(--scene-tx)">
        <Index each={Array.from({ length: 100 })}>
          {(_, idx) => (
            <span class="text-xl font-mono w-[1%] shrink-0 h-full flex items-center border-l border-cyan-950">
              {idx}
            </span>
          )}
        </Index>
      </div>

      <div
        content={debugData().scene.cameraStartTravelAtX}
        style={{ '--x': debugData().scene.cameraStartTravelAtX }}
        class={cn(
          'absolute left-[calc(var(--x)*1%)] top-0 bg-blue-400 w-2 -translate-x-1/2 h-full',
          'after:absolute after:top-14/20 after:-left-10 after:-translate-x-1/2 after:-rotate-90 after:content-[attr(content)] after:text-5xl after:bg-yellow-400 after:p-2 after:text-yellow-800',
        )}
      />
      <div
        content={debugData().scene.cameraEndTravelAtX}
        style={{ '--x': debugData().scene.cameraEndTravelAtX }}
        class={cn(
          'sticky left-[calc(var(--x)*1%)] top-0 bg-blue-400 w-2 -translate-x-1/2 h-full',
          'after:absolute after:top-14/20 after:-left-10 after:-translate-x-1/2 after:-rotate-90 after:content-[attr(content)] after:text-5xl after:bg-yellow-400 after:p-2 after:text-yellow-800',
        )}
      />

      <Portal>
        <div class="font-mono absolute top-0 left-0 bottom-0 h-screen overflow-scroll text-xs whitespace-pre bg-black/90 p-4 hover:z-10">
          {JSON.stringify(debugData(), null, 2)}
        </div>

        <div class="fixed inset-0 pointer-events-none z-100 after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:h-full after:bg-green-500 after:w-1" />
      </Portal>
    </Show>
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
