<div align="center">

# Zedu · Whimsical

**A WebGL and generative-audio reimagining of the Zedu learning platform.**

Part Lusion, part Active Theory, part weavesilk.

[Live demo](https://a-whimsical-zedu.vercel.app) · [Studio](https://a-whimsical-zedu.vercel.app/studio) · [Case study](#case-study)

</div>

---

## Why this exists

Zedu is a real communication platform for bootcamps, schools and cohorts. This project keeps that product's information architecture and copy, then asks a different question: *what if a product site felt like the product — alive, tactile and slightly playful?*

Everything runs in the browser. There is no backend, no auth and no analytics. Chat, calls, files and agents are mocked and persisted to `localStorage`, so the entire experience is deployable as a static front end.

## The two surfaces

| Route | What it is |
| --- | --- |
| `/` | **Stage** — a cursor-painted silk hero, an editorial scroll story, a WebGL journey vortex, glass metric cards and a generative soundscape. |
| `/studio` | **Studio** — the product itself: channels, threads, reactions, a doodle canvas you can send into a channel, and a Buzz call room with presence orbs. |

## Appearance

The site opens in **dark** and remembers whatever you choose.

One button cycles **dark → light → system**, and its icon always shows the current choice while the tooltip names the next one. A small inline script paints the correct theme before React hydrates, so there is no flash of the wrong background.

Light mode is not an inverted copy of dark. The palette becomes lavender paper with ink text, additive canvases switch to `multiply`, and the glows around brand marks soften. Brand highlights that sit on coloured surfaces stay literal white, because they are pigment rather than text.

## Engineering highlights

### WebGL journey vortex

`src/components/vortex-canvas.tsx` renders a GPU particle system with additive blending and framebuffer feedback for motion blur.

- **Trail feedback** — the scene draws into an offscreen framebuffer, which is composited to the default framebuffer and then blended back with `ONE, ONE_MINUS_SRC_ALPHA` on the next frame for smeared trails.
- **Graceful degradation** — software rasterisers, coarse pointers and `prefers-reduced-motion` skip the feedback path and fall back to a direct render, so the site never blocks on a weak GPU.
- **Budget** — 5,500 particles on desktop, 1,600 on mobile, capped device pixel ratio, and the loop stops entirely when the section scrolls out of view or the tab is hidden.

### Generative sound

`src/lib/sound.ts` synthesises everything with the Web Audio API — no audio files are shipped.

- A low drone, a slow four-chord pad, a delay-fed pentatonic arpeggio, air swells and a synthetic convolution reverb.
- A scroll-reactive filter that opens the mix as you travel through the story.
- Sub impacts and rising whooshes on chapter changes; glassy ticks and plucks on hover and click.
- Audio only starts after a real user gesture, and the preference persists across sessions.

### Silk that forgets

`src/components/silk-canvas.tsx` is a symmetrical ribbon renderer with three modes of restraint:

- The landing hero is drawn by the cursor and stays luminous.
- Ambient mode paints on its own, which is how the Buzz fills its background.
- Every strand fades on a timer, so the web never collapses into a single washed-out colour mass. The Buzz asks for a shorter fade and a thinner base stroke than the hero: presence should frame the call, not bury it.

### Motion system

CSS-only where possible, so it stays cheap and respects user settings.

- Glass sheen, morphing border-radius and drifting highlights on the metric, "Why Zedu" and pricing cards.
- Spring-like cubic-bezier reveals via `IntersectionObserver` in `src/components/motion.tsx`.
- Presence orbs are quiet tinted discs in the studio; the full gradient, glow and breathing animation only appear inside the Buzz, where presence is the whole point.
- The Zedu bell swings on its own every few seconds, then rings properly — a quick swing with a pulse on each arc — when you hover or focus it.
- Reactions lift and swell their glyph on hover, pop when pressed, and throw seven copies of the emoji, Telegram-style.
- Reduced-motion users get static gradients instead of canvases and no ambient loops.

## Tech stack

- **Next.js 16** (App Router, Turbopack) with **React 19**
- **TypeScript** in strict mode
- Hand-written **WebGL** (no three.js) and **Web Audio** (no samples)
- Plain **CSS** with custom properties — no UI framework
- **pnpm** · **GitHub Actions** CI · **Vercel** hosting

## Getting started

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000.

```sh
pnpm typecheck   # tsc --noEmit
pnpm build       # production build
pnpm check       # typecheck + build
```

## Deploying

The project is a standard Next.js app. Import the repository into Vercel — no environment variables are required.

## Case study

<details>
<summary><strong>How it was built</strong></summary>

<br />

The build was split into reviewable phases, each landed as its own pull request:

1. **Foundation** — toolchain, design system, CI, patched Next.js.
2. **Landing** — silk canvas, motion primitives, product tour mock, WebGL vortex, generative sound, optimized WebP artwork.
3. **Studio** — seed data, drawers, command palette, doodle composer, Buzz room and the `/studio` route.
4. **Theme** — tokenised ink and text colours, the light palette, the single cycling toggle, and the calm-studio / loud-Buzz split.
5. **Release** — documentation, repository polish and deployment.

Every phase had to pass typecheck and a production build in CI before merge.

**Constraints that shaped the work**

- *Front end only.* No server, so all state lives in `localStorage` and every interaction had to be convincing without a network.
- *Keep the real IA.* The whimsy had to sit on top of Zedu's actual structure rather than replace it.
- *Performance is part of the aesthetic.* Jank breaks the illusion faster than any missing effect, so the vortex, the sound and the card motion all have explicit budgets and fallbacks.
- *Two themes, one design.* Every effect that looked right on near-black had to be re-judged on paper rather than inverted, which is why the light palette, the blend modes and the orb treatment were tuned separately.

**What I would do next**

- Persist studio state to IndexedDB so doodles survive larger histories.
- Extract the vortex into a small reusable package.
- Add Playwright visual regression tests for the landing sections and both themes.

</details>

## Project structure

```
src/
├─ app/
│  ├─ page.tsx              # Stage: landing story
│  ├─ globals.css           # Design system, both themes, all motion CSS
│  └─ studio/page.tsx       # Studio route
├─ components/
│  ├─ theme.tsx             # Theme provider, bootstrap script, toggle
│  ├─ vortex-canvas.tsx     # WebGL journey vortex
│  ├─ silk-canvas.tsx       # Cursor-painted and ambient ribbons
│  ├─ motion.tsx            # Reveal, tilt, magnet, count-up
│  ├─ logo.tsx              # The Zedu bell
│  ├─ studio-app.tsx        # Studio shell
│  ├─ buzz-room.tsx         # Presence orbs call room
│  ├─ command-palette.tsx   # ⌘K palette
│  └─ doodle-modal.tsx      # Draw and send a doodle
└─ lib/
   ├─ sound.ts              # Generative audio engine
   ├─ data.ts               # Seed channels, members, messages
   └─ utils.ts              # Helpers
```

## Accessibility

- Full keyboard reachability, focus-visible rings and a `⌘K` command palette.
- `prefers-reduced-motion` disables canvases, ambient audio loops and card wriggle.
- Semantic landmarks, labelled controls and `aria-live` regions for chat updates.
- The theme toggle announces its current state and what the next click will do.

## License

[MIT](./LICENSE) © AbdulJaleel AbdulSamad

The Zedu brand, copy and product screenshots belong to Zedu and are used here as part of an unaffiliated concept prototype.
