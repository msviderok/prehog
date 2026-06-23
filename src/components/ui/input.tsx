import { cn } from '@/lib/utils'
import { splitProps, type ComponentProps } from 'solid-js'
import { Input as InputPrimitive } from '@msviderok/base-ui-solid/input'

function Input(props: ComponentProps<'input'>) {
  const [local, rest] = splitProps(props, ['class', 'type'])
  return (
    <InputPrimitive
      type={local.type}
      data-slot="input"
      class={cn(
        'h-8 w-full min-w-0 px-2 py-0.5 text-xs transition-colors border-transparent outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-muted/30 focus-visible:border-b disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        local.class,
      )}
      {...rest}
    />
  )
}

export { Input }
