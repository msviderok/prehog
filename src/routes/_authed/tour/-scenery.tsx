import { Prose } from '@/components/Prose'
import { KeycapButton } from '@/components/ui/button'
import { PopoverDescription, PopoverFooter, PopoverHeader, PopoverTitle } from '@/components/ui/popover'
import * as Scene from '@/routes/_authed/-components/Scene'
import * as InteractiveNode from '@/routes/_authed/-components/interactive-layer'
import { cn } from 'cn'
import { animate } from 'motion'
import { Asset } from '../-components/Asset'
import { useGlobalState } from '../-components/GlobalStateContext'

const MARKER_Y = 90
const POPOVER_Y = MARKER_Y - 18
const SCALE = 1.5

export function Scenery() {
  return (
    <>
      <Scene.Background.Bare class="-z-1">
        <Asset routeId="/_authed/tour/" asset="Plaster_08-256x256.png" repeat class="size-full opacity-70" />
        <Asset
          routeId="/_authed/tour/"
          asset="Wood_13-256x256.png"
          repeat
          class="w-full h-60 top-[unset] bottom-0 hue-rotate-120 brightness-60"
        />
        <Asset
          routeId="/_authed/tour/"
          asset="Dirt_05-128x128.png"
          repeat
          class="w-full h-60 top-[unset] bottom-0 opacity-50"
        />
        <Asset
          routeId="/_authed/application/"
          asset="pilar.png"
          class="bottom-55 top-[unset] -left-10 w-250 hue-rotate-335 opacity-70"
        />
        <Asset
          routeId="/_authed/application/"
          asset="pilar.png"
          class="bottom-55 top-[unset] left-[unset] -right-10 w-250 hue-rotate-335 opacity-70"
        />

        <Asset routeId="/_authed/tour/" asset="evolution.png" class="absolute-center-x brightness-70" />

        <div class="absolute top-10 left-20 translate-x-(--scene-tx)">
          <Prose class="text-3xl text-ph-light-beige max-w-200">
            <p class="text-[6rem] comic">Experience</p>
            <p class="">
              So here is my journey. Feel free to roam around to check out my evolution from being a PHP dev working to
              whatever I am today.
            </p>
          </Prose>
        </div>
      </Scene.Background.Bare>

      <Scene.Elements>
        <Scene.Players />

        <InteractiveNode.Root id="door">
          <InteractiveNode.Preload.Route route="main" />
          <InteractiveNode.Marker.Root x={3} y={MARKER_Y}>
            <InteractiveNode.Marker.Pill label="Go back" goTo="main" />
          </InteractiveNode.Marker.Root>
        </InteractiveNode.Root>

        <Stage1 />

        <InteractiveNode.Root id="stage2">
          <InteractiveNode.Asset routeId="/_authed/tour/" asset="stage2.png" x={31.5} y={25}>
            <Asset
              routeId="/_authed/tour/"
              asset="shadow.png"
              x={0}
              y={35}
              class="[--tx:0] brightness-70"
              highlight={false}
            />
          </InteractiveNode.Asset>
          <InteractiveNode.Marker.Root x={34.5} y={MARKER_Y} />

          <InteractiveNode.Popover anchorX={34.5} anchorY={POPOVER_Y} side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>Stage 2</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>
              This is stage 2 of my experience. Probably should tell smth about my post-PettersonApps era.
            </PopoverDescription>
          </InteractiveNode.Popover>

          <Period class="top-[70%] left-[34.1%]" from={2019} />
        </InteractiveNode.Root>

        <InteractiveNode.Root id="stage3">
          <InteractiveNode.Asset routeId="/_authed/tour/" asset="stage3.png" x={46} y={20}>
            <Asset
              routeId="/_authed/tour/"
              asset="shadow.png"
              x={0}
              y={40}
              class="[--tx:60px] brightness-70"
              highlight={false}
            />
          </InteractiveNode.Asset>
          <InteractiveNode.Marker.Root x={50} y={MARKER_Y} />

          <InteractiveNode.Popover anchorX={50} anchorY={POPOVER_Y} side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>Stage 3</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>
              This is stage 3 of my experience. The whole OverlayAnalytics journey begins...
            </PopoverDescription>
          </InteractiveNode.Popover>

          <Period class="top-[70%] left-[49.55%]" from={2021} />
        </InteractiveNode.Root>

        <InteractiveNode.Root id="stage4">
          <InteractiveNode.Asset routeId="/_authed/tour/" asset="stage4.png" x={61.5} y={20}>
            <Asset
              routeId="/_authed/tour/"
              asset="shadow.png"
              x={0}
              y={40}
              class="[--tx:60px] brightness-70"
              highlight={false}
            />
          </InteractiveNode.Asset>
          <InteractiveNode.Marker.Root x={65.4} y={MARKER_Y} />

          <InteractiveNode.Popover anchorX={65.4} anchorY={POPOVER_Y} side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>Stage 4</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>
              This is stage 4 of my experience. Valora and everything afterwards like Base UI should be described here.
            </PopoverDescription>
          </InteractiveNode.Popover>

          <Period class="top-[70%] left-[64.9%]" from={2024} />
        </InteractiveNode.Root>

        <InteractiveNode.Root id="stage5">
          <InteractiveNode.Asset routeId="/_authed/tour/" asset="stage4.png" x={75} y={20}>
            <Asset
              routeId="/_authed/tour/"
              asset="shadow.png"
              x={0}
              y={40}
              class="[--tx:60px] brightness-70"
              highlight={false}
            />
          </InteractiveNode.Asset>
          <InteractiveNode.Marker.Root x={80.8} y={MARKER_Y} />

          <InteractiveNode.Popover anchorX={80.8} anchorY={POPOVER_Y} side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>Stage 5</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>
              This is stage 5 of my experience. What do I imagine for myself in PostHog?
            </PopoverDescription>
          </InteractiveNode.Popover>
          <Period class="top-[70%] left-[79.9%]" from={2025} to="- ..." />
        </InteractiveNode.Root>
      </Scene.Elements>
    </>
  )
}

function Stage1() {
  const { scene, dialog, player, gameState, interaction } = useGlobalState()
  let assetContainerRef!: HTMLDivElement

  return (
    <InteractiveNode.Root id="stage1">
      <Period class="top-[70%] left-[19.6%]" from={2016} />

      <div ref={assetContainerRef}>
        <InteractiveNode.Asset routeId="/_authed/tour/" asset="stage1.png" x={18} y={30}>
          <Asset
            routeId="/_authed/tour/"
            asset="shadow.png"
            x={0}
            y={30}
            class="[--tx:0] brightness-70"
            highlight={false}
          />
        </InteractiveNode.Asset>
      </div>
      <InteractiveNode.Marker.Root x={20} y={MARKER_Y} />

      <InteractiveNode.Popover anchorX={22} anchorY={POPOVER_Y} side="right" align="start" class="max-w-100">
        <PopoverHeader>
          <PopoverTitle class="italic">The Journey Begins</PopoverTitle>
        </PopoverHeader>{' '}
        <PopoverDescription class="text-base text-blue-200 " render={{ component: Prose }}>
          <p>It is spring of 2016.</p>
          <p>I'm at the end of my second year of uni and I land my first ever programming job!</p>
        </PopoverDescription>
        <PopoverFooter>
          <KeycapButton.Container>
            <KeycapButton.Keycap
              size="sm"
              onPress={() => {
                const assetSlot = gameState.scene().nodes.slots['stage1']?.asset
                if (player.isLocked()) {
                  animate(scene.ref, { scale: 1, x: 0, y: 0 })
                  interaction.finish('cancel')
                  assetSlot?.setContainerRef(assetContainerRef)
                } else {
                  animate(scene.ref, { scale: SCALE, x: sceneX(10), y: sceneY(0) })
                  interaction.start({ type: 'dialog', nodeId: 'stage1' })
                  assetSlot?.setContainerRef(dialog.ref)
                }
              }}
            />
            <KeycapButton.Label>Tell me more!</KeycapButton.Label>
          </KeycapButton.Container>
        </PopoverFooter>
      </InteractiveNode.Popover>

      <InteractiveNode.Dialog class="size-150 rounded-3xl">123</InteractiveNode.Dialog>
    </InteractiveNode.Root>
  )
}

function Period(props: { from: string | number; to?: string | number; class?: string }) {
  return (
    <div
      class={cn(
        'game-transform font-bold tracking-wider translate-x-(--scene-tx) absolute text-2xl text-black flex items-center gap-1 select-none',
        props.class,
      )}
    >
      <span>{props.from}</span>
      {/*<ArrowRightIcon class="relative -top-0.5 stroke-3 size-5" />*/}
      {props.to && <span>{props.to}</span>}
    </div>
  )
}

function sceneX(x: number) {
  return `calc(var(--scene-tx) * -${SCALE} + ${(SCALE - 1) * 50 - x * SCALE}%)`
}

function sceneY(y: number) {
  return `${(SCALE - 1) * 50 - y * SCALE}%`
}
