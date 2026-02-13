# The Evolution of Ethnocentrism

An interactive, educational web simulation inspired by Nicky Case's [The Evolution of Trust](https://ncase.me/trust/), translating the Hammond & Axelrod (2006) paper [*"The Evolution of Ethnocentrism"*](https://artisresearch.com/files/articles/axelrod_evolution_of_ethnocentrism.pdf) into an explorable explanation.

## Stages: What You Learn

The app walks you through the paper’s model in five main stages. Each stage teaches one piece of the puzzle; by Stage 5 you see the paper’s core result.

| Stage | Name | What it teaches | Takeaway |
|-------|------|-----------------|----------|
| **1** | Meet the Pips | The **Prisoner’s Dilemma** in the model’s language: two Pips choose cooperate or defect. Payoffs: cost 0.01, benefit 0.03; both cooperate → +0.02 each; one cooperates / one defects → cooperator −0.01, defector +0.03; both defect → 0, 0. | The **underlying game**: one-shot PD with cost and benefit. No tags or strategies yet—just the payoff structure that drives everything later. |
| **2** | Pip Strategies | The **four phenotypes** (Altruist, Ethnocentric, Egoist, Traitor) and the **tick loop**: BasePTR 12% → interact with neighbors → reproduce by PTR → 10% death → repeat. No mutation or immigration. Four small grids, each all one strategy. | Cooperators (altruist, ethnocentric) thrive in isolation; defectors (egoist, traitor) go extinct. Introduces the **strategy set** and **dynamics**. Color = strategy. |
| **3** | The Clash of Two | **Two strategies at a time** on one grid. Six pairwise cases (e.g. Altruists vs Egoists, Ethnocentrists vs Altruists) with “what happens” and “implication.” | Free-riders need cooperators; ethnocentrism is **robust** against defectors and can **outcompete** pure altruism when altruists help everyone. |
| **4** | Population Dynamics | **All four strategies** in one world. You choose a **starting mix** (Equal Mix, Heavy Altruist, etc.). **Mutation and immigration** are on. Chart and history show how the mix evolves. | Which strategy wins depends on initial conditions and dynamics. Full population simulation with evolution. Still color = strategy. |
| **5** | Introducing Tags | **Tag ≠ strategy.** Grid colors show **tags** (visible marker only); the chart shows **strategies**. In the standard model, tag and strategy are assigned **independently**—anyone can mutate into any strategy. Start from a half-full grid with an equal mix. **Ethnocentrists have a black dot in the center** so you can see “ethnocentrists of each color.” | The paper’s **main result**: even when we don’t favor any strategy at the start and tags don’t reveal behavior, **ethnocentrism tends to emerge**. That’s the evolution of ethnocentrism. |

After Stage 5, **God Mode** lets you tweak parameters and paint the grid; **Takeaways** summarizes why the study matters, implications (tags are meaningless; ethnocentrism is not globally optimal), and where this shows up in society.

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


## License

MIT
