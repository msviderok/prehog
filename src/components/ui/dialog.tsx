import { Dialog as DialogPrimitive } from '@msviderok/base-ui-solid/dialog'
import { cn } from 'cn'
import { mergeProps, splitProps, type ComponentProps } from 'solid-js'

import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-solid'
import { useGlobalState } from '@/routes/_authed/-components/GlobalStateContext'

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay(props: DialogPrimitive.Backdrop.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      class={cn(
        'fixed inset-0 isolate z-2 bg-black/70 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        local.class,
      )}
      {...rest}
    />
  )
}

function DialogContent(
  props: DialogPrimitive.Popup.Props & {
    showCloseButton?: boolean
  },
) {
  const mergedProps = mergeProps({ showCloseButton: false }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'children', 'showCloseButton'])

  return (
    <DialogPortal>
      <div class="z-1 fixed inset-0">
        <div class="absolute top-0 left-0 size-full scale-(--scale)">
          <DialogPrimitive.Popup
            data-slot="dialog-content"
            class={cn(
              'fixed left-1/2 h-auto z-50 grid w-full max-w-[calc(100%-4rem)] -translate-x-1/2  duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              local.class,
            )}
            {...rest}
          >
            {local.children}
            {local.showCloseButton && (
              <DialogPrimitive.Close
                data-slot="dialog-close"
                render={{
                  component: Button,
                  variant: 'ghost',
                  class: 'absolute top-2 right-2',
                  size: 'icon-sm',
                }}
              >
                <XIcon />
                <span class="sr-only">Close</span>
              </DialogPrimitive.Close>
            )}
          </DialogPrimitive.Popup>
        </div>
      </div>
    </DialogPortal>
  )
}

function DialogHeader(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div data-slot="dialog-header" class={cn('flex flex-col gap-1', local.class)} {...rest} />
}

function DialogFooter(
  props: ComponentProps<'div'> & {
    showCloseButton?: boolean
  },
) {
  const mergedProps = mergeProps({ showCloseButton: false }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'showCloseButton', 'children'])
  return (
    <div
      data-slot="dialog-footer"
      class={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', local.class)}
      {...rest}
    >
      {local.children}
      {local.showCloseButton && (
        <DialogPrimitive.Close render={{ component: Button, variant: 'outline' }}>Close</DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle(props: DialogPrimitive.Title.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return <DialogPrimitive.Title data-slot="dialog-title" class={cn('text-sm font-medium', local.class)} {...rest} />
}

function DialogDescription(props: DialogPrimitive.Description.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      class={cn(
        'text-xs/relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        local.class,
      )}
      {...rest}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
