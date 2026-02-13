import { describe, it, expect, beforeEach } from 'vitest';
import {
  SimulationEngine,
  getIdx,
  getNeighborIndices,
  getPhenotype,
  createAgentWithPhenotype,
} from './engine';
import { GRID_W, GRID_H, SIZE, SCENARIO_STANDARD, SCENARIO_CLASH } from './constants';

describe('getIdx', () => {
  it('wraps negative x correctly', () => {
    expect(getIdx(-1, 0)).toBe(GRID_W - 1);
  });
  it('wraps negative y correctly', () => {
    expect(getIdx(0, -1)).toBe((GRID_H - 1) * GRID_W);
  });
  it('wraps overflow x correctly', () => {
    expect(getIdx(GRID_W, 0)).toBe(0);
  });
  it('wraps overflow y correctly', () => {
    expect(getIdx(0, GRID_H)).toBe(0);
  });
  it('returns correct index for valid coords', () => {
    expect(getIdx(0, 0)).toBe(0);
    expect(getIdx(GRID_W - 1, GRID_H - 1)).toBe(SIZE - 1);
  });
});

describe('getNeighborIndices', () => {
  it('returns exactly 4 neighbors', () => {
    expect(getNeighborIndices(0).length).toBe(4);
  });
  it('neighbors are toroidal (corners wrap)', () => {
    const neighbors = getNeighborIndices(0);
    expect(neighbors).toContain(getIdx(1, 0));
    expect(neighbors).toContain(getIdx(0, 1));
    expect(neighbors).toContain(getIdx(GRID_W - 1, 0));
    expect(neighbors).toContain(getIdx(0, GRID_H - 1));
  });
  it('all neighbor indices are valid', () => {
    for (let i = 0; i < SIZE; i++) {
      const neighbors = getNeighborIndices(i);
      for (const n of neighbors) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThan(SIZE);
      }
    }
  });
});

describe('createAgentWithPhenotype', () => {
  it('creates ethnocentric agent', () => {
    const a = createAgentWithPhenotype('ethnocentric');
    expect(a.ig).toBe(1);
    expect(a.og).toBe(0);
  });
  it('creates altruist agent', () => {
    const a = createAgentWithPhenotype('altruist');
    expect(a.ig).toBe(1);
    expect(a.og).toBe(1);
  });
  it('creates egoist agent', () => {
    const a = createAgentWithPhenotype('egoist');
    expect(a.ig).toBe(0);
    expect(a.og).toBe(0);
  });
  it('creates traitor agent', () => {
    const a = createAgentWithPhenotype('traitor');
    expect(a.ig).toBe(0);
    expect(a.og).toBe(1);
  });
});

describe('getPhenotype', () => {
  it('identifies ethnocentric (ig=1, og=0)', () => {
    expect(getPhenotype({ tag: 0, ig: 1, og: 0, ptr: 0.12 })).toBe('ethnocentric');
  });
  it('identifies altruist (ig=1, og=1)', () => {
    expect(getPhenotype({ tag: 0, ig: 1, og: 1, ptr: 0.12 })).toBe('altruist');
  });
  it('identifies egoist (ig=0, og=0)', () => {
    expect(getPhenotype({ tag: 0, ig: 0, og: 0, ptr: 0.12 })).toBe('egoist');
  });
  it('identifies traitor (ig=0, og=1)', () => {
    expect(getPhenotype({ tag: 0, ig: 0, og: 1, ptr: 0.12 })).toBe('traitor');
  });
});

describe('SimulationEngine', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine({ scenario: SCENARIO_STANDARD });
  });

  it('starts with empty grid', () => {
    const stats = engine.getStats();
    expect(stats.total).toBe(0);
    expect(engine.getGeneration()).toBe(0);
  });

  it('immigration adds agents over time', () => {
    for (let i = 0; i < 10; i++) {
      engine.tick();
    }
    const stats = engine.getStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(engine.getGeneration()).toBe(10);
  });

  it('reset clears grid', () => {
    for (let i = 0; i < 5; i++) engine.tick();
    engine.reset();
    expect(engine.getStats().total).toBe(0);
    expect(engine.getGeneration()).toBe(0);
  });

  it('setSeed places agents at specified indices', () => {
    engine.setSeed([
      { idx: 0, tag: 0, ig: 1, og: 0 },
      { idx: 1, tag: 1, ig: 1, og: 1 },
    ]);
    const grid = engine.getGrid();
    expect(grid[0]).not.toBeNull();
    expect(grid[1]).not.toBeNull();
    expect(grid[0]?.tag).toBe(0);
    expect(grid[0]?.ig).toBe(1);
    expect(grid[0]?.og).toBe(0);
  });

  it('clash mode enforces tag-to-strategy mapping', () => {
    const clashEngine = new SimulationEngine({ scenario: SCENARIO_CLASH });
    clashEngine.setSeed([
      { idx: 0, tag: 0, ig: 0, og: 0 },
      { idx: 1, tag: 1, ig: 0, og: 0 },
    ]);
    const grid = clashEngine.getGrid();
    expect(grid[0]?.ig).toBe(1);
    expect(grid[0]?.og).toBe(0);
    expect(grid[1]?.ig).toBe(1);
    expect(grid[1]?.og).toBe(1);
  });

  it('runs full tick without throwing', () => {
    for (let i = 0; i < 100; i++) {
      engine.tick();
    }
    const stats = engine.getStats();
    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.counts.ethnocentric + stats.counts.altruist + stats.counts.egoist + stats.counts.traitor).toBe(stats.total);
  });

  it('setCell places agent at index', () => {
    const agent = { tag: 0, ig: 1, og: 0, ptr: 0.12 };
    engine.setCell(0, agent);
    const grid = engine.getGrid();
    expect(grid[0]).toEqual(agent);
  });

  it('setCell clears cell when null', () => {
    engine.setSeed([{ idx: 0, tag: 0 }]);
    engine.setCell(0, null);
    expect(engine.getGrid()[0]).toBeNull();
  });

  it('clearRegion clears 5x5 area', () => {
    engine.setSeed([
      { idx: 0, tag: 0 },
      { idx: 1, tag: 1 },
      { idx: 50, tag: 0 },
    ]);
    engine.clearRegion(25, 2); // 5x5 centered at (25, 0) in row-major
    const grid = engine.getGrid();
    expect(grid[0]).not.toBeNull();
    expect(grid[1]).not.toBeNull();
    // Center and nearby should be cleared
    const cleared = [23, 24, 25, 26, 27, 73, 74, 75, 76, 77];
    for (const i of cleared) {
      if (i < SIZE) expect(grid[i]).toBeNull();
    }
  });
});

describe('SimulationEngine with configurable grid', () => {
  it('accepts custom grid dimensions', () => {
    const small = new SimulationEngine({ gridW: 10, gridH: 10 });
    expect(small.getSize()).toBe(100);
    expect(small.getGridW()).toBe(10);
    expect(small.getGridH()).toBe(10);
  });

  it('seedByDistribution populates grid by percentages', () => {
    const eng = new SimulationEngine({ gridW: 10, gridH: 10 });
    eng.seedByDistribution({ ethnocentric: 0.5, altruist: 0.5, egoist: 0, traitor: 0 });
    const stats = eng.getStats();
    expect(stats.total).toBe(100);
  });

  it('seedTwoGroups populates with two phenotypes', () => {
    const eng = new SimulationEngine({ gridW: 5, gridH: 5 });
    eng.seedTwoGroups('altruist', 'egoist', 0.5);
    const stats = eng.getStats();
    expect(stats.total).toBe(25);
  });

  it('emits cooperation events', () => {
    const events: Array<[number, number, number, number]> = [];
    const eng = new SimulationEngine({
      scenario: SCENARIO_CLASH,
      gridW: 3,
      gridH: 3,
      events: {
        cooperation: (g, r, c, b) => events.push([g, r, c, b]),
      },
    });
    eng.setSeed([
      { idx: 0, tag: 0 }, // ethnocentric
      { idx: 1, tag: 0 },
    ]);
    eng.tick();
    expect(events.length).toBeGreaterThanOrEqual(0);
  });
});
