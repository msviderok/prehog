import { splitProps, type JSX } from 'solid-js'
import { callEventHandler } from '@/lib/utils'

function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === ' ' || event.key === 'Enter'
}

export namespace Button {
  export type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    focusableWhenDisabled?: boolean | undefined
    nativeButton?: boolean | undefined
  }
}

export function Button(props: Button.Props) {
  const [local, rest] = splitProps(props, [
    'disabled',
    'focusableWhenDisabled',
    'nativeButton',
    'type',
    'tabIndex',
    'onClick',
    'onMouseDown',
    'onPointerDown',
    'onKeyDown',
    'onKeyUp',
  ])

  const isDisabled = () => Boolean(local.disabled)
  const isFocusableWhenDisabled = () => isDisabled() && Boolean(local.focusableWhenDisabled)
  const isNativeButton = () => local.nativeButton !== false

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
    if (isDisabled()) {
      event.preventDefault()
      return
    }
    callEventHandler(local.onClick, event)
  }

  const handleMouseDown: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
    if (!isDisabled()) {
      callEventHandler(local.onMouseDown, event)
    }
  }

  const handlePointerDown: JSX.EventHandler<HTMLButtonElement, PointerEvent> = (event) => {
    if (isDisabled()) {
      event.preventDefault()
      return
    }
    callEventHandler(local.onPointerDown, event)
  }

  const handleKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (event) => {
    if (isDisabled()) {
      if (isFocusableWhenDisabled() || isActivationKey(event)) {
        event.preventDefault()
      }
      return
    }
    callEventHandler(local.onKeyDown, event)
  }

  const handleKeyUp: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (event) => {
    if (isDisabled()) {
      if (isFocusableWhenDisabled() || isActivationKey(event)) {
        event.preventDefault()
      }
      return
    }
    callEventHandler(local.onKeyUp, event)
  }

  return (
    <button
      aria-disabled={isDisabled() || undefined}
      disabled={isDisabled() && !isFocusableWhenDisabled()}
      role={!isNativeButton() ? 'button' : undefined}
      tabIndex={isFocusableWhenDisabled() ? (local.tabIndex ?? 0) : local.tabIndex}
      type={isNativeButton() ? (local.type ?? 'button') : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onMouseDown={handleMouseDown}
      onPointerDown={handlePointerDown}
      {...rest}
    />
  )
}
