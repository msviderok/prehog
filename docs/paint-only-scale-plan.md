# Strict implementation plan: paint-only scene scale

1. **Separate logical game values from paint values**  
   In `GlobalStateProvider.tsx`, treat world units as the source of truth for player position, hitboxes, marker locations, and camera position. Remove scale-dependent values from gameplay state.

2. **Keep viewport size as an input, not a game unit**  
   In `GlobalStateProvider.tsx`, convert viewport width/height into the amount of logical world currently visible. Continue calculating `--scale` exactly as today.

3. **Move camera calculations to world units**  
   In `-gameloop.ts`, calculate camera bounds, player screen locking, and camera movement using visible world units. Remove scaled-pixel conversions from camera logic.

4. **Move movement and collision fully to world units**  
   In `-gameloop.ts`, make movement speed, per-frame distance, player positions, remote-player interpolation, and collision checks independent of `--scale`.

5. **Create one scene paint boundary**  
   In the scene component/styles, add an outer viewport layer responsible for clipping and current vertical placement, plus an inner scene layer responsible for `transform: scale(var(--scale))`.

6. **Stop manually scaling scene elements**  
   In `index.css`, `scenery.css`, and `player.css`, remove `--scale` from individual asset sizes, player dimensions, offsets, hitboxes, marker sizes, sprite frames, font sizes, and border widths. Keep their values in original scene dimensions.

7. **Keep all scene UI inside the transformed layer**  
   Ensure scene-related popovers, dialogs, text, and borders mount inside the scene popup container. Keep account, navigation, WebRTC, and other app-shell UI outside it.

8. **Convert logical positions only when rendering**  
   At the rendering boundary, translate world-unit positions into unscaled scene pixels. Let the scene transform produce the final scaled browser pixels.

9. **Preserve artwork rendering rules**  
   Keep nearest-neighbor rendering for sprites and scenery. Keep normal browser smoothing for scene text and vector-like UI.

10. **Manually verify behavior**  
    Check scale `1`, capped scale, and fractional scale. Confirm keyboard movement speed, camera behavior, collision positions, scene UI scaling, app UI non-scaling, remote-player placement, cropping, and resize behavior are unchanged except for paint size.
