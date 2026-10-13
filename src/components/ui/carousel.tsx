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

type CarouselApi = NonNullable<ReturnType<UseEmblaCarouselType[1]>>
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

interface ItemsProps<T extends readonly any[], U extends JSX.Element, L extends JSX.Element> {
  list: T
  getLabel: (item: T[number]) => L
  children: (item: Accessor<T[number]>, label: L, index: number) => U
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
}

interface CarouselContextProps<T extends readonly any[], U extends JSX.Element, L extends JSX.Element> extends Omit<
  CarouselProps,
  'orientation'
> {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: Accessor<boolean>
  canScrollNext: Accessor<boolean>
  orientation: Accessor<'horizontal' | 'vertical' | undefined>
  selectedValue: ItemsProps<T, U, L>['value']
  onSelect: ItemsProps<T, U, L>['onValueChange']
  currentIndex: Accessor<number>
  setCurrentIndex: Setter<number>
  onConfirm: () => void
  onDiscard: () => void
  readonly valueInView: Accessor<T[number]>
}

const CarouselContext = createContext<CarouselContextProps<any[], JSX.Element, string> | null>(null)

export function useCarousel() {
  const context = useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

export function Carousel<T extends readonly any[], U extends JSX.Element, L extends JSX.Element>(
  componentProps: CarouselProps & ItemsProps<T, U, L>,
) {
  const props = defaultProps(componentProps, { orientation: 'horizontal' })
  const [local, list, rest] = splitProps(
    props,
    ['orientation', 'opts', 'setApi', 'plugins', 'class'],
    ['list', 'children', 'value', 'onValueChange', 'onConfirm', 'onDiscard', 'getLabel'],
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
    local.setApi?.(() => api)

    api.on('reinit', onSelect)
    api.on('select', onSelect)
    api.goTo(currentIndex(), true)

    onCleanup(() => {
      api.off('select', onSelect)
    })
  })

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
        selectedValue: list.value as any,
        onSelect: list.onValueChange as any,
        currentIndex,
        setCurrentIndex,
        onConfirm,
        onDiscard,
        valueInView,
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
        class={cn('relative grid size-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]', local.class)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...rest}
      >
        <CarouselContent>
          <Index each={list.list}>
            {(item, idx) => (
              <CarouselItem value={item()}>{props.children(item, list.getLabel(item()), idx)}</CarouselItem>
            )}
          </Index>
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />

        {/*<div class="absolute size-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-[150%] flex items-center justify-between gap-6">
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
        </div>*/}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  const { carouselRef, orientation } = useCarousel()
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
      />
    </div>
  )
}

function CarouselItem<T extends any>(props: ComponentProps<'div'> & { value: T }) {
  const [local, rest] = splitProps(props, ['class', 'children', 'value'])
  const { orientation, selectedValue, valueInView } = useCarousel()
  const isActive = createMemo(() => local.value === selectedValue)
  const isInView = createMemo(() => local.value === valueInView())

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      class={cn(
        'carousel-item aspect-square',
        orientation() === 'horizontal' && 'pl-(--cspace)',
        orientation() === 'vertical' && 'pt-(--cspace)',
        local.class,
      )}
      {...rest}
    >
      <Motion.div class={cn('size-[calc(100%-var(--cspace))]')} animate={{ scale: isInView() ? 1 : 0.8 }}>
        <Card
          class={cn(
            'py-4 border-6 bg-glass-ph-dark-grey/20! size-full relative',
            isInView() && 'bg-glass-ph-soft-green/20!',
            isActive() && '',
          )}
        >
          {local.children}
        </Card>
      </Motion.div>
    </div>
  )
}

function CarouselPrevious() {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()
  return (
    <div
      class={cn(
        'absolute z-1',
        orientation() === 'horizontal' && 'left-0 top-1/2 translate-x-[-150%] -translate-y-1/2',
        orientation() === 'vertical' && 'top-0 left-1/2 -translate-x-1/2 translate-y-[-150%]',
      )}
    >
      <Show when={orientation() === 'horizontal'}>
        <KeycapButton
          data-slot="carousel-previous"
          size="lg"
          hotkey="A"
          class="*:first:relative *:first:-top-1"
          disabled={!canScrollPrev()}
          onPress={scrollPrev}
          onHold={scrollPrev}
        >
          <MoveLeftIcon class="absolute bottom-0 size-8" />
        </KeycapButton>
      </Show>
      <Show when={orientation() === 'vertical'}>
        <KeycapButton
          data-slot="carousel-previous"
          size="lg"
          hotkey="W"
          class="*:first:relative *:first:top-1 *:first:right-2"
          disabled={!canScrollPrev()}
          onPress={scrollPrev}
          onHold={scrollPrev}
        >
          <MoveUpIcon class="absolute right-0 size-8" />
        </KeycapButton>
      </Show>
    </div>
  )
}

function CarouselNext() {
  const { orientation, scrollNext, canScrollNext } = useCarousel()
  return (
    <div
      class={cn(
        'absolute z-1',
        orientation() === 'horizontal' && 'right-0 top-1/2 translate-x-[150%] -translate-y-1/2',
        orientation() === 'vertical' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[150%]',
      )}
    >
      <Show when={orientation() === 'horizontal'}>
        <KeycapButton
          data-slot="carousel-next"
          size="lg"
          hotkey="D"
          class="*:first:relative *:first:-top-1"
          disabled={!canScrollNext()}
          onPress={scrollNext}
          onHold={scrollNext}
        >
          <MoveRightIcon class="absolute bottom-0 size-8" />
        </KeycapButton>
      </Show>
      <Show when={orientation() === 'vertical'}>
        <KeycapButton
          data-slot="carousel-next"
          size="lg"
          hotkey="S"
          class="*:first:relative *:first:top-1 *:first:right-2"
          disabled={!canScrollNext()}
          onPress={scrollNext}
          onHold={scrollNext}
        >
          <MoveDownIcon class="absolute right-0 size-8" />
        </KeycapButton>
      </Show>
    </div>
  )
}
