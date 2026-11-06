import type { Assets } from '@/routeAssets.gen'
import { useMatches } from '@tanstack/solid-router'
import { cn } from 'cn'
import { For, splitProps, type ComponentProps, type JSX } from 'solid-js'
import { Asset, type AssetProps } from './Asset'
import { useGlobalState } from './GlobalStateContext'
import { Player } from './Player'
import { SceneContext } from './Scene.context'
import { DialogLayer } from './interactive-layer/Dialog.layer'
import { MarkersLayer } from './interactive-layer/Markers.layer'
import { PopoverLayer } from './interactive-layer/Popover.layer'
import { SlotLayer } from './interactive-layer/Slot.layer'

export function Root(props: { children: JSX.Element }) {
  const { scene, interaction } = useGlobalState()
  const sceneName = useMatches({
    select: (matches) => [...matches].reverse().find((m) => m.staticData.scene)!.staticData.scene,
  })

  return (
    <SceneContext.Provider value={sceneName() as any}>
      <div data-viewport class="box-content w-min h-(--real-scene-height) overflow-hidden relative">
        <div data-scaled-box class="relative z-1 box-content w-(--real-scene-width) h-(--real-scene-height)">
          <div
            data-scrollable-scene
            class="w-(--original-scene-width) h-(--original-scene-height) scale-(--scale) origin-top-left"
          >
            <div ref={(el) => (scene.ref = el)} class="size-full relative z-1 [view-transition-npame:scene]">
              {props.children}
            </div>
          </div>
        </div>

        <div
          data-dialog-slot
          class={cn(
            'fixed left-0 z-0 w-full h-(--real-scene-height) top-[calc((100%-var(--real-scene-height))/2)] flex items-center justify-center',
            interaction.isActive() && 'z-1',
          )}
        >
          <div ref={scene.setViewportRef} class="scale-(--scale)" />
        </div>
      </div>
    </SceneContext.Provider>
  )
}

export function Elements(props: { children: JSX.Element }) {
  const { scene } = useGlobalState()
  return (
    <div ref={(el) => (scene.elementsContainerRef = el)} class="absolute top-0 left-0 size-[inherit] transform-3d z-2">
      {props.children}
    </div>
  )
}

export function Background<K extends keyof Assets, A extends keyof Assets[K]>(props: AssetProps<K, A>) {
  const { scene } = useGlobalState()
  const [local, rest] = splitProps(props, ['ref', 'class'])
  return (
    <>
      <Asset
        ref={(el) => {
          scene.backgroundRef = el
          typeof local.ref === 'function' ? local.ref(el) : (local.ref = el)
        }}
        class={cn('bg-background relative size-[inherit]', local.class)}
        {...rest}
      />
      <BackdropLayers />
    </>
  )
}

export function BareBackground(props: ComponentProps<'div'>) {
  const { scene } = useGlobalState()
  const [local, rest] = splitProps(props, ['ref', 'class'])
  return (
    <>
      <div
        ref={(el) => {
          scene.backgroundRef = el
          typeof local.ref === 'function' ? local.ref(el) : (local.ref = el)
        }}
        class={cn('bg-background size-[inherit] absolute inset-0 z-0', local.class)}
        {...rest}
      />
      <BackdropLayers />
    </>
  )
}

Background.Bare = BareBackground

function BackdropLayers() {
  return (
    <>
      <PopoverLayer />
      <DialogLayer />
      <SlotLayer type="popoverAnchor" />
      <SlotLayer type="asset" />
    </>
  )
}

export function Players() {
  const { player, otherPlayersIds } = useGlobalState()
  return (
    <>
      <For each={otherPlayersIds()}>{(userId) => <Player.Other id={userId} />}</For>
      <div ref={player.setRenderedSlotRef}>
        <Player.Me />
      </div>
      <MarkersLayer />
    </>
  )
}
