# mu_helper_buttons

Ours: two HUD buttons for the MU Helper, top right under the minimap slot and the event timers (`events/eventTimers.tsx`), so it moves down with their rows. Start / Stop calls
`MuHelper.toggleMuHelper()` (the Home key) and Settings `toggleMuHelperWindow()` (the End key).
Shown only in the world, and only while the `mu_helper` module is on (`module:` in `window.ts`).
