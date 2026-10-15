import { KeycapButton } from '@/components/ui/button'
import { defaultProps } from '@/lib/utils'
import { cn } from 'cn'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-solid'
import { CornerDownLeftIcon, MoveDownIcon, MoveLeftIcon, MoveRightIcon, MoveUpIcon } from 'lucide-solid'
import {
  batch,
  createContext,
  createMemo,
  createSignal,
  Index,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type ComponentProps,
  type JSX,
  type Setter,
} from 'solid-js'
import { Motion } from 'solid-motionone'
import { Card } from './card'

export type CarouselApi = UseEmblaCarouselType[2]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

interface ItemsProps<T extends readonly any[]> {
  list: T
  value: T[number]
  onValueChange: (value: T[number]) => void
  onConfirm: (newValue: T[number]) => void
  onDiscard: (originalValue: T[number]) => void
}

interface CarouselProps {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: Setter<CarouselApi>
  class?: string
  variant?: 'default' | 'bare'
  children?: JSX.Element
}

interface CarouselContextProps<T extends readonly any[]>
  extends Omit<CarouselProps, 'orientation' | 'variant'>, ItemsProps<T> {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: Accessor<boolean>
  canScrollNext: Accessor<boolean>
  orientation: Accessor<'horizontal' | 'vertical' | undefined>
  currentIndex: Accessor<number>
  setCurrentIndex: Setter<number>
  variant: Accessor<'default' | 'bare'>
  readonly valueInView: Accessor<T[number]>
}

const CarouselContext = createContext<CarouselContextProps<any[]> | null>(null)

export function useCarousel() {
  const context = useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

export function Carousel<T extends readonly any[]>(componentProps: CarouselProps & ItemsProps<T>) {
  const props = defaultProps(componentProps, { orientation: 'horizontal', variant: 'default' })
  const [local, list, rest] = splitProps(
    props,
    ['orientation', 'opts', 'setApi', 'plugins', 'class', 'children'],
    ['list', 'value', 'onValueChange', 'onConfirm', 'onDiscard'],
  )
  const [carouselRef, emblaApi] = useEmblaCarousel(
    () => ({ loop: true, ...local.opts?.(), axis: local.orientation === 'horizontal' ? 'x' : 'y' }),
    () => local.plugins?.() ?? [],
  )

  const initialValue = list.value
  const [canScrollPrev, setCanScrollPrev] = createSignal(local.opts?.()?.loop ?? true)
  const [canScrollNext, setCanScrollNext] = createSignal(local.opts?.()?.loop ?? true)
  const [currentIndex, setCurrentIndex] = createSignal(list.list.indexOf(list.value))

  const valueInView = createMemo(() => list.list[currentIndex()])

  function onConfirm() {
    const val = valueInView()
    list.onValueChange(val)
    list.onConfirm(val)
  }

  function onDiscard() {
    list.onValueChange(initialValue)
    list.onDiscard(initialValue)
  }

  function onSelect(api: CarouselApi) {
    batch(() => {
      setCanScrollPrev(api.canGoToPrev())
      setCanScrollNext(api.canGoToNext())
      const idx = api.selectedSnap()
      setCurrentIndex(idx)
      list.onValueChange(list.list[idx])
    })
  }

  function scrollPrev() {
    emblaApi()?.goToPrev()
  }
  function scrollNext() {
    emblaApi()?.goToNext()
  }

  onMount(() => {
    const api = emblaApi()
    if (!api) throw new Error('EmblaCarousel is not initialized')
    local.setApi?.(api)

    api.on('reinit', onSelect)
    api.on('select', onSelect)
    api.goTo(currentIndex(), true)

    onCleanup(() => {
      api.off('select', onSelect)
    })
  })

  const variant = createMemo(() => props.variant)
  const orientation = createMemo(() => local.orientation || (local.opts()?.axis === 'y' ? 'vertical' : 'horizontal'))

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: emblaApi,
        get opts() {
          return local.opts
        },
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        currentIndex,
        setCurrentIndex,
        valueInView,
        variant,
        onConfirm,
        onDiscard,
        get value() {
          return list.value
        },
        onValueChange: list.onValueChange,
        list: list.list as any,
      }}
    >
      <div
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            scrollPrev()
          } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            scrollNext()
          }
        }}
        class={cn(
          'relative grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]',
          orientation() === 'horizontal' && 'w-full h-min',
          orientation() === 'vertical' && 'size-full',
          local.class,
        )}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...rest}
      >
        {local.children}
      </div>
    </CarouselContext.Provider>
  )
}

export function CarouselContent<T extends readonly any[], U extends JSX.Element>(
  props: Omit<ComponentProps<'div'>, 'children'> & {
    children: (item: Accessor<T[number]>, ctx: CarouselContextProps<T>, index: number) => U
  },
) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const ctx = useCarousel()
  const { carouselRef, list, orientation } = ctx

  return (
    <div ref={carouselRef} class="overflow-hidden min-h-0 [--cspace:0.25rem]" data-slot="carousel-content">
      <div
        class={cn(
          'flex size-full items-center',
          orientation() === 'horizontal' && '',
          orientation() === 'vertical' && 'flex-col',
          local.class,
        )}
        {...rest}
      >
        <Index each={list}>{(item, idx) => <>{props.children(item, ctx as any, idx)}</>}</Index>
      </div>
    </div>
  )
}

export function CarouselItem<T extends any>(props: ComponentProps<'div'> & { value: T }) {
  const [local, rest] = splitProps(props, ['class', 'children', 'value'])
  const { orientation, valueInView, variant } = useCarousel()
  const isInView = createMemo(() => local.value === valueInView())

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      class={cn(
        'flex items-center justify-center basis-1/3 min-w-0 min-h-0 shrink-0 grow-0 relative aspect-square',
        orientation() === 'horizontal' && 'pl-(--cspace)',
        orientation() === 'vertical' && 'pt-(--cspace)',
        local.class,
      )}
      {...rest}
    >
      <Motion.div class={cn('size-[calc(100%-var(--cspace))]')} animate={{ scale: isInView() ? 1 : 0.8 }}>
        <Card
          class={cn(
            'py-4 size-full relative',
            variant() === 'default' && 'border-6 bg-glass-ph-dark-grey/20!',
            variant() === 'default' && isInView() && 'bg-glass-ph-soft-green/20!',

            variant() === 'bare' && 'border-none bg-transparent ring-0!',
            variant() === 'bare' && isInView() && 'bg-transparent',
          )}
        >
          {local.children}
        </Card>
      </Motion.div>
    </div>
  )
}

export function CarouselPrevious(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  const [local, rest] = splitProps(props, ['class'])
  const { orientation, scrollPrev, canScrollPrev, variant } = useCarousel()
  return (
    <div
      class={cn(
        'absolute z-1',
        orientation() === 'horizontal' && 'left-0 top-1/2 translate-x-[-110%] -translate-y-1/2',
        orientation() === 'vertical' && 'top-0 left-1/2 -translate-x-1/2 translate-y-[-110%]',
      )}
    >
      <Show when={orientation() === 'horizontal'}>
        <KeycapButton
          data-slot="carousel-previous"
          size="lg"
          hotkey="A"
          sound={{ keydown: 'carouselChangeSlideHorizontal', keyup: null }}
          class={cn(variant() === 'default' && '*:first:relative *:first:-top-1', local.class)}
          disabled={!canScrollPrev()}
          onPress={scrollPrev}
          onHold={scrollPrev}
          {...rest}
        >
          <MoveLeftIcon class="absolute bottom-0 size-8" />
        </KeycapButton>
      </Show>
      <Show when={orientation() === 'vertical'}>
        <KeycapButton
          data-slot="carousel-previous"
          size="lg"
          hotkey="W"
          sound={{ keydown: 'carouselChangeSlideVertical', keyup: null }}
          class={cn(variant() === 'default' && '*:first:relative *:first:top-1 *:first:right-2', local.class)}
          disabled={!canScrollPrev()}
          onPress={scrollPrev}
          onHold={scrollPrev}
          {...rest}
        >
          <MoveUpIcon class="absolute right-0 size-8" />
        </KeycapButton>
      </Show>
    </div>
  )
}

export function CarouselNext(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  const [local, rest] = splitProps(props, ['class'])
  const { orientation, scrollNext, canScrollNext, variant } = useCarousel()
  return (
    <div
      class={cn(
        'absolute z-1',
        orientation() === 'horizontal' && 'right-0 top-1/2 translate-x-[110%] -translate-y-1/2',
        orientation() === 'vertical' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[120%]',
      )}
    >
      <Show when={orientation() === 'horizontal'}>
        <KeycapButton
          data-slot="carousel-next"
          size="lg"
          hotkey="D"
          sound={{ keydown: 'carouselChangeSlideHorizontal', keyup: null }}
          class={cn(variant() === 'default' && '*:first:relative *:first:-top-1', local.class)}
          disabled={!canScrollNext()}
          onPress={scrollNext}
          onHold={scrollNext}
          {...rest}
        >
          <MoveRightIcon class="absolute bottom-0 size-8" />
        </KeycapButton>
      </Show>
      <Show when={orientation() === 'vertical'}>
        <KeycapButton
          data-slot="carousel-next"
          size="lg"
          hotkey="S"
          sound={{ keydown: 'carouselChangeSlideVertical', keyup: null }}
          class={cn(variant() === 'default' && '*:first:relative *:first:top-1 *:first:right-2', local.class)}
          disabled={!canScrollNext()}
          onPress={scrollNext}
          onHold={scrollNext}
          {...rest}
        >
          <MoveDownIcon class="absolute right-0 size-8" />
        </KeycapButton>
      </Show>
    </div>
  )
}

export function CarouselConfirm() {
  const { onConfirm } = useCarousel()
  return (
    <KeycapButton
      data-slot="carousel-next"
      size="lg"
      hotkey="Enter"
      class="touch-manipulation flex-1 px-8 pl-16"
      onPress={onConfirm}
    >
      <CornerDownLeftIcon class="absolute left-4 stroke-3" />
      <span class="text-base absolute bottom-0">to confirm</span>
    </KeycapButton>
  )
}

export function CarouselDiscard() {
  const { onDiscard } = useCarousel()
  return (
    <KeycapButton
      data-slot="carousel-next"
      size="lg"
      hotkey="Escape"
      label="Esc"
      class="touch-manipulation flex-1 px-8"
      onPress={onDiscard}
    >
      <span class="text-base absolute bottom-0">to discard</span>
    </KeycapButton>
  )
}
