import { useRef, useState, useCallback, useEffect } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import type { SimulationWidgetApi } from '../SimulationWidget';
import { SCENARIO_CLASH } from '../../lib/constants';
import { STRATEGY_COLORS, type Phenotype } from '../../lib/constants';

const PHENOTYPES: Phenotype[] = ['altruist', 'ethnocentric', 'egoist', 'traitor'];

const PHENOTYPE_LABELS: Record<Phenotype, string> = {
  altruist: 'Altruist',
  ethnocentric: 'Ethnocentrist',
  egoist: 'Egoist',
  traitor: 'Traitor',
};

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
    <div className="h-full flex flex-col px-4 overflow-hidden relative">
      <h2 className="text-2xl font-bold text-white text-center mt-4 mb-2 shrink-0">The Clash of Two</h2>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-5 shrink-0">
          <div className="max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5">
            <p className="text-slate-300 text-center mb-3">
              What happens when <em>two</em> strategies share the same grid? Pick Group A and Group B and hit Play.
            </p>
            <p className="text-slate-400 text-sm text-center">
              <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span> vs{' '}
              <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span>: egoists exploit at first, then go extinct when cooperators disappear.{' '}
              <span style={{ color: STRATEGY_COLORS.ethnocentric }}>Ethnocentrists</span> vs{' '}
              <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span>: ethnocentrists cooperate with their own and form a wall. Try different pairs and see who wins.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Group A</label>
              <select
                value={groupA}
                onChange={(e) => setGroupA(e.target.value as Phenotype)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white font-medium min-w-[8rem]"
                style={{ color: STRATEGY_COLORS[groupA] }}
              >
                {PHENOTYPES.map((p) => (
                  <option key={p} value={p}>{PHENOTYPE_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Group B</label>
              <select
                value={groupB}
                onChange={(e) => setGroupB(e.target.value as Phenotype)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white font-medium min-w-[8rem]"
                style={{ color: STRATEGY_COLORS[groupB] }}
              >
                {PHENOTYPES.map((p) => (
                  <option key={p} value={p}>{PHENOTYPE_LABELS[p]}</option>
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
            speedIndex={4}
            showChart={false}
            showSpeed={true}
            enableParticles={true}
            playPauseVariant="greenRed"
            simApiRef={simApiRef}
            onReady={onReady}
            onReset={() => simApiRef.current?.seedTwoGroups(groupA, groupB, 0.5)}
          />
        </div>
      </div>
    </div>
  );
}
