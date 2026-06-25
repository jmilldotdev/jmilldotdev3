# Agent Notes

- Visual effects must follow the selected palette. Use the `--palette-*` CSS variables, `color-mix()`, or palette-derived values instead of hardcoded neon cyan/orange/blue colors.
- Ambient desktop/login effects should feel slow and atmospheric. Pointer reactions should lag or ease toward the cursor rather than tracking it tightly.
- Before shipping visual atmosphere changes, inspect performance. Avoid large animated `filter: blur()`/CSS gradient stacks; prefer one canvas/WebGL layer or compositor-friendly transforms, and expose a simple FPS/frame-time check when experimenting.
- Keep performance instrumentation hidden from the production UI. In development, make meters opt-in rather than always visible.
