import { useRef, useEffect } from 'react';
import { useSimulation } from '../../hooks/useSimulation';
import { createAgentWithPhenotype } from '../../lib/engine';
import type { Phenotype } from '../../lib/constants';

const GRID_SIZE = 5;
const CANVAS_SIZE = 120;

interface MiniGridProps {
  phenotype: Phenotype;
}

function MiniGrid({ phenotype }: MiniGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

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
    initialSpeedIndex: 0,
  });

  const seed = () => {
    const engine = sim.engineRef.current;
    if (!engine) return;
    const size = GRID_SIZE * GRID_SIZE;
    for (let i = 0; i < size; i++) {
      engine.setCell(i, createAgentWithPhenotype(phenotype, 0));
    }
    sim.draw();
  };

  useEffect(() => {
    seed();
  }, [phenotype]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-1 items-center">
      <span className="text-xs font-medium text-slate-300 capitalize">{phenotype}s</span>
      <div className="relative">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="block rounded border border-slate-600" />
        <canvas ref={particleCanvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="absolute inset-0 pointer-events-none" aria-hidden />
      </div>
      <div className="flex gap-1">
        <button onClick={sim.isRunning ? sim.pause : sim.play} className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded text-white">
          {sim.isRunning ? 'Pause' : 'Play'}
        </button>
        <button onClick={seed} className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded text-white">
          Reset
        </button>
      </div>
    </div>
  );
}

const PARAMETERS = [
  { param: 'Cost', description: 'PTR −1% when donating. Giving is costly.' },
  { param: 'Benefit', description: 'PTR +3% when receiving. Receiving helps.' },
  { param: 'BasePTR', description: 'PTR reset to 12% at start of each tick.' },
  { param: 'MutationRate', description: '0.5% chance per trait mutation per offspring.' },
  { param: 'DeathRate', description: '10% chance per agent per tick to die. Creates space.' },
  { param: 'ImmigrationRate', description: 'New agents added per tick (1 = max one).' },
];

export function Stage2Homogeneous() {
  return (
    <div className="h-full flex flex-col px-4 overflow-hidden relative">
      <h2 className="text-2xl font-bold text-white text-center mt-4 mb-2 shrink-0">Stage 2: Like Meets Like</h2>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-5 shrink-0">
          <div className="max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5">
            <p className="text-slate-300 text-center mb-4">
              Now let&apos;s run a simple simulation.
            </p>
            <p className="text-slate-400 text-sm font-medium mb-2">Each round:</p>
            <ol className="text-slate-400 text-sm list-decimal list-inside space-y-2 mb-5 pl-1">
              <li>Each Pip starts with a PTR of 12%</li>
              <li>Neighboring Pips interact with each other (or don&apos;t)</li>
              <li>They reproduce</li>
              <li>PTRs reset to 12% for the next round. Repeat.</li>
            </ol>
            <p className="text-slate-400 text-sm font-medium mb-2">Also:</p>
            <ul className="text-slate-400 text-sm list-disc list-inside space-y-2 pl-1">
              <li>10% chance a Pip dies on each round</li>
              <li>0.5% chance a Pip&apos;s offspring mutates to a different type</li>
              <li>Empty cells: up to 1 new Pip added per round (immigration)</li>
            </ul>
          </div>
          <p className="text-slate-400 text-center max-w-xl">
            Watch how each strategy survives in isolation. Altruists and Ethnocentrics thrive. Egoists and Traitors go extinct — selfishness is a death sentence.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <MiniGrid phenotype="altruist" />
            <MiniGrid phenotype="ethnocentric" />
            <MiniGrid phenotype="egoist" />
            <MiniGrid phenotype="traitor" />
          </div>
          <p className="text-amber-400/90 text-sm text-center">
            Selfishness is a death sentence in isolation.
          </p>
        </div>
      </div>
      <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 z-10">
        <h3 className="text-sm font-semibold text-white mb-2 text-center">Parameters</h3>
        <div className="rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full text-xs table-fixed">
            <colgroup>
              <col className="w-28" />
              <col className="w-auto" />
            </colgroup>
            <thead>
              <tr className="bg-slate-800 text-slate-300">
                <th className="px-2 py-1.5 text-left font-medium">Param</th>
                <th className="px-2 py-1.5 text-left font-medium">What it does</th>
              </tr>
            </thead>
            <tbody>
              {PARAMETERS.map(({ param, description }) => (
                <tr key={param} className="border-t border-slate-700">
                  <td className="px-2 py-1.5 text-slate-200 font-medium">{param}</td>
                  <td className="px-2 py-1.5 text-slate-400">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
