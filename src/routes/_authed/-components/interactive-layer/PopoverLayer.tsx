import { PopoverArrowIcon } from '@/components/PopoverArrow'
import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cn } from 'cn'
import { createEffect, createMemo, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useGlobalState } from '../GlobalStateContext'
import { SlotLayer } from './SlotLayer'

export function PopoverLayer() {
  const { nodes, nodeSlots, scene, popover } = useGlobalState()
  const activeId = createMemo(() => popover.activeNodeId() ?? popover.prevActiveNodeId())
  const currentlyRenderedElement = createMemo(() => {
    const id = activeId()
    const node = id ? nodes.get(id) : undefined
    return node?.type === 'popover' ? node : undefined
  })

  const content = createMemo(() => {
    const id = activeId()
    return id ? nodeSlots[id]?.content : undefined
  })

  const backdropVariant = createMemo(() => {
    const el = currentlyRenderedElement()
    if (!el?.collided()) return undefined
    return el.status() === 'interacting' ? 'engaged' : 'collided'
  })

  return (
    <>
      <PopoverPrimitive.Backdrop
        data-slot="popover-backdrop"
        data-variant={backdropVariant()}
        class="fixed inset-0 bg-black opacity-0 transition-opacity data-starting-style:opacity-0 data-closed:opacity-0 data-[variant=engaged]:opacity-50 data-[variant=collided]:opacity-30 ease-in-out"
      />

      <SlotLayer type="anchor" />
      <SlotLayer type="asset" />

      <PopoverPrimitive.Portal keepMounted container={scene.ref}>
        <div class="z-1 fixed inset-0">
          <div class="absolute top-0 left-0 size-full translate-x-(--scene-tx)">
            <PopoverPrimitive.Positioner
              class="isolate z-50"
              align={currentlyRenderedElement()?.data.positioner.align}
              side={currentlyRenderedElement()?.data.positioner.side}
              anchor={currentlyRenderedElement()?.data.anchorRef}
              arrowPadding={15}
              alignOffset={0}
              sideOffset={0}
              trackAnchor={true}
              collisionAvoidance={{ align: 'none' }}
            >
              <PopoverPrimitive.Popup
                data-slot="popover-content"
                data-variant="scenery"
                class={cn(
                  'group z-50 rounded-lg origin-(--transform-origin) p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all bg-glass-ph-very-dark-cornflower-blue/5 text-ph-light-cornflower-blue [--arrow-offset:0px] data-starting-style:opacity-0 data-ending-style:opacity-0 data-closed:opacity-0 duration-200 ease-out border-2 [--bc:var(--ph-light-cornflower-blue)] border-(--bc) animate-pulseY delay-100 flex flex-col gap-6',
                )}
              >
                <PopoverPrimitive.Arrow
                  data-slot="popover-arrow"
                  class={cn(
                    `data-[side=bottom]:top-[calc(-9px+var(--arrow-offset))]
                    data-[side=left]:right-[calc(-14px+var(--arrow-offset))]
                    data-[side=left]:rotate-90
                    data-[side=right]:left-[calc(-14px+var(--arrow-offset))]
                    data-[side=right]:-rotate-90
                    data-[side=top]:bottom-[calc(-9px+var(--arrow-offset))]
                    data-[side=top]:rotate-180`,
                  )}
                >
                  <PopoverArrowIcon
                    class={cn(`
                      *:nth-[1]:fill-glass-ph-very-dark-cornflower-blue/5
                      *:nth-[2]:fill-(--bc)
                      *:nth-[3]:fill-(--bc)
                    `)}
                  />
                </PopoverPrimitive.Arrow>

                <Show when={content()}>{(c) => <Dynamic component={c()} />}</Show>
              </PopoverPrimitive.Popup>
            </PopoverPrimitive.Positioner>
          </div>
        </div>
      </PopoverPrimitive.Portal>
    </>
  )
}
