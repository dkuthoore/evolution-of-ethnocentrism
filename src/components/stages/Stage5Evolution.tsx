import { useState } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import { SCENARIO_STANDARD, SCENARIO_CLASH } from '../../lib/constants';

export function Stage5Evolution() {
  const [scenario, setScenario] = useState<'standard' | 'clash'>('standard');

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-4 overflow-auto">
      <h2 className="text-2xl font-bold text-white">The Grand Evolution</h2>
      <p className="text-slate-400 text-center max-w-xl">
        Until now, color meant strategy. In nature, behavior is hidden in genes. What if anyone can mutate into anything? Ethnocentrism emerges even from a blank slate.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => setScenario('standard')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            scenario === 'standard' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          Standard (Random Mutation)
        </button>
        <button
          onClick={() => setScenario('clash')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            scenario === 'clash' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          Clash (Color = Strategy)
        </button>
      </div>
      <SimulationWidget
        gridW={50}
        gridH={50}
        canvasSize={400}
        scenario={scenario}
        colorMode="tags"
        speedIndex={4}
        showChart={true}
        enableHistory={true}
        enableParticles={false}
      />
    </div>
  );
}
