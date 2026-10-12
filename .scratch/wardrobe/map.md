# Map: Wardrobe 1 done

## Destination

Wardrobe 1 shippable: skins (`default` + `dyno`) × Heads (15, `admin` excluded), any skin × any Head. Carousel UI finished (two rows + live hog preview + selection highlight + controls). Click previews instantly on the hog; Confirm persists both to Convex; Discard reverts. Dirty preview blocks exit; refresh auto-discards.

## Notes

- You build all code. Agents brainstorm, debug, and explain only — no code generation, no copy/audio work.
- Research is done by you; agents research only if explicitly asked.
- Art comes from open-source PostHog Figma files. Small launch set; all combos valid.
- Skin + Head persist together, Convex-backed. Preview never persists silently; explicit Confirm is the only write path.
- Wardrobe 2 ("how this site was built") is a separate scene, not this effort.

## Decisions so far

- [Wardrobe scope](issues/01-scope.md): wardrobe 1 only; wardrobe 2 parked as its own scene.
- [Preview + confirm/discard](issues/02-behavior.md): click = instant preview (no save); Confirm writes Convex; Discard reverts to pre-preview combo.
- [Dirty exit](issues/03-behavior.md): dirty preview blocks dialog exit with unsaved-changes prompt; refresh auto-discards.
- [Persistence](issues/04-persist.md): Convex-backed (not local-only), skin + hat together.
- [Launch skins](issues/05-skins.md): `default` + `dyno`; `ghost` parked until its frames exist.
- [Launch set size](issues/06-set.md): small set, any skin × any Head.
- [Completion logic]: merged into the ending-marker ticket (parked, non-wardrobe effort).

## Your build checklist

1. **Skins data + row**: `SKINS = [default, dyno]`; add skin signal alongside `hat` (`GlobalStateProvider.tsx:104` has hat only); second carousel row; combined preview renders hat on hog on skin (player.css already layers `.hat` under `player-idle`/`player-walk`).
2. **Selection**: click previews instantly; highlight selected cell in both rows; render prev/next controls (carousel supports them, wardrobe dialog doesn't use them today).
3. **Preview area**: live hog with current preview combo; Confirm/Discard pinned below it.
4. **Dirty guard**: track preview-vs-saved; block dialog close on dirty (hook `Dialog onOpenChange`, escape handling currently commented out); never write on unload.
5. **Convex**: add skin+hat fields (your call: `game_user_state` vs users table — schema has neither today); mutation on Confirm; hydrate on load; keep admin-hat override.
6. **Polish**: dialog readable over bright scenery via existing glass/popover system.

## Not yet specified (parked fog — other efforts, not this session)

- Dock + routing grillings; intro teaser copy branch pointing at dock; chatbot model/guardrails; MCP tool surface; graffiti local canvas; dance-party grilling; tour stage outlines; ending visited-flag spec; NPC mapping grilling; vibe-coded apps naming; about-me media checklist; voice placement map. LiveKit group voice + AI graffiti filter are stretch fog.

## Out of scope (this effort)

- Wardrobe 2 scene; LiveKit; AI graffiti filter. Return only via a redrawn destination as a fresh effort.
