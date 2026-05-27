import type { ComponentProps, ParentComponent } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

export function TypographyH1(props: ComponentProps<'h1'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <h1 class={cn('scroll-m-20 text-4xl font-extrabold tracking-tight text-balance', local.class)} {...rest} />
}

export function TypographyH2(props: ComponentProps<'h2'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <h2
      class={cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', local.class)}
      {...rest}
    />
  )
}

export function TypographyH3(props: ComponentProps<'h3'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <h3 class={cn('scroll-m-20 text-2xl font-semibold tracking-tight', local.class)} {...rest} />
}

export function TypographyH4(props: ComponentProps<'h4'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <h4 class={cn('scroll-m-20 text-xl font-semibold tracking-tight', local.class)} {...rest} />
}

export function TypographyP(props: ComponentProps<'p'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <p class={cn('leading-7 not-first:mt-6', local.class)} {...rest} />
}

export function TypographyLead(props: ComponentProps<'p'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <p class={cn('text-muted-foreground text-xl', local.class)} {...rest} />
}

export function TypographyLarge(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div class={cn('text-lg font-semibold', local.class)} {...rest} />
}

export function TypographySmall(props: ComponentProps<'small'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <small class={cn('text-sm leading-none font-medium', local.class)} {...rest} />
}

export function TypographyMuted(props: ComponentProps<'p'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <p class={cn('text-muted-foreground text-sm', local.class)} {...rest} />
}

export function TypographyBlockquote(props: ComponentProps<'blockquote'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <blockquote class={cn('mt-6 border-l-2 pl-6 italic', local.class)} {...rest} />
}

export function TypographyList(props: ComponentProps<'ul'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <ul class={cn('my-6 ml-6 list-disc [&>li]:mt-2', local.class)} {...rest} />
}

export function TypographyInlineCode(props: ComponentProps<'code'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <code
      class={cn('bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', local.class)}
      {...rest}
    />
  )
}

export const TypographyTable: ParentComponent<ComponentProps<'table'>> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])

  return (
    <div class="my-6 w-full overflow-y-auto">
      <table class={cn('w-full', local.class)} {...rest}>
        {local.children}
      </table>
    </div>
  )
}
