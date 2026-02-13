import { useRef, useState, useCallback, useEffect } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import type { SimulationWidgetApi } from '../SimulationWidget';
import { DISTRIBUTION_PRESETS } from '../../lib/constants';
import type { Distribution } from '../../lib/constants';

export function Stage4Population() {
  const [preset, setPreset] = useState<string>('Equal Mix');
  const simApiRef = useRef<SimulationWidgetApi | null>(null);

  const distribution = DISTRIBUTION_PRESETS[preset] ?? DISTRIBUTION_PRESETS['Equal Mix']!;

  const onReady = useCallback((api: SimulationWidgetApi) => {
    api.seedByDistribution(distribution);
  }, [distribution]);

  useEffect(() => {
    simApiRef.current?.seedByDistribution(distribution);
  }, [distribution]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-4 overflow-auto">
      <h2 className="text-2xl font-bold text-white">Stage 4: Population Dynamics</h2>
      <p className="text-slate-400 text-center max-w-xl">
        The full 50×50 grid. Choose a starting distribution and hit Reset Board. Watch how the mix evolves over time.
      </p>
      <SimulationWidget
        gridW={50}
        gridH={50}
        canvasSize={400}
        colorMode="strategy"
        speedIndex={4}
        showChart={true}
        enableHistory={true}
        enableParticles={true}
        extraControls={
          <div className="flex gap-2 items-center">
            <label className="text-sm text-slate-400">Starting distribution</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              {Object.keys(DISTRIBUTION_PRESETS).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
        }
        simApiRef={simApiRef}
        onReady={onReady}
        onReset={() => simApiRef.current?.seedByDistribution(distribution)}
      />
    </div>
  );
}
