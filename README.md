<<<<<<< HEAD
# Happy Birthday — A Private Cinematic Experience

A premium, scroll-driven 3D birthday experience built with React, TypeScript,
Three.js / React Three Fiber, GSAP ScrollTrigger, Framer Motion and Tailwind
CSS. One continuous camera journey through three scenes:

**THE GIFT → THE WISH → THE REVEAL**

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

Production build:

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

`npm run build` runs a full TypeScript project build (`tsc -b`) before
bundling, so any type error will fail the build.

## Personalize it

Everything person-specific lives in **`src/config/birthday.ts`**:

```ts
export const birthdayConfig: BirthdayConfig = {
  name: "Aanya",
  message1: "Today isn't just another day.",
  message2: "It's your day.",
  signoff: "Made just for you.",
  candleCount: 5,
};
```

Change `name` and the copy — the hero name, the final reveal, the
personalized message and the closing line all update automatically.
Nothing else in the codebase hard-codes the name.

## How the scroll timeline works

There's a single scroll-driven timeline from `0` to `1`, owned by
`src/store/experienceStore.ts` and fed by one `ScrollTrigger` in `App.tsx`.
It's carved into three scene windows with short overlapping transition
windows in between (defined in `src/animations/*Timeline.ts`):

| Range         | Scene                                    |
| ------------- | ----------------------------------------- |
| `0.00 – 0.34` | Scene 01 — The Gift                        |
| `0.30 – 0.38` | transition: camera travels into the box     |
| `0.34 – 0.67` | Scene 02 — The Wish                          |
| `0.63 – 0.70` | transition: camera drifts into darkness       |
| `0.67 – 1.00` | Scene 03 — The Reveal                          |

Three.js components (`components/three/*`) never read scroll progress
directly for continuous animation — that work happens in `useFrame` inside
`components/scenes/*`, which read `experienceStore.progress` every frame and
imperatively drive refs (no per-frame React re-renders, for performance).
The DOM overlay (`components/ui/NarrativeOverlay.tsx`) subscribes reactively
via `useSyncExternalStore` instead, since text fades don't need 60fps
precision.

`components/three/CinematicCamera.tsx` is the **only** thing that ever
writes to the camera, so there's a single source of truth for its position,
FOV and look target across the whole journey.

## Interactions

- **Gift** — reacts to scroll (approach → rotate → shake → ribbon unwraps →
  lid opens → light + ember burst) and to mouse movement (subtle parallax).
- **Candles** — light in sequence as you scroll through Scene 02. Tap/click
  a flame to blow it out, or grant microphone access and blow into your
  mic (`src/audio/MicBlowDetector.ts`) — it extinguishes the next lit candle
  on a sustained volume spike. If you scroll almost to the end of the scene
  without extinguishing every candle, they're gently blown out for you so
  no one gets stuck.
- **Sound** — a fully synthesized ambient pad + ignite/extinguish/whoosh
  cues via the Web Audio API (`src/audio/AudioManager.ts`). No external
  audio files are bundled — swap in licensed recordings there if you have
  them for a real production deploy.

## Accessibility & resilience

- Respects `prefers-reduced-motion`: gentler scroll scrub, camera parallax
  disabled, simpler transitions (`src/hooks/useReducedMotion.ts`).
- Falls back to a static, still-personalized message
  (`src/components/ui/WebGLFallback.tsx`) if WebGL isn't available.
- Every interaction (candles, mic) degrades gracefully if permissions are
  denied or a browser API is missing.
- Reduced particle counts, DPR cap and simpler antialiasing on narrow
  viewports (`isMobile` checks throughout).

## Project structure

```text
src/
├── components/
│   ├── scenes/    # GiftScene, WishScene, RevealScene — own the timeline per scene
│   ├── three/     # Presentational 3D pieces (GiftBox, BirthdayCake, Candles,
│   │               # Particles, CinematicCamera, Lighting)
│   └── ui/        # LoadingScreen, ProgressIndicator, SoundControl,
│                   # NarrativeOverlay, WebGLFallback
├── animations/    # Pure functions mapping scroll progress -> animation values
├── audio/         # AudioManager (synthesized SFX/ambience), MicBlowDetector
├── config/        # birthday.ts — the personalization config
├── hooks/         # useScrollProgress, useReducedMotion, useMousePosition
├── store/         # experienceStore — shared scroll/candle/audio state
├── utils/         # math helpers, canvas glow textures, WebGL detection
├── App.tsx
├── main.tsx
└── index.css
```

## Notes on scope

Post-processing (bloom / depth of field) is approximated with emissive
materials, additive-blended sprites and CSS text glow rather than a real
`EffectComposer` pipeline, to keep the dependency footprint small — add
`postprocessing` or `@react-three/postprocessing` if you want true bloom.
=======
# birthday
>>>>>>> 8e245af90ec6a6d2e29d19b625ad2f90e81db81d
