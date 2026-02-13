import { useRef, useState, useCallback, useEffect } from 'react';
import type { RefObject } from 'react';
import { SimulationEngine } from '../lib/engine';
import type { Stats } from '../lib/engine';
import { drawGrid } from '../lib/renderer';
import type { ViewMode } from '../lib/renderer';
import { ParticleSystem } from '../lib/particles';
import { TAG_COLORS, STRATEGY_COLORS } from '../lib/constants';
import { SPEEDS, SCENARIO_STANDARD, GRID_SIZES } from '../lib/constants';
import type { ColorMode, Distribution, Phenotype, ScenarioMode, SimulationParams } from '../lib/constants';
import { getPhenotype } from '../lib/engine';
import type { Agent } from '../lib/engine';

const STATS_UPDATE_INTERVAL_MS = 80; // ~12.5 updates/sec max
const HISTORY_SAMPLE_INTERVAL = 15; // Sample every N ticks
const HISTORY_MAX_LENGTH = 500;

export interface HistoryEntry {
  generation: number;
  ethnocentric: number;
  altruist: number;
  egoist: number;
  traitor: number;
}

/** API passed to onEngineReady so parents can seed after the engine exists */
export interface SimulationEngineApi {
  seedByDistribution: (dist: Distribution) => void;
  seedTwoGroups: (groupA: Phenotype, groupB: Phenotype, ratioA: number, fillRatio?: number) => void;
  reset: () => void;
  setCell: (idx: number, agent: Agent | null) => void;
  clearRegion: (centerIdx: number, radius: number) => void;
  setParams: (params: SimulationParams) => void;
}

export interface UseSimulationOpts {
  scenario?: ScenarioMode;
  viewMode?: ViewMode;
  colorMode?: ColorMode;
  canvasWidth?: number;
  canvasHeight?: number;
  gridW?: number;
  gridH?: number;
  usePips?: boolean;
  enableParticles?: boolean;
  /** When false, do not spawn cost/benefit (cooperation line/numbers) particles. Used only on Stage 1; other stages leave this false. */
  enableCooperationParticles?: boolean;
  enableHistory?: boolean;
  params?: SimulationParams;
  initialSpeedIndex?: number;
  /** Called once when the engine is created; use to seed so gen/pop update and to avoid flicker */
  onEngineReady?: (api: SimulationEngineApi) => void;
}

export interface UseSimulationReturn {
  isRunning: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
  stats: Stats;
  generation: number;
  speedIndex: number;
  setSpeedIndex: (index: number) => void;
  draw: () => void;
  engineRef: RefObject<SimulationEngine | null>;
  history: HistoryEntry[];
  setCell: (idx: number, agent: Agent | null) => void;
  clearRegion: (centerIdx: number, radius: number) => void;
  seedByDistribution: (dist: Distribution) => void;
  seedTwoGroups: (groupA: Phenotype, groupB: Phenotype, ratioA: number, fillRatio?: number) => void;
  setParams: (params: SimulationParams) => void;
}

export function useSimulation(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  particleCanvasRef: RefObject<HTMLCanvasElement | null> | null,
  opts: UseSimulationOpts = {}
): UseSimulationReturn {
  const {
    scenario = SCENARIO_STANDARD,
    viewMode = 'tags',
    colorMode = 'strategy',
    canvasWidth = 500,
    canvasHeight = 500,
    gridW = GRID_SIZES.sandbox[0],
    gridH = GRID_SIZES.sandbox[1],
    usePips = true,
    enableParticles = true,
    enableCooperationParticles = false,
    enableHistory = true,
    params,
    initialSpeedIndex = 0,
    onEngineReady,
  } = opts;

  const onEngineReadyRef = useRef(onEngineReady);
  onEngineReadyRef.current = onEngineReady;

  const engineRef = useRef<SimulationEngine | null>(null);
  const particlesRef = useRef<ParticleSystem | null>(null);
  const historyRef = useRef<HistoryEntry[]>([]);
  const tickCountRef = useRef(0);
  const apiRef = useRef<SimulationEngineApi | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(initialSpeedIndex);
  const [stats, setStats] = useState<Stats>({
    counts: { ethnocentric: 0, altruist: 0, egoist: 0, traitor: 0 },
    total: 0,
  });
  const [generation, setGeneration] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const speedIndexRef = useRef(speedIndex);
  speedIndexRef.current = speedIndex; // eslint-disable-line react-hooks/refs

  const accumulatorRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastStatsUpdateRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const cellW = canvasWidth / gridW;
  const cellH = canvasHeight / gridH;

  const idxToPixel = useCallback(
    (idx: number) => {
      const gx = gridW;
      const x = (idx % gx) * cellW;
      const y = Math.floor(idx / gx) * cellH;
      return { x, y };
    },
    [gridW, cellW, cellH]
  );

  useEffect(() => {
    particlesRef.current = new ParticleSystem();
    const events = enableParticles
      ? {
          ...(enableCooperationParticles && {
            cooperation: (giverIdx: number, receiverIdx: number) => {
              const g = idxToPixel(giverIdx);
              const r = idxToPixel(receiverIdx);
              const grid = engineRef.current?.getGrid();
              const agent = grid?.[giverIdx];
              const color = agent
                ? (colorMode === 'strategy' ? STRATEGY_COLORS[getPhenotype(agent)] : TAG_COLORS[agent.tag])
                : '#888';
              particlesRef.current?.spawnCooperation(g.x, g.y, r.x, r.y, cellW, cellH, color);
            },
          }),
          reproduction: (_parentIdx: number, childIdx: number) => {
            const c = idxToPixel(childIdx);
            const grid = engineRef.current?.getGrid();
            const agent = grid?.[childIdx];
            const color = agent
              ? (colorMode === 'strategy' ? STRATEGY_COLORS[getPhenotype(agent)] : TAG_COLORS[agent.tag])
              : '#888';
            particlesRef.current?.spawnReproduction(c.x, c.y, cellW, cellH, color);
          },
          death: (idx: number) => {
            const d = idxToPixel(idx);
            particlesRef.current?.spawnDeath(d.x, d.y, cellW, cellH);
          },
        }
      : undefined;

    const engine = new SimulationEngine({
      scenario,
      gridW,
      gridH,
      events,
      params,
    });
    engineRef.current = engine;
    const s = engineRef.current.getStats();
    setStats({ ...s, counts: { ...s.counts } });
    setGeneration(0);
    historyRef.current = [];
    setHistory([]);
    tickCountRef.current = 0;
    if (apiRef.current) onEngineReadyRef.current?.(apiRef.current);
  }, [scenario, gridW, gridH, enableParticles, enableCooperationParticles, colorMode, idxToPixel, cellW, cellH]); // eslint-disable-line react-hooks/exhaustive-deps -- params: use setParams for runtime updates

  const draw = useCallback(() => {
    const canvas = canvasRef?.current;
    if (!canvas || !engineRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    drawGrid(
      ctx,
      engineRef.current.getGrid(),
      viewMode,
      canvasWidth,
      canvasHeight,
      gridW,
      gridH,
      { usePips, timeMs: now, colorMode }
    );

    if (enableParticles && particleCanvasRef?.current && particlesRef.current) {
      const pCtx = particleCanvasRef.current.getContext('2d');
      if (pCtx) {
        pCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        particlesRef.current.update(now);
        particlesRef.current.render(pCtx, now, cellW, cellH);
      }
    }
  }, [
    canvasRef,
    particleCanvasRef,
    viewMode,
    colorMode,
    canvasWidth,
    canvasHeight,
    gridW,
    gridH,
    usePips,
    enableParticles,
    cellW,
    cellH,
  ]);

  const maybeUpdateStats = useCallback(
    (now: number) => {
      if (now - lastStatsUpdateRef.current >= STATS_UPDATE_INTERVAL_MS) {
        lastStatsUpdateRef.current = now;
        if (engineRef.current) {
          const s = engineRef.current.getStats();
          setStats({ ...s, counts: { ...s.counts } });
          setGeneration(engineRef.current.getGeneration());
        }
      }
    },
    []
  );

  const tick = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.tick();
    tickCountRef.current++;

    if (enableHistory && tickCountRef.current % HISTORY_SAMPLE_INTERVAL === 0) {
      const s = engineRef.current.getStats();
      const entry: HistoryEntry = {
        generation: engineRef.current.getGeneration(),
        ethnocentric: s.counts.ethnocentric,
        altruist: s.counts.altruist,
        egoist: s.counts.egoist,
        traitor: s.counts.traitor,
      };
      historyRef.current = [
        ...historyRef.current.slice(-(HISTORY_MAX_LENGTH - 1)),
        entry,
      ];
      setHistory(historyRef.current);
    }
  }, [enableHistory]);

  const loopRef = useRef<(currentTime: number) => void>(() => {});
  const loop = useCallback(
    (currentTime: number) => {
      const targetTPS = SPEEDS[speedIndexRef.current];
      const frameTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (targetTPS < 60) {
        accumulatorRef.current += frameTime;
        const tickInterval = 1000 / targetTPS;
        while (accumulatorRef.current >= tickInterval) {
          tick();
          accumulatorRef.current -= tickInterval;
        }
        draw();
        maybeUpdateStats(currentTime);
      } else {
        const ticksPerFrame = Math.floor(targetTPS / 60);
        for (let i = 0; i < ticksPerFrame; i++) {
          tick();
        }
        draw();
        maybeUpdateStats(currentTime);
      }

      rafIdRef.current = requestAnimationFrame(loopRef.current);
    },
    [tick, draw, maybeUpdateStats]
  );
  loopRef.current = loop; // eslint-disable-line react-hooks/refs

  useEffect(() => {
    if (isRunning) {
      const now = performance.now();
      lastTimeRef.current = now;
      lastStatsUpdateRef.current = now;
      accumulatorRef.current = 0;
      rafIdRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isRunning, loop]);

  useEffect(() => {
    if (!isRunning && engineRef.current) {
      draw();
    }
  }, [viewMode, colorMode, scenario, draw, isRunning]);

  const reset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset();
      particlesRef.current?.clear();
      historyRef.current = [];
      setHistory([]);
      tickCountRef.current = 0;
      const s = engineRef.current.getStats();
      setStats({ ...s, counts: { ...s.counts } });
      setGeneration(0);
      draw();
    }
  }, [draw]);

  const play = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  const setCell = useCallback((idx: number, agent: Agent | null) => {
    engineRef.current?.setCell(idx, agent);
    draw();
  }, [draw]);

  const clearRegion = useCallback((centerIdx: number, radius: number) => {
    engineRef.current?.clearRegion(centerIdx, radius);
    draw();
  }, [draw]);

  const seedByDistribution = useCallback((dist: Distribution) => {
    engineRef.current?.seedByDistribution(dist);
    particlesRef.current?.clear();
    historyRef.current = [];
    setHistory([]);
    tickCountRef.current = 0;
    const s = engineRef.current?.getStats();
    if (s) setStats({ ...s, counts: { ...s.counts } });
    setGeneration(engineRef.current?.getGeneration() ?? 0);
    draw();
  }, [draw]);

  const setParams = useCallback((params: SimulationParams) => {
    engineRef.current?.setParams(params);
  }, []);

  const seedTwoGroups = useCallback((groupA: Phenotype, groupB: Phenotype, ratioA: number, fillRatio?: number) => {
    engineRef.current?.seedTwoGroups(groupA, groupB, ratioA, fillRatio);
    particlesRef.current?.clear();
    historyRef.current = [];
    setHistory([]);
    tickCountRef.current = 0;
    const s = engineRef.current?.getStats();
    if (s) setStats({ ...s, counts: { ...s.counts } });
    setGeneration(engineRef.current?.getGeneration() ?? 0);
    draw();
  }, [draw]);

  apiRef.current = {
    seedByDistribution,
    seedTwoGroups,
    reset,
    setCell,
    clearRegion,
    setParams,
  };

  return {
    isRunning,
    play,
    pause,
    reset,
    stats,
    generation,
    speedIndex,
    setSpeedIndex,
    draw,
    engineRef,
    history,
    setCell,
    clearRegion,
    seedByDistribution,
    seedTwoGroups,
    setParams,
  };
}
