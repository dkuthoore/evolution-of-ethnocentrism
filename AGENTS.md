# AGENTS.md — Guidelines for AI Agents and Developers

This document captures the architectural decisions, best practices, and constraints of the Evolution of Ethnocentrism project. **Follow these guidelines when extending or modifying this codebase.** Violating them has historically caused bugs, performance regressions, or deviations from the academic model.

---

## 1. Project Overview

This is an interactive web simulation of the Hammond & Axelrod (2006) paper *"The Evolution of Ethnocentrism"*. It uses:

- **React + TypeScript** (Vite)
- **HTML5 Canvas** for the 2D grid (not DOM elements)
- **Refs** for high-frequency simulation state (not React state)
- **Throttled state updates** for dashboard stats

The simulation model is **strictly defined** by the paper's appendix. Do not change the core logic without verifying against the paper.

---

## 2. Architecture

### 2.1 File Structure

```
src/
├── lib/           # Pure logic, no React
│   ├── engine.ts      # SimulationEngine, Agent, grid logic
│   ├── constants.ts   # All magic numbers, params, types
│   ├── renderer.ts    # Canvas 2D drawing
│   ├── pipRenderer.ts # Pip character drawing
│   ├── particles.ts   # Particle effects
│   └── *.test.ts      # Unit tests
├── hooks/
│   └── useSimulation.ts  # React hook wrapping engine + render loop
├── components/     # React UI
│   ├── stages/     # Stage-specific content
│   └── *.tsx
├── App.tsx
└── main.tsx
```

- **`lib/`**: Framework-agnostic. No `import` from React. Testable in isolation.
- **`hooks/`**: Bridges React and the engine. Holds refs, manages rAF loop.
- **`components/`**: Presentational. Derives UI from hook state.

### 2.2 Data Flow

```
User Action → Component → useSimulation (hook) → engineRef.current (ref)
                                      ↓
                              requestAnimationFrame loop
                                      ↓
                              engine.tick() → drawGrid() → maybeUpdateStats()
                                      ↓
                              setStats/setGeneration (throttled)
```

- The **grid** and **engine** live in `useRef`. Never put them in `useState`.
- React state is only for: `isRunning`, `stats`, `generation`, `speedIndex`, `history`. These update at most ~12 times per second (throttled).

---

## 3. Simulation Engine Rules (Paper Compliance)

### 3.1 Parameters (Must Match Paper Appendix)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Cost | 0.01 | PTR drop when donating |
| Benefit | 0.03 | PTR rise when receiving |
| BasePTR | 0.12 | Reset each tick |
| MutationRate | 0.005 | 0.5% per trait (paper says 0.5%; appendix typo may say 0.05) |
| DeathRate | 0.10 | Per agent per tick |
| ImmigrationRate | 1 | Agent per tick if space exists |

All parameters live in `constants.ts`. **Do not hardcode** values in the engine or components.

### 3.2 Agent Structure

```ts
interface Agent {
  tag: number;   // 0–3 (color)
  ig: number;   // 0|1 In-Group (1=Cooperate)
  og: number;   // 0|1 Out-Group (1=Cooperate)
  ptr: number;  // Potential to Reproduce (float)
}
```

- Minimal fields only. No extra properties for rendering.
- Phenotype is **derived**: `getPhenotype(agent)` → `'ethnocentric' | 'altruist' | 'egoist' | 'traitor'`.

### 3.3 Grid: Flat 1D Array, Toroidal

- Use a **flat 1D array** `grid[i]`, not `grid[y][x]`. Cache-friendly.
- Toroidal: edges wrap. **JavaScript modulo bug**: `-1 % 50 === -1`. Use:
  ```ts
  const wrappedX = ((x % gridW) + gridW) % gridW;
  const wrappedY = ((y % gridH) + gridH) % gridH;
  ```

### 3.4 Tick Order (4 Phases, Strict)

1. **Immigration** — Add up to `IMMIGRATION_RATE` agents at random empty sites.
2. **Interaction** — Reset all PTR to BasePTR. For each agent and each neighbor: if Cooperate, apply Cost/Benefit. Symmetric: both A→N and N→A.
3. **Reproduction** — Fisher-Yates shuffle list of occupied indices. For each: if `random() < ptr`, clone to random empty neighbor. Mutate each trait independently at MutationRate.
4. **Death** — Each agent: if `random() < DeathRate`, remove.

**Critical**: Fisher-Yates shuffle is required. Iterating top-to-bottom without shuffle causes directional bias (agents migrate downward).

### 3.5 Neighbor Lookup

- **Precompute** a neighbor table at init. Do not allocate arrays per cell per tick.
- Von Neumann: 4 neighbors (up, down, left, right).

### 3.6 Scenario Modes

- **Standard**: Random mutation. Agents evolve freely.
- **Clash**: Tag → Strategy mapping. Tag 0=Ethnocentric, 1=Altruist, 2=Egoist, 3=Traitor. Enforce mapping after immigration, reproduction, and `setSeed`.

---

## 4. React Performance Patterns

### 4.1 Never Store Grid in useState

```ts
// ❌ BAD — 60+ re-renders/sec
const [grid, setGrid] = useState(...);

// ✅ GOOD
const engineRef = useRef<SimulationEngine | null>(null);
```

### 4.2 Throttle Stats Updates

At 1200 TPS, do not call `setStats` every tick. Throttle to ~12/sec:

```ts
const STATS_UPDATE_INTERVAL_MS = 80;

function maybeUpdateStats(now: number) {
  if (now - lastStatsUpdateRef.current >= STATS_UPDATE_INTERVAL_MS) {
    lastStatsUpdateRef.current = now;
    const s = engineRef.current.getStats();
    setStats({ ...s, counts: { ...s.counts } });
    setGeneration(engineRef.current.getGeneration());
  }
}
```

### 4.3 Use Ref for Speed (Stable Loop)

The rAF loop must not be recreated when `speedIndex` changes. Use a ref:

```ts
const speedIndexRef = useRef(speedIndex);
speedIndexRef.current = speedIndex; // eslint-disable-line react-hooks/refs
// In loop: const targetTPS = SPEEDS[speedIndexRef.current];
```

### 4.4 Recursive rAF Loop

For recursion without "variable used before declaration" lint errors:

```ts
const loopRef = useRef<(t: number) => void>(() => {});
const loop = useCallback((currentTime: number) => {
  // ... tick, draw, maybeUpdateStats ...
  rafIdRef.current = requestAnimationFrame(loopRef.current);
}, [tick, draw, maybeUpdateStats]);
loopRef.current = loop; // eslint-disable-line react-hooks/refs
```

### 4.5 Avoid Impure Refs During Render

```ts
// ❌ BAD — performance.now() is impure
const lastTimeRef = useRef(performance.now());

// ✅ GOOD
const lastTimeRef = useRef(0);
// Set in useEffect when starting: lastTimeRef.current = performance.now();
```

---

## 5. Canvas Rendering

### 5.1 Use Canvas, Not DOM

- Do **not** use 2500 `<div>` elements for the grid. Use a single `<canvas>` and `ctx.fillRect()` (or similar).
- Apply `image-rendering: pixelated` (or `crisp-edges`) for crisp cells when scaling.

### 5.2 Draw Once Per Frame

- Compute all ticks for the frame, then draw once.
- Do not draw per cell; batch into a single clear + full redraw.

### 5.3 Color-Blind Palette

- Tags: Blue, Orange, Teal, Magenta. **Avoid Red/Green** as the only distinction.
- Use `TAG_COLORS` and `STRATEGY_COLORS` from `constants.ts`.

### 5.4 Layout Constraints (Stage 1 onward)

From **Stage 1 onward**, the app uses a **symmetric three-zone layout** for consistency:

- **Left**: Strategy legend (`SidebarLegend`) — shown **only from Stage 2** (when strategies are introduced). Fixed position when visible.
- **Center**: Main content (stage content) — **must stay centered** and must not shift when toggling stages or when legend/parameters are shown.
- **Right**: Right panel (`ParametersPanel`) — same distance from viewport edge and from center content as the legend. On **Stage 1** it shows the **Prisoner’s Dilemma payoff matrix** (PTR change, from `COST`/`BENEFIT` in constants). On **Stage 2+** it shows the parameters table when that stage has one.

**Constraints:**

- The **symmetric margins** (e.g. `ml-72 mr-72` on `<main>`) apply when `currentStage >= 1`, so Stage 1 and all later stages share the same centered content band.
- Legend and parameters table must be **equidistant from the viewport edges** (e.g. both use the same edge gap: `left-12` / `right-12`).
- Legend and parameters must be **equidistant from the content** (same inner gap). Both side panels use the same **effective column width** (e.g. `w-64` / 16rem) so the reserved space on left and right is equal.
- The center column is implemented in `App.tsx`: when `currentStage >= 1`, `<main>` gets symmetric margins. The legend and parameters are absolutely positioned in the same full-width wrapper; they do not affect the flow of the centered content.

**Do not** put the parameters table inside individual stage components — it lives in `ParametersPanel` and is rendered by `App.tsx` so positioning is consistent and the content does not move.

### 5.5 Tailwind CSS: Use the Spacing Scale for Conditional Margins

**Problem:** Conditional class names using **arbitrary values** (e.g. `ml-[20rem]`, `mr-[21rem]`) often **do not appear in the built CSS**. Tailwind’s content scanner may not see these when they are built dynamically (e.g. `` `${condition ? 'ml-[20rem] mr-[20rem]' : ''}` ``), so the styles are never generated and the layout does not change.

**Fix:** Use **Tailwind’s built-in spacing scale** instead of arbitrary values when applying margins (or padding) conditionally:

- Prefer classes like `ml-72`, `mr-72`, `ml-80`, `mr-80` (18rem, 20rem, etc.).
- Tailwind’s default scale: `72` = 18rem, `80` = 20rem, `64` = 16rem. Use these so the classes are always included in the build.

**Guideline:** For any margin or padding that is applied conditionally (e.g. based on `currentStage` or a prop), use a **fixed class name** from the spacing scale (e.g. `ml-72 mr-72`) rather than `` `ml-[${value}rem]` `` or `` `ml-[20rem]` `` in a template string. If you need a value not in the scale, add it to `tailwind.config` or use a safelist; do not rely on arbitrary values in conditional class strings.

---

## 6. TypeScript Conventions

### 6.1 Use Types, Not `any`

- Export interfaces for `Agent`, `Stats`, `SimulationOpts`, etc.
- Use `type` for unions and derived types (e.g. `Phenotype`, `ScenarioMode`).

### 6.2 Constants in constants.ts

- All parameters, colors, speeds, grid sizes in `constants.ts`.
- Use `as const` for readonly arrays/tuples.

### 6.3 Import Types with `import type`

```ts
import type { Agent, Stats } from './engine';
import type { Phenotype } from './constants';
```

---

## 7. Testing

### 7.1 Engine Tests (Vitest)

- Test `getIdx` toroidal wrap (negative, overflow).
- Test `getNeighborIndices` returns 4 neighbors, all valid.
- Test `getPhenotype` for all 4 phenotypes.
- Test `SimulationEngine`: empty start, immigration, reset, setSeed, clash mapping, full tick.

### 7.2 Run Tests

```bash
npm run test
```

### 7.3 Validation Script

```bash
npm run validate
```

- Runs 10 × 2000-tick simulations. Ethnocentrism should be ≥65% in final 100 periods.

---

## 8. Common Gotchas (Do Not Repeat)

### 8.1 Toroidal Modulo

- `-1 % 50 === -1` in JS. Always use `((n % L) + L) % L`.

### 8.2 Reproduction Requires Empty Neighbor

- If all 4 neighbors are full, reproduction fails. Do not "push" agents.
- Death rate (10%) is critical to create empty cells.

### 8.3 Fisher-Yates in Reproduction

- Shuffle the list of occupied indices before reproducing. Order matters.

### 8.4 Clash Mode in setSeed

- When scenario is Clash, `setSeed` must apply tag→strategy mapping to placed agents.

### 8.5 Stats Shallow Copy

- When passing stats to `setState`, always copy: `{ ...s, counts: { ...s.counts } }` so React detects change.

### 8.6 Canvas Pixelation

- For pixel-art style cells, add `image-rendering: pixelated` to the canvas CSS.

### 8.7 Tailwind Arbitrary Values in Conditional Classes

- Conditional margins like `` `ml-[20rem]` `` may not be generated; use the spacing scale (`ml-72`, `mr-80`, etc.) instead. See §5.5.

---

## 9. When Adding Features

### 9.1 New Simulation Parameters

- Add to `constants.ts` and `SimulationParams` (if user-configurable).
- Wire through `SimulationEngine` constructor or `setParams`.
- Document in this file if it affects paper compliance.

### 9.2 New UI Controls

- Add state in the component. Pass callbacks to the hook.
- Do not put high-frequency data (grid, ticks) in React state.

### 9.3 New Stages or Tutorials

- Add to `src/components/stages/`.
- Use the stage structure: text + small interactive canvas + "Next" flow.

### 9.4 New Tests

- Add `*.test.ts` next to the module.
- Mock `Math.random` if deterministic behavior is needed.

---

## 10. References

- **Paper**: Hammond, R. A., & Axelrod, R. (2006). The Evolution of Ethnocentrism. *Journal of Conflict Resolution*, 50(6), 926-936.
- **Inspiration**: Nicky Case, [The Evolution of Trust](https://ncase.me/trust/)
- **NetLogo replication**: [CCL NorthWestern](http://ccl.northwestern.edu/netlogo/models/Ethnocentrism)
