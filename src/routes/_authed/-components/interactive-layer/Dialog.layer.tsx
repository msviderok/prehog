import { Dialog as DialogPrimitive } from '@msviderok/base-ui-solid/dialog'
import { cn } from 'cn'
import { createMemo, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useGlobalState } from '../GlobalStateContext'
import { useSceneContext } from '../Scene.context'

export function DialogLayer() {
  const { scene, gameState, dialog } = useGlobalState()
  const sceneName = useSceneContext()
  const content = createMemo(() => {
    const id = dialog.activeNodeId()
    return id ? gameState.scene(sceneName).nodes.slots[id]?.dialogContent : undefined
  })

  return (
    <>
      <DialogPrimitive.Backdrop
        data-slot="dialog-overlay"
        class={cn(
          'fixed inset-0 isolate z-2 bg-glass-ph-dark-cornflower-blue/50 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        )}
      />

      <DialogPrimitive.Portal keepMounted container={scene.viewportRef()}>
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          class={cn(
            'grid duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 border-2 border-red-500',
          )}
        >
          <Show when={content()}>{(c) => <Dynamic component={c()} />}</Show>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </>
  )
}
