# Interactive Nodes — plan

Goal: unify the collision nodes (`GlobalState.nodes`) with the popover render registry into
one node model, replace prop-bag configuration with composition, and make
`collided` / `interacting` a real, reachable state machine.

---

## Part 0 — Where you actually are

Half-migrated. Roughly 60% of commit 1 and 15% of commit 2 is in the working tree.

### Done

| Piece | State |
|---|---|
| `global.d.ts` | `InteractiveNode` union with `data` per type, `InteractiveNodeStatus`, `NodeSlots`, `nodes: Map`, `registerSlot`/`unregisterSlot`, `JSX` + `Store` imports |
| `Asset.tsx` | **complete** — non-throwing `useContext(InteractiveNodeContext)`, `nodeId` dropped, `node?.node.collided()` |
| `InteractiveNode.context.ts` | **complete** — `InteractiveNodeContext = createContext<{ id; node }>()` + throwing `useInteractiveNode()` |
| `GlobalStateProvider.tsx` | `nodes = new Map()`, `nodeSlots` store, both slot fns in context value |
| `Scene.tsx` | mounted `InteractiveNode.PopoverPortal` + `MarkersContainer` |
| `EventMarker.tsx` | split into `Root` / `Pill` / `PreloadRoute`, `node.collided()` |
| Files | `SceneryPopover.tsx` + `SceneryPopoverContext.ts` deleted, `-createSceneNode.ts` → `-createInteractiveNode.ts`, `ui/dialog.tsx` + `ui/carousel.tsx` added |

### Broken right now (tree doesn't compile)

| File | Problem |
|---|---|
| `global.d.ts:81,83` | `Extract<SceneNode, …>` and `Map<string, SceneNode>` — `SceneNode` no longer exists |
| `-createInteractiveNode.ts:3-8` | generic signature still the old `P extends Omit<D, …>` + `as R` cast form; call sites already pass `(id, data)` |
| `GlobalStateProvider.tsx:166` | `for (const node of nodes)` over a Map — needs `.values()`; `node.markerPosition` → `node.data.markerPosition`; merge the two duplicate `if` blocks |
| `-gameloop.ts:90,92` | `for (const node of nodes)`, `node.collided.value`, `.set()` → `.values()`, `node.setCollided(nodeCollided)` |
| `OtherPlayer.tsx:14-19,36-67` | passes object as first arg, then the old `createRenderEffect` still calls `nodes.add(sceneNode)` — delete that whole block |
| `InteractiveNode.tsx:16-64` | `Provider` body still references the deleted `registry` / `SceneryPopoverState` / `SceneryPopoverContext` / `lastActive` / `register` |
| `InteractiveNode.tsx:169-181` | `Root` takes the old prop bag, calls `createInteractiveNode({ type })` with no id, returns `null` |
| `InteractiveNode.tsx:194` | `Asset` slot renders `<Asset>` but the import is `type { AssetProps }` only — needs the value import |
| `button.tsx:3,75` | `useSceneryPopoverNode` from `InteractiveNode.context` — symbol renamed; also `node.collided.get()` → `node.collided()` |
| `EventMarker.tsx:7,16,50,63` | same import rename, ×4 |
| `main/-scenery.tsx:26-34,43-54` | 9 of 11 popovers commented out; `Intro` still on the old prop API |
| `OtherPlayer.tsx:124` | renders `InteractButton` with no node context above it — `useInteractiveNode()` throws there today |

---

## Part 1 — The mental models

### Model 1: one registry, not two

`GlobalState.nodes` (collision participants) and the old popover registry (render
participants) were the same objects with the same lifecycle and the same key.

> **The rule:** anything a node needs that outlives the component that declared it lives on
> the node. Anything renderable is a slot. Both are registered once, by the thing that owns
> them, and self-clean.

### Model 2: a node is a *value* the whole system can hold

Not a component's internal state. `nodes.get(id)` from anywhere — the game loop, the
backdrop, a sibling popover, a player. That's why `id` is a parameter of the factory, not a
prop of a component.

### Model 3: two questions, two registries

- **Am I touching this?** → `nodes` (Map, non-reactive, 60fps reads)
- **Do I need to draw it?** → `nodeSlots` (store, reactive, render-driven)

Same key, completely different read frequency. Don't merge them.

### Model 4: three signals, three writers, zero overlap

| Signal | Written by | Read by |
|---|---|---|
| `hitbox` | `calculate()` (per type) | game loop |
| `collided` | **game loop only** | everything visual |
| `status: 'idle' \| 'interacting'` | **the flow only** | backdrop tint |

No setter does two jobs. That's why `setCollided` no longer calls `setActive` — an effect
on the signal does it instead, so it fires on change only.

### Model 5: collision ≠ engagement ≠ flow

- **collided** — geometry. "your hitbox overlaps"
- **interacting** — a flow is running. Movement locked, player state untouched, backdrop darker
- **`E` keydown** — keycap animation + sound *only*. Never a state change
- **`E` keyup** — the actual confirm. This is what starts a flow

### Model 6: flows read/write global state, never node-local

The wardrobe shows your current head because it reads `player.hat` — not a local
`const [picking, setPicking]` that dies on unmount. Multi-step guides write
`interaction.step`. That's why no `node.data.flow` exists.

### Model 7: one flow at a time, anywhere

`interaction.flow` is a singleton `{ nodeId, id }`. Popovers and players use the same
machinery — a player's `talk` flow is a flow like any other.

### Model 8: registration vs rendering never mix

Slot components **register and return `null`**. Rendering happens in the layers, via
`<Dynamic>`, exactly as it does today. The architecture is not changing — only the API that
fills it in. This is why commit 1 can be "no rendering change".

---

## Part 2 — What registers what

```
GlobalStateProvider                    ← creates + owns everything below
├─ nodes: Map<string, InteractiveNode>      non-reactive
├─ nodeSlots: Store<Record<id, NodeSlots>>  reactive
├─ registerSlot(id, slot, fn) / unregisterSlot(id, slot)
├─ popover: { activeNodeId, prevActiveNodeId, setActiveNode }   ← which popover is open
├─ interaction: { flow, step, isFlowActive, start, finish, setStep }  ← which flow runs
└─ popup: { ref }

<InteractiveNode.Popover id>     → createInteractiveNode(id, 'popover', data)
│                                    + <InteractiveNodeContext.Provider> around children
├─ <Anchor position side align>    → node.data.anchorPosition/positioner; slot 'anchor'
├─ <Asset …AssetProps>              → slot 'asset'                        (id only)
├─ <Marker position>                → node.data.markerPosition + markerRef; slot 'marker'
│   └─ <EventMarker.Pill …>        → renders in the markers layer
├─ <Content>…</Content>             → slot 'content' → info popover
└─ <Interaction id="wardrobe">     → slot 'interaction'['wardrobe'] → flow dialog
```

**Why `popover` and `interaction` are separate singletons.** They are independent: a flow is
meant to *outlive* the popover closing (movement is locked, so collision can't end, but the
popover should still be able to hide). Keeping `activeNodeId` out of the flow struct means
closing a popover can't accidentally clear a running flow, and the two get entangled in
nobody's head.

### Two providers, two different jobs

This is the part that trips people up:

| Provider | Job | Serves |
|---|---|---|
| In `Popover`, around `{props.children}` | **setup-time** identity | slot components self-identify while registering |
| In each render loop, around `<Dynamic>` | **render-time** identity | `Asset`, `EventMarker.*`, `InteractButton`, your content |

The second exists because a slot's `component()` is invoked by `MarkersContainer` /
`PopoverLayer` — different subtrees, near `Scene.Background`. Context does not travel to
where a render function is *called*. That is why the OG code re-wrapped inside
`content.component()` and `marker.component()`.

```tsx
<For each={markers()}>
  {(entry) => (
    <InteractiveNodeContext.Provider value={entry}>
      <Dynamic component={entry.component} />
    </InteractiveNodeContext.Provider>
  )}
</For>
```

Three wrap sites total (markers, anchors, content), driven by the node the registry entry
already carries. Slot components wrap nothing themselves.

**Verify assumption before building on it:** put `console.log(useInteractiveNode())` in a
slot component. Solid evaluates `props.children` lazily inside the component body, so the
root provider should reach it — this is a load-bearing assumption for the whole design, and
it takes 5 minutes to confirm.

### What each consumer destructures

| Consumer | Takes |
|---|---|
| `.Anchor` | `{ id, node }` — writes `anchorPosition`, `positioner`, `anchorRef` |
| `.Marker` | `{ id, node }` — writes `markerPosition`, `markerRef` |
| `.Asset` | `{ id }` — pure render wrapper, writes nothing |
| `.Content` | `{ id }` |
| `.Interaction` | `{ id, node }` |
| `Asset`, `EventMarker.*`, `InteractButton` | `{ node }` — and **non-throwing** `useContext`, since all three render outside a node |

One context, not two. `{ id, node }` in a single value beats an id-only context plus a node
context: two providers at every boundary, plus a moment where one is set and the other isn't.
`.Asset` taking only `id` is not a special case — it's what a slot that only *publishes*
needs. `useInteractiveNode().id` is one extra destructure for everyone else, and the
invariant comes free.

---

## Part 3 — Types

Already in `global.d.ts`, with two stragglers to fix (Part 0):

```ts
type InteractiveNodeStatus = 'idle' | 'interacting'

type InteractiveNode = InteractiveNodeBase &
  (
    | { type: 'popover'; data: {
        anchorRef?: HTMLElement
        anchorPosition?: Coords
        markerPosition: Coords
        positioner: Pick<PopoverPrimitive.Positioner.Props, 'side' | 'align'>
        popupRef?: HTMLElement
    } }
    | { type: 'player'; data: Record<string, never> }
  )

type PopoverNode = Extract<InteractiveNode, { type: 'popover' }>

interface NodeSlots {
  anchor?: () => JSX.Element
  marker?: () => JSX.Element
  asset?: () => JSX.Element
  content?: () => JSX.Element
  interaction?: Record<string, () => JSX.Element>
}
```

`node.data` only exists *after* `node.type === 'popover'` narrows. The collision loop
structurally cannot reach it.

### The three registry functions — all id-keyed, no nulls

```ts
registerSlot(id: string, slot: keyof NodeSlots, component: () => JSX.Element): void
unregisterSlot(id: string, slot: keyof NodeSlots): void
nodes: Map<string, InteractiveNode>
```

**There is no null slot.** Absence in a `Partial` record *is* absence — adding
`registerSlot(id, 'anchor', null)` would create a second way to say "nothing" that every
reader then has to handle, which is the exact bug class `NodeAction.value` was. Conditional
slots are handled at the call site with `<Show when={…}>`: the component either runs and
registers, or never runs.

`unregisterSlot` is needed because slots must disappear on unmount, otherwise a re-mounted
scene accumulates dead entries. Have all four slot components call it in `onCleanup`
uniformly rather than making readers wonder which do.

### GlobalState additions still to write

```ts
popover: {
  activeNodeId: Accessor<string | undefined>       // collided → info popover opens
  prevActiveNodeId: Accessor<string | undefined>   // the outgoing node, for the exit animation
  setActiveNode(id: string | undefined): void
}
interaction: {
  flow: Accessor<{ nodeId: string; id: string } | undefined>  // singleton → locks movement
  step: Accessor<number>                                         // multi-step guide progress
  isFlowActive: Accessor<boolean>
  start(id: string): void    // → node.status 'interacting'
  finish(): void             // → node.status 'idle'
  setStep(n: number): void
}
popup: { ref?: HTMLElement }
```

### `prevActiveNodeId` is not derivable — keep it

`keepMounted` keeps the Popup in the DOM during close, so something must keep feeding it
content + `side`/`align` after `collided` goes false, or the arrow jumps and the text blanks
mid-fade. That's the OG `currentlyRenderedElement = active() ?? lastActive()`
(`InteractiveNode.tsx:73`). Once `activeNodeId()` is `undefined` the outgoing id is
unreachable from anywhere else, so it needs its own signal.

The rotation is unchanged from what you already wrote
(`InteractiveNode.tsx:29-34`) — only the home changes:

```ts
function setActiveNode(id: string | undefined) {
  batch(() => {
    setPrevActiveNodeId(activeNodeId())
    setActiveNode(id)
  })
}
```

Reading it back in the layer — note the `type === 'popover'` narrowing, which matters once
players participate and `activeNodeId` can point at a node with no popover `data`:

```tsx
const rendered = createMemo(() => {
  const id = popover.activeNodeId() ?? popover.prevActiveNodeId()
  const n = id ? nodes.get(id) : undefined
  return n?.type === 'popover' ? n : undefined
})
const open = createMemo(() => popover.activeNodeId() !== undefined)
```

### Delete list

`NodeAction` (done) · `SceneNode*` names → `InteractiveNode*` · `scene.popupContainerRef` ·
`contentRef` `assetRef` `portalRef` `positionerRef` `backdropRef` · `useSceneryPopover` ·
`isOpen` · `getNode` from the popover context.

---

## Part 4 — Two roots, different primitives

| | Info popover | Flow dialog |
|---|---|---|
| Primitive | `PopoverPrimitive.Root` | `DialogPrimitive.Root modal` (`ui/dialog.tsx`, already added) |
| Renders | `nodeSlots.content` | `nodeSlots.interaction[flow.id]` |
| Position | `<Positioner anchor side align>` from `node.data.positioner` | centered |
| Opens on | `node.collided` | `flow != null` |
| Arrow | yes | no |

Base UI's `dialog` has **no** `Positioner` part (only Root/Trigger/Portal/Backdrop/Popup/
Close/Title/Description), which is exactly why it centers for free. `Popover.Root` takes
`modal?: boolean | 'trap-focus'` too, so if you'd rather anchor the flow, that's available —
but centered is what you chose.

`<Dialog.Popup>` reuses today's popover classes so the wardrobe looks like the popovers.
`<Dialog.Backdrop>` gets the two tints from `status`.

---

## Part 5 — Commit 1 (~45 min, no rendering change)

Get the tree compiling and `status` real. No slots, no providers, no visuals.

1. **`global.d.ts`** — fix the two `SceneNode` stragglers; add `anchorRef` / `popupRef` to the popover `data`; **remove `rootRef` from the base and replace it with `markerRef` in the popover `data`**. Nothing reads `rootRef` for a player, and keeping it on the base leaks DOM access into the collision loop's type surface. `calculate()` becomes `node.data.markerRef`; `OtherPlayer` loses ~10 lines of dead getter. If players ever need to decorate their hitbox, add `bodyRef` to the player `data` then.
2. **`-createInteractiveNode.ts`** — replace the cast-based generic with the keyed one:
   ```ts
   export function createInteractiveNode<K extends InteractiveNode['type']>(
     id: string, type: K, data: InteractiveNodeOf<K>['data'],
   ): InteractiveNodeOf<K> {
     const { nodes } = useGlobalState()
     const [collided, setCollided] = createSignal(false)
     const [status, setStatus] = createSignal<InteractiveNodeStatus>('idle')
     const node = { type, data, size: {...}, hitbox: {...}, collided, setCollided, status, setStatus }
     nodes.set(id, node)
     onCleanup(() => nodes.delete(id))     // owner = the calling component
     return node
   }
   ```
   It's a **hook**, not a constructor: `useGlobalState()` + `onCleanup()` both need an owner, so call it synchronously in a component body.
3. **`GlobalStateProvider.tsx`** — `calculate()` iterates `nodes.values()`, reads `node.data.markerPosition` + `node.data.markerRef`, merges the two duplicate `if (node.type === 'popover')` blocks. Add `popover` + `interaction` + `popup` to the context value. Gate every movement hotkey (`A`/`D`/`Shift+A`/`Shift+D` + arrows) with `get enabled() { return !isFlowActive() }`.
4. **`-gameloop.ts`** — `.values()`, `node.setCollided(collisionDetected(…))`, and `if (isFlowActive()) return` at the top of `movePlayerAndCamera` and `sampling`. Deliberately **no** `player.direction = 0` — player state stays untouched per your decision.
5. **`OtherPlayer.tsx`** — delete the `createRenderEffect` block entirely, `createInteractiveNode(props.id, 'player', {})`.
6. **`button.tsx` + `EventMarker.tsx`** — import `useInteractiveNode` from `./InteractiveNode.context`, switch `.collided.get()` → `.collided()`. Make `button.tsx` non-throwing (`OtherPlayer.tsx:124` renders `InteractButton` with no node above it).

## Part 6 — Commit 2 (~55 min)

7. **`InteractiveNode.context.ts`** — add a non-throwing variant alongside the throwing one:
   ```ts
   export const InteractiveNodeContext = createContext<{ id: string; node: InteractiveNode }>()
   export function useInteractiveNode()        { /* throws */ }
   export function useInteractiveNodeContext() { return useContext(InteractiveNodeContext) }
   ```
   Two exports, not one flag — the throwing version documents intent at the ~4 call sites that require a node.
8. **`InteractiveNode.tsx`** — the rewrite, final naming set:

   | Symbol | Kind | Mounts in |
   |---|---|---|
   | `InteractiveNode.Popover` | per-node component (was `Root`) | your scenery files |
   | `InteractiveNode.PopoverLayer` | scene-wide host (was `PopoverPortal`) | `Scene.Background` |
   | `InteractiveNode.MarkersContainer` | scene-wide host | `Scene.Players` |
   | `InteractiveNode.InteractionLayer` | scene-wide host (new) | `Scene.Elements` or `Background` |
   | `InteractiveNode.Backdrop` | private helper | — |

   Not `PopoverProvider`: in Solid `Provider` is a precise term (a `createContext` host), and after this refactor your component provides no Solid context — `PopoverPrimitive.Root` does, and yours just hosts it. `Layer` matches the existing `MarkersContainer` and gives you the symmetric `PopoverLayer` / `InteractionLayer` pair.

   **`Provider` is deleted outright.** `route.tsx:23` drops the wrapper; `PopoverPrimitive.Root` moves inside `PopoverLayer`, directly above the Triggers, Portal, Positioner, Popup and Backdrop it controls — all of which that component already renders. Nothing outside it consumes Popover context, so this is safe. It breaks only if a future Trigger needs to render outside `PopoverLayer`; Triggers are slots, always rendered by that loop, so nothing today hits it, and lifting Root back out is cheap.

   Work items:
   - `PopoverLayer` — owns `<PopoverPrimitive.Root open={open()}>`, the `rendered`/`open` memos, both slot loops
   - `Popover` — `createInteractiveNode(id, 'popover', { markerPosition: { x: 0, y: 0 }, positioner: {} })`, wraps `{props.children}` in the context, one effect `on(node.collided, c => popover.setActiveNode(c ? id : undefined))`
   - `.Anchor` / `.Asset` / `.Marker` / `.Content` / `.Interaction` — write `node.data.*`, `registerSlot(id, …)`, `onCleanup(() => unregisterSlot(id, …))`, return `null`. `.Marker` needs `position` and a `ref` that sets `node.data.markerRef`
   - Both loops wrap each `<Dynamic>` in `InteractiveNodeContext.Provider`
   - `Backdrop` — `data-variant` from `status`: `node.status() === 'interacting'` → opacity-50, `collided` → opacity-30. **First time `engaged` is reachable** (`setStatus` has no callers today). Note the current code still reads the old object form `status.get().type === 'in-progress'`
   - `InteractionLayer` — `<Dialog.Root modal dismissible={false}>`, renders `nodeSlots.interaction[flow.id]`

   **Mount asymmetry to comment, not "fix":** `PopoverLayer` in `Scene.Background` (`Scene.tsx:55`) but `MarkersContainer` in `Scene.Players` (`Scene.tsx:109`). Deliberate — the popover sits behind the players, the markers in front.
9. **`ui/dialog.tsx`** — verify `DialogOverlay`/`DialogContent` accept the scenery classes.

## Part 7 — Commit 3 (~30 min)

10. **4 consumer files** → composition form:
```tsx
<InteractiveNode.Popover id="wardrobe">
  <InteractiveNode.Popover.Anchor position={{ x: 30, y: 34 }} side="top" />
  <InteractiveNode.Popover.Asset routeId="/_authed/main/" asset="building_3.png" x={24.73} y={-0.1} scale={SCALE} />
  <InteractiveNode.Popover.Marker position={{ x: 29.5, y: 94 }}>
    <EventMarker.Pill label="Explore" offsetX={-2} offsetY={-28.2} onInteract={() => start('wardrobe')} />
    <EventMarker.PreloadRoute route="tour" />
  </InteractiveNode.Popover.Marker>
  <InteractiveNode.Popover.Interaction id="wardrobe">{/* reads player.hat, W/A/S/D flips, finish() on confirm/cancel */}</InteractiveNode.Popover.Interaction>
  <InteractiveNode.Popover.Content>
    <PopoverHeader><PopoverTitle>Wardrobe</PopoverTitle></PopoverHeader>
    <PopoverDescription>You can change your clothes here – free of charge!</PopoverDescription>
  </InteractiveNode.Popover.Content>
</InteractiveNode.Popover>
```
Props that disappear: `marker`, `anchor`, `asset`, `children`, `openOnInteraction`, and the top-level `side`/`align` (moved to `.Anchor`). Delete `const [picking, setPicking]` (`main/-scenery.tsx:151`) and `function qwe()` (`:174`).

## Part 8 — Separate work (~60–90 min)

The wardrobe flow UI itself: reads `player.hat`, W/A/S/D to flip skins/heads, confirm/cancel calls `finish()`. `ui/carousel.tsx` is already in the tree for this.

---

## Part 9 — Watch for

1. **Arrow keys during a flow.** `Dialog` traps focus. You already disable global A/D, so the flow owns the keys — but `FloatingFocusManager` may still swallow arrows for navigation. Decide which.
2. **`dismissible={false}`** on the flow dialog, or clicking the backdrop ends the flow and you re-press E.
3. **Focus return.** `finish()` returns focus to the trigger (base-ui default `returnFocus`). Confirm it doesn't scroll the scene viewport.
4. **Refs aren't reactive.** `node.data.anchorRef` is a plain field written from a `ref` callback. The `Positioner` memo must be keyed on reactive state (`popover.activeNodeId`) or it never re-runs.
5. **Nested assets gain `data-open`.** `Experience` nests `sign.png` inside `intro.png`. Today the inner one has no `nodeId` and uses `group-data-open:` from the parent. With context inheritance it *will* get `data-open` → `z-index: 0` + a mustard drop-shadow (`scenery.css:43-54`). Probably invisible (equal z-index still stacks by DOM order). Try it, and only add an explicit `inert` opt-out if you see a difference.
6. **`data-open={undefined}`** omits the attribute entirely, so standalone `Asset` (no node context) behaves exactly as it does today.

## Open questions

1. `data-slot="scenery"` on the popover — rename to `interactive` now that players share it, or leave until the player popover lands?
2. `interaction.step` is a bare `number`. Fine, or `{ id, index }[]` history so a guide can resume mid-flow after a scene change?
