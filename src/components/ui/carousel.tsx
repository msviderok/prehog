import { cn } from 'cn'
import useEmblaCarousel, { type CreateEmblaCarouselType } from 'embla-carousel-solid'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-solid'
import {
  createContext,
  createEffect,
  createSignal,
  on,
  onCleanup,
  splitProps,
  useContext,
  type Accessor,
  type ComponentProps,
  type Setter,
} from 'solid-js'
import { callEventHandler, defaultProps } from '@/lib/utils'

type CarouselApi = ReturnType<CreateEmblaCarouselType[1]>
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: Setter<CarouselApi>
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: Accessor<boolean>
  canScrollNext: Accessor<boolean>
} & Omit<CarouselProps, 'orientation'> & { orientation: Accessor<'horizontal' | 'vertical' | undefined> }

const CarouselContext = createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

function Carousel(componentProps: ComponentProps<'div'> & CarouselProps) {
  const props = defaultProps(componentProps, { orientation: 'horizontal' })
  const [local, rest] = splitProps(props, [
    'orientation',
    'opts',
    'setApi',
    'plugins',
    'class',
    'children',
    'onKeyDown',
    'role',
    'aria-roledescription',
  ])
  const [carouselRef, emblaApi] = useEmblaCarousel(
    () => ({ ...local.opts, axis: local.orientation === 'horizontal' ? 'x' : 'y' }),
    () => local.plugins(),
  )
  const [canScrollPrev, setCanScrollPrev] = createSignal(false)
  const [canScrollNext, setCanScrollNext] = createSignal(false)

  function onSelect(api: CarouselApi) {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }

  const scrollPrev = () => emblaApi()?.scrollPrev()
  const scrollNext = () => emblaApi()?.scrollNext()

  createEffect(
    on(emblaApi, (api) => {
      if (!api || !local.setApi) return
      local.setApi(emblaApi)

      onSelect(api)
      api.on('reInit', onSelect)
      api.on('select', onSelect)

      onCleanup(() => {
        api.off('select', onSelect)
      })
    }),
  )

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: emblaApi,
        get opts() {
          return local.opts
        },
        orientation: () => local.orientation || (local.opts()?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
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

          callEventHandler(local.onKeyDown, event)
        }}
        class={cn('relative', local.class)}
        role={local.role ?? 'region'}
        aria-roledescription={local['aria-roledescription'] ?? 'carousel'}
        data-slot="carousel"
        {...rest}
      >
        {local.children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} class="overflow-hidden" data-slot="carousel-content">
      <div class={cn('flex', orientation() === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', local.class)} {...rest} />
    </div>
  )
}

function CarouselItem(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      class={cn('min-w-0 shrink-0 grow-0 basis-full', orientation() === 'horizontal' ? 'pl-4' : 'pt-4', local.class)}
      {...rest}
    />
  )
}

function CarouselPrevious(componentProps: ComponentProps<typeof Button>) {
  const props = defaultProps(componentProps, { variant: 'outline', size: 'icon-sm' })
  const [local, rest] = splitProps(props, ['class', 'variant', 'size', 'disabled', 'onClick'])
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={local.variant}
      size={local.size}
      class={cn(
        'absolute touch-manipulation rounded-full',
        orientation() === 'horizontal' ? 'inset-y-0 -left-12 my-auto' : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        local.class,
      )}
      disabled={!canScrollPrev()}
      onClick={scrollPrev}
      {...rest}
    >
      <ChevronLeftIcon />
      <span class="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext(componentProps: ComponentProps<typeof Button>) {
  const props = defaultProps(componentProps, { variant: 'outline', size: 'icon-sm' })
  const [local, rest] = splitProps(props, ['class', 'variant', 'size', 'disabled', 'onClick'])
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={local.variant}
      size={local.size}
      class={cn(
        'absolute touch-manipulation rounded-full',
        orientation() === 'horizontal'
          ? 'inset-y-0 -right-12 my-auto'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        local.class,
      )}
      disabled={!canScrollNext()}
      onClick={scrollNext}
      {...rest}
    >
      <ChevronRightIcon />
      <span class="sr-only">Next slide</span>
    </Button>
  )
}

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel }
