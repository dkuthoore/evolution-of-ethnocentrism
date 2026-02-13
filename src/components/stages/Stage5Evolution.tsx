import { useRef, useState, useCallback, useEffect } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import type { SimulationWidgetApi } from '../SimulationWidget';
import { DISTRIBUTION_PRESETS } from '../../lib/constants';
import { SCENARIO_STANDARD } from '../../lib/constants';

const GRID_SIZE = 25;
const CANVAS_SIZE = 400;
const FILL_RATIO = 0.5;

export function Stage5Evolution() {
  const [preset, setPreset] = useState<string>('Equal Mix');
  const simApiRef = useRef<SimulationWidgetApi | null>(null);
  const distribution = DISTRIBUTION_PRESETS[preset] ?? DISTRIBUTION_PRESETS['Equal Mix']!;

  const onReady = useCallback((api: SimulationWidgetApi) => {
    api.seedByDistribution(distribution, FILL_RATIO);
  }, [distribution]);

  useEffect(() => {
    simApiRef.current?.seedByDistribution(distribution, FILL_RATIO);
  }, [distribution]);

  return (
    <div className="h-full flex flex-col px-4 overflow-hidden">
      <h2 className="text-2xl font-bold text-white text-center mt-4 mb-2 shrink-0">Introducing Tags</h2>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-5 shrink-0 max-w-2xl">
          <div className="max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5 space-y-4">
            <p className="text-slate-300 text-center">
              So far, a pip&apos;s color has represented its strategy. Now we introduce the concept of <strong className="text-slate-200">tags</strong>. Tags are any characteristic that a demographic identifies with—religion, nationality, college, political party, sports team.
            </p>
            <p className="text-slate-300 text-center">
              Pips can see each other&apos;s tags (colors), but do not know each other&apos;s strategies. We highlight the ethnocentrists with a black dot in the center.
            </p>
          </div>
          <SimulationWidget
            gridW={GRID_SIZE}
            gridH={GRID_SIZE}
            canvasSize={CANVAS_SIZE}
            scenario={SCENARIO_STANDARD}
            colorMode="tags"
            speedIndex={4}
            showChart={false}
            enableHistory={false}
            enableParticles={false}
            playPauseVariant="greenRed"
            speedSliderVariant="index1To5"
            highlightPhenotype="ethnocentric"
            demographicsByTag={true}
            extraControls={
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm min-w-0 max-w-[160px] shrink-0"
              >
                {Object.keys(DISTRIBUTION_PRESETS).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            }
            simApiRef={simApiRef}
            onReady={onReady}
            onReset={() => simApiRef.current?.seedByDistribution(distribution, FILL_RATIO)}
          />
        </div>
      </div>
    </div>
  );
}
