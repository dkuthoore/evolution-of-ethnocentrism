import {
  GRID_W,
  GRID_H,
  SIZE,
  BASE_PTR,
  COST,
  BENEFIT,
  MUTATION_RATE,
  DEATH_RATE,
  IMMIGRATION_RATE,
  SCENARIO_STANDARD,
  SCENARIO_CLASH,
  DEFAULT_PARAMS,
} from './constants';
import { PHENOTYPE_LABELS } from './constants';
import type { Distribution, Phenotype, ScenarioMode, SimulationParams } from './constants';

export interface Agent {
  tag: number;
  ig: number;
  og: number;
  ptr: number;
}

export interface Stats {
  counts: Record<Phenotype, number>;
  total: number;
}

export interface SimulationEvents {
  cooperation?: (giverIdx: number, receiverIdx: number, cost: number, benefit: number) => void;
  reproduction?: (parentIdx: number, childIdx: number) => void;
  death?: (idx: number) => void;
}

// Toroidal index helper (fixes JS modulo bug: -1 % 50 === -1)
export function getIdx(x: number, y: number, gridW = GRID_W, gridH = GRID_H): number {
  const wrappedX = ((x % gridW) + gridW) % gridW;
  const wrappedY = ((y % gridH) + gridH) % gridH;
  return wrappedY * gridW + wrappedX;
}

// Convert flat index to (x, y) for a given grid
function idxToXY(idx: number, gridW: number): [number, number] {
  const y = Math.floor(idx / gridW);
  const x = idx % gridW;
  return [x, y];
}

// Build precomputed neighbor lookup table for a grid (avoids allocation per cell per tick)
function buildNeighbors(gridW: number, gridH: number): number[][] {
  const table: number[][] = [];
  const size = gridW * gridH;
  for (let i = 0; i < size; i++) {
    const [x, y] = idxToXY(i, gridW);
    table[i] = [
      getIdx(x, y - 1, gridW, gridH),
      getIdx(x, y + 1, gridW, gridH),
      getIdx(x - 1, y, gridW, gridH),
      getIdx(x + 1, y, gridW, gridH),
    ];
  }
  return table;
}

const DEFAULT_NEIGHBORS = buildNeighbors(GRID_W, GRID_H);

export function getNeighborIndices(idx: number, gridW = GRID_W, gridH = GRID_H): readonly number[] {
  if (gridW === GRID_W && gridH === GRID_H) return DEFAULT_NEIGHBORS[idx] ?? [];
  const table = buildNeighbors(gridW, gridH);
  return table[idx] ?? [];
}

function createAgent(tag: number | null = null, ig: number | null = null, og: number | null = null): Agent {
  const rand = () => Math.random();
  return {
    tag: tag ?? Math.floor(rand() * 4),
    ig: ig ?? (rand() < 0.5 ? 0 : 1),
    og: og ?? (rand() < 0.5 ? 0 : 1),
    ptr: BASE_PTR,
  };
}

const CLASH_MAPPINGS = [
  { ig: 1, og: 0 },
  { ig: 1, og: 1 },
  { ig: 0, og: 0 },
  { ig: 0, og: 1 },
] as const;

function applyClashMapping(agent: Agent): Agent {
  const m = CLASH_MAPPINGS[agent.tag];
  return { ...agent, ig: m.ig, og: m.og };
}

function createClashAgent(tag: number): Agent {
  return applyClashMapping(createAgent(tag, null, null));
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getPhenotype(agent: Agent): Phenotype {
  if (agent.ig === 1 && agent.og === 0) return 'ethnocentric';
  if (agent.ig === 1 && agent.og === 1) return 'altruist';
  if (agent.ig === 0 && agent.og === 0) return 'egoist';
  return 'traitor';
}

/** Create an agent with a specific phenotype and tag. */
export function createAgentWithPhenotype(
  phenotype: Phenotype,
  tag: number = 0
): Agent {
  const { ig, og } = PHENOTYPE_LABELS[phenotype];
  return createAgent(tag, ig, og);
}

export interface SimulationOpts {
  scenario?: ScenarioMode;
  gridW?: number;
  gridH?: number;
  events?: SimulationEvents;
  params?: SimulationParams;
}

export class SimulationEngine {
  private scenario: ScenarioMode;
  private readonly gridW: number;
  private readonly gridH: number;
  private readonly size: number;
  private readonly neighbors: number[][];
  private readonly events: SimulationEvents;
  private params: Required<SimulationParams>;
  grid: (Agent | null)[];
  generation: number;

  constructor(opts: SimulationOpts = {}) {
    this.scenario = opts.scenario ?? SCENARIO_STANDARD;
    this.gridW = opts.gridW ?? GRID_W;
    this.gridH = opts.gridH ?? GRID_H;
    this.size = this.gridW * this.gridH;
    this.neighbors = buildNeighbors(this.gridW, this.gridH);
    this.events = opts.events ?? {};
    this.params = { ...DEFAULT_PARAMS, ...opts.params };
    this.grid = new Array(this.size).fill(null);
    this.generation = 0;
  }

  getGridW(): number {
    return this.gridW;
  }

  getGridH(): number {
    return this.gridH;
  }

  getSize(): number {
    return this.size;
  }

  setParams(params: Partial<SimulationParams>): void {
    this.params = { ...this.params, ...params };
  }

  reset(): void {
    this.grid = new Array(this.size).fill(null);
    this.generation = 0;
  }

  setCell(idx: number, agent: Agent | null): void {
    if (idx >= 0 && idx < this.size) {
      this.grid[idx] = agent;
    }
  }

  clearRegion(centerIdx: number, radius: number): void {
    const [cx, cy] = idxToXY(centerIdx, this.gridW);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const idx = getIdx(cx + dx, cy + dy, this.gridW, this.gridH);
        this.grid[idx] = null;
      }
    }
  }

  setSeed(agents: Array<{ idx: number; tag: number; ig?: number; og?: number }>): void {
    this.reset();
    for (const { idx, tag, ig, og } of agents) {
      if (idx >= 0 && idx < this.size && this.grid[idx] === null) {
        let agent = createAgent(tag, ig ?? null, og ?? null);
        agent.ptr = this.params.basePtr;
        if (this.scenario === SCENARIO_CLASH) {
          agent = applyClashMapping(agent);
        }
        this.grid[idx] = agent;
      }
    }
  }

  seedByDistribution(distribution: Distribution): void {
    this.reset();
    const phenotypes: Phenotype[] = ['ethnocentric', 'altruist', 'egoist', 'traitor'];
    const size = this.size;
    const agentList: Phenotype[] = [];
    for (const p of phenotypes) {
      const count = Math.round(distribution[p] * size);
      for (let i = 0; i < count; i++) agentList.push(p);
    }
    while (agentList.length < size) {
      agentList.push(phenotypes[agentList.length % 4]!);
    }
    const shuffled = agentList.slice(0, size);
    shuffleArray(shuffled);
    for (let i = 0; i < size; i++) {
      const phenotype = shuffled[i]!;
      const tag = Math.floor(Math.random() * 4);
      const agent = createAgentWithPhenotype(phenotype, tag);
      agent.ptr = this.params.basePtr;
      this.grid[i] = this.scenario === SCENARIO_CLASH ? applyClashMapping(agent) : agent;
    }
  }

  seedTwoGroups(groupA: Phenotype, groupB: Phenotype, ratioA: number, fillRatio: number = 1): void {
    this.reset();
    const indices = Array.from({ length: this.size }, (_, i) => i);
    shuffleArray(indices);
    const fill = Math.max(0, Math.min(1, fillRatio));
    const totalPlaced = Math.round(this.size * fill);
    const countA = Math.round(totalPlaced * Math.max(0, Math.min(1, ratioA)));
    for (let i = 0; i < totalPlaced; i++) {
      const phenotype = i < countA ? groupA : groupB;
      const tag = i < countA ? 0 : 1;
      const agent = createAgentWithPhenotype(phenotype, tag);
      agent.ptr = this.params.basePtr;
      this.grid[indices[i]!] = agent;
    }
  }

  private phaseImmigration(): void {
    const emptyIndices: number[] = [];
    for (let i = 0; i < this.size; i++) {
      if (this.grid[i] === null) emptyIndices.push(i);
    }
    const rate = Math.max(0, Math.floor(this.params.immigrationRate));
    for (let n = 0; n < rate && emptyIndices.length > 0; n++) {
      const idx = emptyIndices.splice(Math.floor(Math.random() * emptyIndices.length), 1)[0];
      const agent = this.scenario === SCENARIO_CLASH
        ? createClashAgent(Math.floor(Math.random() * 4))
        : createAgent();
      agent.ptr = this.params.basePtr;
      this.grid[idx] = agent;
    }
  }

  private phaseInteraction(): void {
    const { cost, benefit, basePtr } = this.params;
    for (let i = 0; i < this.size; i++) {
      const agent = this.grid[i];
      if (agent) agent.ptr = basePtr;
    }
    for (let i = 0; i < this.size; i++) {
      const agentA = this.grid[i];
      if (!agentA) continue;
      const neighborIndices = this.neighbors[i];
      for (const ni of neighborIndices) {
        const agentN = this.grid[ni];
        if (!agentN) continue;
        const aCoop = agentA.tag === agentN.tag ? agentA.ig : agentA.og;
        if (aCoop === 1) {
          agentA.ptr -= cost;
          agentN.ptr += benefit;
          this.events.cooperation?.(i, ni, cost, benefit);
        }
        const nCoop = agentN.tag === agentA.tag ? agentN.ig : agentN.og;
        if (nCoop === 1) {
          agentN.ptr -= cost;
          agentA.ptr += benefit;
          this.events.cooperation?.(ni, i, cost, benefit);
        }
      }
    }
  }

  private mutateTrait(value: number, max: number): number {
    if (Math.random() < this.params.mutationRate) {
      return Math.floor(Math.random() * (max + 1));
    }
    return value;
  }

  private phaseReproduction(): void {
    const { basePtr } = this.params;
    const occupiedIndices: number[] = [];
    for (let i = 0; i < this.size; i++) {
      if (this.grid[i] !== null) occupiedIndices.push(i);
    }
    shuffleArray(occupiedIndices);
    for (const idx of occupiedIndices) {
      const agent = this.grid[idx];
      if (!agent || Math.random() >= agent.ptr) continue;
      const neighborIndices = this.neighbors[idx];
      const emptyNeighbors = neighborIndices.filter((ni) => this.grid[ni] === null);
      if (emptyNeighbors.length === 0) continue;
      const targetIdx = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
      const offspring: Agent = {
        tag: this.mutateTrait(agent.tag, 1),
        ig: this.mutateTrait(agent.ig, 1),
        og: this.mutateTrait(agent.og, 1),
        ptr: basePtr,
      };
      // In clash scenario, preserve phenotype (ig, og); tag stays 0 or 1 for group identity only.
      this.grid[targetIdx] = offspring;
      this.events.reproduction?.(idx, targetIdx);
    }
  }

  private phaseDeath(): void {
    for (let i = 0; i < this.size; i++) {
      if (this.grid[i] && Math.random() < this.params.deathRate) {
        this.events.death?.(i);
        this.grid[i] = null;
      }
    }
  }

  tick(): void {
    this.phaseImmigration();
    this.phaseInteraction();
    this.phaseReproduction();
    this.phaseDeath();
    this.generation++;
  }

  getStats(): Stats {
    const counts: Record<Phenotype, number> = {
      ethnocentric: 0,
      altruist: 0,
      egoist: 0,
      traitor: 0,
    };
    let total = 0;
    for (let i = 0; i < this.size; i++) {
      const agent = this.grid[i];
      if (agent) {
        counts[getPhenotype(agent)]++;
        total++;
      }
    }
    return { counts, total };
  }

  getGrid(): (Agent | null)[] {
    return this.grid;
  }

  getGeneration(): number {
    return this.generation;
  }
}
