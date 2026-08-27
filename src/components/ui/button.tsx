import { UIAudio } from '@/lib/ui-audio'
import { defaultProps } from '@/lib/utils'
import { createHotkeys, type Hotkey, type HotkeyCallback } from '@tanstack/solid-hotkeys'
import { ensureReady } from '@web-kits/audio'
import { cva, type VariantProps } from 'class-variance-authority'
import { batch, createEffect, createMemo, createSignal, onCleanup, onMount, splitProps } from 'solid-js'
import { Button as ButtonPrimitive } from './button-primitive'
import { usePopoverContext } from './popover'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm bg-(--v-color) border-shade-(--v-color)/30 font-base transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-transparent focus-visible:ring-offset-accent/30 focus-visible:ring-offset-1 disabled:*:pointer-events-none disabled:opacity-50 border-2 hover:[--boxShadowY-dynamic:3px] active:[--boxShadowY-dynamic:0px] cursor-pointer disabled:cursor-not-allowed will-change-[transform,colors] [&_svg]:will-change-transform [&_svg]:transition-transform ease-out duration-150 [&_svg]:ease-out [&_svg]:duration-150',
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

        'game-action':
          'shadow-button v-ph-background translate-y-[calc(var(--spacing-boxShadowY)-var(--boxShadowY-dynamic))] [--v-shade:20%] border-3 bg-ph-warm-pink border-ph-background text-shade-ph-background/20 font-bold',
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
    compoundVariants: [
      {
        variant: 'game-action',
        animate: 'scale',
        size: 'default',
        class: 'text-2xl size-12 p-0',
      },
    ],
  },
)

type InferredButtonVariantProps = VariantProps<typeof buttonVariants>

interface VariantOther extends Omit<InferredButtonVariantProps, 'variant'> {
  variant?: Exclude<InferredButtonVariantProps['variant'], 'game-action'>
  hotkey?: never
  onHotkeyPress?: never
}

export interface VariantGameAction extends Omit<InferredButtonVariantProps, 'variant'> {
  variant: Extract<InferredButtonVariantProps['variant'], 'game-action'>
  hotkey: Hotkey
  onHotkeyPress: HotkeyCallback
}

interface SoundProps {
  sound?: 'off' | { click?: UIAudio.SoundKey; tap?: UIAudio.SoundKey }
}

type ConfigurableSound = keyof Extract<SoundProps['sound'], object>

type ExtraButtonProps = (VariantOther | VariantGameAction) & SoundProps

function Button(componentProps: ButtonPrimitive.Props & ExtraButtonProps) {
  let ref!: HTMLButtonElement
  const popoverCtx = usePopoverContext()
  const [pressed, setPressed] = createSignal(false)
  const props = defaultProps(componentProps, { variant: 'outline', size: 'default', animate: 'default' })
  const [local, rest] = splitProps(props, [
    'class',
    'size',
    'variant',
    'animate',
    'ref',
    'sound',
    'hotkey',
    'onHotkeyPress',
    'disabled',
  ])

  const disabled = createMemo(() =>
    popoverCtx != null ? popoverCtx.node?.actions.open.get() !== true : local.disabled,
  )

  async function handleSound(soundKey: ConfigurableSound | UIAudio.SoundKey) {
    if (local.sound === 'off') return
    await ensureReady()
    const sound = local.sound?.[soundKey as ConfigurableSound] ?? (UIAudio.get(soundKey) ? soundKey : 'click')
    return UIAudio.play(sound)
  }

  const onSoundHandleClick = () => handleSound('click')
  const onSoundHandleTap = () => handleSound('tap')
  const onSoundHandleMouseOver = () => handleSound('hover')

  createEffect(() => {
    if (local.sound === 'off') return

    ref.addEventListener('click', onSoundHandleClick)
    ref.addEventListener('touchstart', onSoundHandleTap)
    ref.addEventListener('mouseover', onSoundHandleMouseOver)

    return () => {
      ref.removeEventListener('click', onSoundHandleClick)
      ref.removeEventListener('touchstart', onSoundHandleTap)
      ref.removeEventListener('mouseover', onSoundHandleMouseOver)
    }
  })

  createEffect(() => {
    if (pressed()) ref.style.setProperty('--boxShadowY-dynamic', '0px')
    else ref.style.removeProperty('--boxShadowY-dynamic')
  })

  createEffect(() => {
    if (disabled() && pressed()) {
      setPressed(false)
    }
  })

  onMount(() => {
    if (local.variant === 'game-action') {
      createHotkeys(
        [
          {
            hotkey: local.hotkey,
            options: {
              eventType: 'keydown',
              get enabled() {
                return !disabled()
              },
            },
            callback: () => {
              if (disabled()) return
              setPressed(true)
              onSoundHandleClick()
            },
          },
          {
            hotkey: local.hotkey,
            options: {
              eventType: 'keyup',
              get enabled() {
                return !disabled()
              },
            },
            callback: (e, ctx) => {
              setPressed(false)
              local.onHotkeyPress(e, ctx)
            },
          },
        ],
        { requireReset: true, conflictBehavior: 'allow' },
      )
    }
  })

  return (
    <ButtonPrimitive
      data-slot="button"
      class={buttonVariants(local)}
      ref={(el) => {
        if (typeof props.ref === 'function') props.ref(el)
        else props.ref = el
        ref = el
      }}
      disabled={disabled()}
      {...rest}
    />
  )
}

export function PressE(props: { onPress: HotkeyCallback }) {
  return (
    <Button variant="game-action" animate="scale" size="icon" hotkey="E" onHotkeyPress={props.onPress}>
      E
    </Button>
  )
}

export { Button, buttonVariants, type ExtraButtonProps }
