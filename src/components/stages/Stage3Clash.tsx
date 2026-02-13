import { useRef, useState, useCallback, useEffect } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import type { SimulationWidgetApi } from '../SimulationWidget';
import { SCENARIO_CLASH } from '../../lib/constants';
import type { Phenotype } from '../../lib/constants';

const PHENOTYPES: Phenotype[] = ['altruist', 'ethnocentric', 'egoist', 'traitor'];

export function Stage3Clash() {
  const [groupA, setGroupA] = useState<Phenotype>('altruist');
  const [groupB, setGroupB] = useState<Phenotype>('egoist');
  const simApiRef = useRef<SimulationWidgetApi | null>(null);
  const onReady = useCallback((api: SimulationWidgetApi) => {
    api.seedTwoGroups(groupA, groupB, 0.5);
  }, [groupA, groupB]);

  useEffect(() => {
    simApiRef.current?.seedTwoGroups(groupA, groupB, 0.5);
  }, [groupA, groupB]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-4 overflow-auto">
      <h2 className="text-2xl font-bold text-white">Stage 3: The Clash of Two</h2>
      <p className="text-slate-400 text-center max-w-xl">
        Choose two strategies. Altruist vs Egoist: egoists exploit, then go extinct. Ethnocentric vs Egoist: ethnocentrics form a wall. Try different combinations.
      </p>
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Group A</label>
          <select
            value={groupA}
            onChange={(e) => setGroupA(e.target.value as Phenotype)}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
          >
            {PHENOTYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Group B</label>
          <select
            value={groupB}
            onChange={(e) => setGroupB(e.target.value as Phenotype)}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
          >
            {PHENOTYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <SimulationWidget
        gridW={15}
        gridH={15}
        canvasSize={360}
        scenario={SCENARIO_CLASH}
        colorMode="strategy"
        speedIndex={2}
        showChart={false}
        enableParticles={true}
        simApiRef={simApiRef}
        onReady={onReady}
        onReset={() => simApiRef.current?.seedTwoGroups(groupA, groupB, 0.5)}
      />
    </div>
  );
}
