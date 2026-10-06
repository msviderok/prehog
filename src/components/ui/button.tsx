import { SOUNDS } from '@/audio'
import { defaultProps } from '@/lib/utils'
import { useSceneryPopoverNode } from '@/routes/_authed/-components/SceneryPopoverContext'
import { createHotkeys, type Hotkey, type HotkeyCallback } from '@tanstack/solid-hotkeys'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import { Button as ButtonPrimitive } from './button-primitive'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm bg-(--v-color) border-shade-(--v-color)/30 font-base transition-all gap-2 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-transparent focus-visible:ring-offset-accent/30 focus-visible:ring-offset-1 disabled:*:pointer-events-none disabled:opacity-50 border-2 hover:[--boxShadowY-dynamic:3px] active:[--boxShadowY-dynamic:0px] cursor-pointer disabled:cursor-not-allowed will-change-[transform,colors] [&_svg]:will-change-transform [&_svg]:transition-transform ease-out duration-150 [&_svg]:ease-out [&_svg]:duration-150',
  {
    variants: {
      variant: {
        default: '',
        // plain:
        //   '[--boxShadowY-dynamic:0px] translate-y-0 hover:[--boxShadowY-dynamic:0] border-shade-white/50 bg-gray-100/10 active:shadow-primary text-shade-white/20  hover:border-shade-white/30 hover:text-shade-white/10 focus:border-shade-white/30 focus:text-shade-white/10',
        outline:
          'not-disabled:not-focus:hover:inset-shadow-tint-(--v-color)/50 not-disabled:hover:inset-shadow-tint-(--v-color)/50 not-disabled:hover:inset-shadow-[0_0_10px_0px] not-disabled:active:inset-shadow-tint-(--v-color)/50 not-disabled:active:inset-shadow-[0_0_10px_4px] not-disabled:aria-expanded:inset-shadow-tint-(--v-color)/50 not-disabled:aria-expanded:inset-shadow-[0_0_10px_2px]',
        toggle:
          'aria-expanded:bg-(--v-color) not-aria-expanded:bg-muted aria-expanded:opacity-100 not-aria-expanded:opacity-50 aria-expanded:border-tint-(--v-color)/50 not-aria-expanded:border-tint-muted/30',
        plain: 'border-none hover:text-accent focus-visible:text-accent bg-foreground/5',

        keycap: cn(`
          bg-white border-black/20! relative isolate size-8! text-shade-ph-dark-cornflower-blue/50 text-xl!
          origin-center
          [--s:0.2em]
          -top-(--s)
          [--boxShadowY-dynamic:var(--s)]
          shadow-white/30
          [box-shadow:0_var(--boxShadowY-dynamic)_0_0_var(--tw-shadow-color)]
          data-[pressed=true]:[--boxShadowY-dynamic:0]
          data-[pressed=true]:translate-y-(--s)
        `),
      },
      animate: {
        default: '',
        'scale-icon':
          'not-disabled:not-aria-expanded:hover:[&_svg]:scale-90 not-disabled:hover:active:[&_svg]:scale-80 aria-expanded:[&_svg]:scale-85',
        scale:
          'not-disabled:active:scale-95 not-disabled:hover:scale-105 not-disabled:focus:scale-105 not-disabled:hover:[&_svg]:scale-105 not-disabled:focus:[&_svg]:scale-105',
      },
      size: {
        default: 'h-10 px-4 py-2 [&_svg]:size-5',
        md: 'h-8 p-4 text-xs [&_svg]:size-4',
        sm: 'h-6 p-3 text-xs [&_svg]:size-4',
        icon: 'size-8 [&_svg]:size-4.5',
        'icon-xs': 'size-6 [&_svg]:size-3.5',
      },
    },
    defaultVariants: {
      variant: 'outline',
      animate: 'default',
      size: 'default',
    },
  },
)

function Button(componentProps: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const props = defaultProps(componentProps, { variant: 'outline', animate: 'default' })
  const [local, rest] = splitProps(props, ['class', 'size', 'variant', 'animate'])
  return <ButtonPrimitive data-slot="button" class={cn(buttonVariants(local))} {...rest} />
}

export function InteractButton(componentProps: {
  /** @default "E" */
  hotkey?: Hotkey
  label?: string
  onPress: HotkeyCallback
}) {
  let ref!: HTMLButtonElement
  const props = defaultProps(componentProps, { hotkey: 'E' })
  const [pressed, setPressed] = createSignal(false)

  const node = useSceneryPopoverNode()
  const disabled = createMemo(() => node.collided.get() !== true)

  createEffect(() => ref.setAttribute('data-pressed', pressed() ? 'true' : 'false'))
  createEffect(() => disabled() && pressed() && setPressed(false))

  createHotkeys(
    [
      {
        hotkey: props.hotkey,
        options: {
          eventType: 'keydown',
          get enabled() {
            return !disabled()
          },
        },
        callback: () => {
          if (disabled()) return
          setPressed(true)

          if (SOUNDS.ui.keyup.playing()) SOUNDS.ui.keyup.stop()
          SOUNDS.ui.keydown.play('default')
        },
      },
      {
        hotkey: props.hotkey,
        options: {
          eventType: 'keyup',
          get enabled() {
            return !disabled()
          },
        },
        callback: (e, ctx) => {
          setPressed(false)
          SOUNDS.ui.keyup.play('default')
          props.onPress(e, ctx)
        },
      },
    ],
    { requireReset: true, conflictBehavior: 'allow' },
  )

  return (
    <div class="animate-pulseY">
      <div class="bg-shade-ph-dark-cornflower-blue/60 border-6 rounded-full flex items-center justify-center gap-3 h-18 px-5 border-glow-ph-light-cornflower-blue w-max">
        <Button variant="keycap" ref={ref}>
          E
        </Button>
        <span class="comic text-xl">{props.label ?? 'Interact'}</span>
      </div>
    </div>
  )
}

export { Button, buttonVariants, InteractButton as PressE }
