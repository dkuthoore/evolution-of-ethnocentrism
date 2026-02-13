# The Evolution of Ethnocentrism

An interactive, educational web simulation inspired by Nicky Case's [The Evolution of Trust](https://ncase.me/trust/), translating the Hammond & Axelrod (2006) paper *"The Evolution of Ethnocentrism"* into an explorable explanation.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Validate

Run the simulation validation script (10 runs, 2000 ticks each):

```bash
npm run validate
```

Expected: Ethnocentrism ≥65% in final 100 periods (paper reports ~76%).

## Tech Stack

- **React** (Vite) + **TypeScript**
- **Tailwind CSS**, **lucide-react**
- **Vanilla HTML5 Canvas** for grid rendering (2500 cells)
- **Vitest** for unit tests

## Structure

- **Section 1 (Explainer):** Interactive tutorial with 3×3 canvas, COST/BENEFIT demo, strategy types
- **Section 2 (Main Sandbox):** Full 50×50 grid, Play/Pause, speed control, scenario modes, demographics

## Paper

Hammond, R. A., & Axelrod, R. (2006). The Evolution of Ethnocentrism. *Journal of Conflict Resolution*, 50(6), 926-936.

## License

MIT
