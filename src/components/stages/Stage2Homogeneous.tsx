import { useRef, useEffect, useState } from 'react';
import { useSimulation } from '../../hooks/useSimulation';
import { createAgentWithPhenotype } from '../../lib/engine';
import { STRATEGY_COLORS, type Phenotype } from '../../lib/constants';

const GRID_SIZE = 5;
const CANVAS_SIZE = 120;

const PHENOTYPE_PLURAL_LABELS: Record<Phenotype, string> = {
  altruist: 'Altruists',
  ethnocentric: 'Ethnocentrists',
  egoist: 'Egoists',
  traitor: 'Traitors',
};

export interface Stage2GridControl {
  play: () => void;
  pause: () => void;
  resetAndSeed: () => void;
}

interface MiniGridProps {
  phenotype: Phenotype;
  index: number;
  controlsRef: React.MutableRefObject<(Stage2GridControl | null)[]>;
  speedIndex: number;
}

function MiniGrid({ phenotype, index, controlsRef, speedIndex }: MiniGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const seedRef = useRef<() => void>(() => {});

  const sim = useSimulation(canvasRef, particleCanvasRef, {
    scenario: 'standard',
    viewMode: 'xray',
    colorMode: 'strategy',
    canvasWidth: CANVAS_SIZE,
    canvasHeight: CANVAS_SIZE,
    gridW: GRID_SIZE,
    gridH: GRID_SIZE,
    usePips: true,
    enableParticles: false,
    enableHistory: false,
    initialSpeedIndex: speedIndex,
    params: { mutationRate: 0, immigrationRate: 0 },
  });

  useEffect(() => {
    sim.setSpeedIndex(speedIndex);
  }, [speedIndex, sim.setSpeedIndex]);

  const INITIAL_PIP_COUNT = 8;

  const seed = () => {
    const engine = sim.engineRef.current;
    if (!engine) return;
    const size = GRID_SIZE * GRID_SIZE;
    engine.reset();
    const indices = Array.from({ length: size }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j]!, indices[i]!];
    }
    for (let k = 0; k < INITIAL_PIP_COUNT && k < indices.length; k++) {
      engine.setCell(indices[k]!, createAgentWithPhenotype(phenotype, 0));
    }
    sim.draw();
  };

  seedRef.current = seed;

  useEffect(() => {
    seed();
  }, [phenotype]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    controlsRef.current[index] = {
      play: sim.play,
      pause: sim.pause,
      resetAndSeed: () => {
        sim.reset();
        seedRef.current();
      },
    };
    return () => {
      controlsRef.current[index] = null;
    };
  }, [index, controlsRef, sim.play, sim.pause, sim.reset]);

  return (
    <div className="flex flex-col gap-1 items-center">
      <span className="text-xs font-medium text-slate-300">{PHENOTYPE_PLURAL_LABELS[phenotype]}</span>
      <div className="relative">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="block rounded border border-slate-600" />
        <canvas ref={particleCanvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="absolute inset-0 pointer-events-none" aria-hidden />
      </div>
    </div>
  );
}

export function Stage2Homogeneous() {
  const controlsRef = useRef<(Stage2GridControl | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedSlider, setSpeedSlider] = useState(5); // 1–5; actual speedIndex = speedSlider - 1

  const playAll = () => {
    controlsRef.current.forEach((c) => c?.play());
    setIsPlaying(true);
  };
  const pauseAll = () => {
    controlsRef.current.forEach((c) => c?.pause());
    setIsPlaying(false);
  };
  const resetAll = () => {
    pauseAll();
    controlsRef.current.forEach((c) => c?.resetAndSeed());
  };

  return (
    <div className="h-full flex flex-col px-4 overflow-hidden relative">
      <div className="shrink-0 pt-4 h-16">
        <h2 className="text-2xl font-bold text-white text-center">Pip Strategies</h2>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-5 shrink-0">
          <div className="max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3">
            <p className="text-slate-300 text-center text-sm mb-2">
              Now let&apos;s run a simple simulation.
            </p>
            <p className="text-slate-400 text-sm font-medium mb-1">Each round:</p>
            <ol className="text-slate-400 text-sm list-decimal list-inside space-y-1 mb-0 pl-1">
              <li>Each Pip starts with a PTR of 12%</li>
              <li>Neighboring Pips interact with each other (or don&apos;t)</li>
              <li>They have a chance (PTR %) to reproduce </li>
              <li>10% chance each Pip dies on each round</li>
              <li>PTRs reset to 12% for the next round. Repeat.</li>
            </ol>
          </div>
          <p className="text-slate-400 text-center max-w-xl">
            Let&apos;s see how each strategy survives on it&apos;s own!{' '}
            <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span> and{' '}
            <span style={{ color: STRATEGY_COLORS.ethnocentric }}>Ethnocentrists</span> help each other and thus thrive.{' '}
            <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span> and{' '}
            <span style={{ color: STRATEGY_COLORS.traitor }}>Traitors</span> are selfish and quickly go extinct.*
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <MiniGrid phenotype="altruist" index={0} controlsRef={controlsRef} speedIndex={speedSlider - 1} />
            <MiniGrid phenotype="ethnocentric" index={1} controlsRef={controlsRef} speedIndex={speedSlider - 1} />
            <MiniGrid phenotype="egoist" index={2} controlsRef={controlsRef} speedIndex={speedSlider - 1} />
            <MiniGrid phenotype="traitor" index={3} controlsRef={controlsRef} speedIndex={speedSlider - 1} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={isPlaying ? pauseAll : playAll}
                className={`px-4 py-2 text-sm rounded text-white font-medium ${isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={resetAll} className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-500 rounded text-white font-medium">
                Reset
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="stage2-speed" className="text-slate-400 text-sm whitespace-nowrap">
                Speed
              </label>
              <input
                id="stage2-speed"
                type="range"
                min={1}
                max={5}
                step={1}
                value={speedSlider}
                onChange={(e) => setSpeedSlider(Number(e.target.value))}
                className="w-28 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-slate-300 text-sm tabular-nums min-w-[1.5rem]">
                {speedSlider}
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-xs italic text-center max-w-lg mt-2">
            *Note: Due to randomness, sometimes the{' '}
            <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span>/
            <span style={{ color: STRATEGY_COLORS.ethnocentric }}>Ethnocentrists</span> go extinct... reset and try the simulation a few times and you will see their strategies usually prevail.
          </p>
        </div>
      </div>
    </div>
  );
}
