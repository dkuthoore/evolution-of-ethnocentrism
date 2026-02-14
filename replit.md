# Evolution of Ethnocentrism

## Overview
An interactive, educational web simulation inspired by Nicky Case's "The Evolution of Trust", translating the Hammond & Axelrod (2006) paper on the evolution of ethnocentrism into an explorable explanation. The app walks through 7 stages teaching the model's concepts.

## Tech Stack
- React 19 + TypeScript
- Vite 7 (dev server & bundler)
- Tailwind CSS 4
- Framer Motion (animations)
- Recharts (charts)
- Lucide React (icons)

## Project Structure
- `src/` - Source code
  - `components/` - React components (HomePage, SimulationWidget, etc.)
  - `hooks/` - Custom React hooks (useSimulation)
  - `lib/` - Core simulation engine, renderer, constants
- `public/` - Static assets
- `scripts/` - Validation scripts

## Running
- Dev: `npm run dev` (port 5000, bound to 0.0.0.0)
- Build: `npm run build`
- Test: `npm run test`

## Configuration
- Vite configured with allowedHosts: true for Replit proxy compatibility
- Frontend on port 5000
