import { COST, BENEFIT } from '../lib/constants';
import { CLASH_CASES, type ClashCaseId } from './stages/Stage3Clash';

/** Cell keys: A's action (c/d), B's action (c/d). */
export type Stage1MatrixCell = 'cc' | 'cd' | 'dc' | 'dd';

const NET_CC = BENEFIT - COST; // +0.02 when both cooperate

function PayoffMatrix({ revealedCells }: { revealedCells?: Set<Stage1MatrixCell> }) {
  const net = NET_CC.toFixed(2);
  const cost = COST.toFixed(2);
  const benefit = BENEFIT.toFixed(2);
  const empty = <span className="text-slate-500">—</span>;
  const show = (cell: Stage1MatrixCell) => revealedCells?.has(cell) ?? false;
  return (
    <div className="absolute right-24 top-1/2 -translate-y-1/2 w-64 z-10">
      <h3 className="text-sm font-semibold text-white mb-2 text-center">Payoff matrix (PTR change)</h3>
      <p className="text-xs text-slate-400 text-center mb-2">(A, B)</p>
      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-xs">
          <colgroup>
            <col className="w-24" />
            <col className="w-auto" />
            <col className="w-auto" />
          </colgroup>
          <thead>
            <tr className="bg-slate-800 text-slate-300">
              <th className="w-24" />
              <th className="px-2 py-2 text-center font-medium">B cooperates</th>
              <th className="px-2 py-2 text-center font-medium">B defects</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <tr className="border-t border-slate-700">
              <td className="px-2 py-2 bg-slate-800 text-slate-300 font-medium">A cooperates</td>
              <td className="px-2 py-2 text-center bg-slate-800/80">
                {show('cc') ? <span className="text-emerald-400">+{net}, +{net}</span> : empty}
              </td>
              <td className="px-2 py-2 text-center bg-slate-800/80">
                {show('cd') ? (
                  <><span className="text-rose-400">−{cost}</span>, <span className="text-emerald-400">+{benefit}</span></>
                ) : empty}
              </td>
            </tr>
            <tr className="border-t border-slate-700">
              <td className="px-2 py-2 bg-slate-800 text-slate-300 font-medium">A defects</td>
              <td className="px-2 py-2 text-center bg-slate-800/80">
                {show('dc') ? (
                  <><span className="text-emerald-400">+{benefit}</span>, <span className="text-rose-400">−{cost}</span></>
                ) : empty}
              </td>
              <td className="px-2 py-2 text-center bg-slate-800/80">
                {show('dd') ? <span className="text-slate-400">0, 0</span> : empty}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const STAGE2_PARAMETERS = [
  { param: 'Cost', description: 'PTR −1% when donating. Giving is costly.' },
  { param: 'Benefit', description: 'PTR +3% when receiving. Receiving helps.' },
  { param: 'BasePTR', description: 'PTR reset to 12% at start of each tick.' },
  { param: 'DeathRate', description: '10% chance per agent per tick to die. Creates space.' },
];

function ParametersTable({
  parameters,
  colWidth = 'w-28',
}: {
  parameters: { param: string; description: string }[];
  colWidth?: string;
}) {
  return (
    <div className="absolute right-24 top-1/2 -translate-y-1/2 w-64 z-10">
      <h3 className="text-sm font-semibold text-white mb-2 text-center">Parameters</h3>
      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-xs table-fixed">
          <colgroup>
            <col className={colWidth} />
            <col className="w-auto" />
          </colgroup>
          <thead>
            <tr className="bg-slate-800 text-slate-300">
              <th className="px-2 py-1.5 text-left font-medium">Param</th>
              <th className="px-2 py-1.5 text-left font-medium">What it does</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map(({ param, description }) => (
              <tr key={param} className="border-t border-slate-700">
                <td className="px-2 py-1.5 text-slate-200 font-medium">{param}</td>
                <td className="px-2 py-1.5 text-slate-400">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stage3CasePanel({
  selectedCaseId,
  onCaseChange,
}: {
  selectedCaseId: ClashCaseId;
  onCaseChange: (id: ClashCaseId) => void;
}) {
  const selectedCase = CLASH_CASES.find((c) => c.id === selectedCaseId) ?? CLASH_CASES[0];
  return (
    <div className="absolute right-24 top-1/2 -translate-y-1/2 w-64 z-10 max-h-[85vh] overflow-y-auto">
      <h3 className="text-sm font-semibold text-white mb-2 text-center">Case</h3>
      <select
        id="stage3-case"
        value={selectedCaseId}
        onChange={(e) => onCaseChange(e.target.value as ClashCaseId)}
        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white font-medium text-sm mb-4"
      >
        {CLASH_CASES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <div className="rounded-lg border border-slate-700 bg-slate-800/90 overflow-hidden space-y-0">
        <div className="px-3 py-2 border-b border-slate-700">
          <h4 className="text-xs font-semibold text-slate-300 mb-1">What happens</h4>
          <p className="text-slate-400 text-xs leading-relaxed">{selectedCase.whatHappens}</p>
        </div>
        <div className="px-3 py-2">
          <h4 className="text-xs font-semibold text-slate-300 mb-1">What this demonstrates</h4>
          <p className="text-slate-400 text-xs leading-relaxed">{selectedCase.implication}</p>
        </div>
      </div>
    </div>
  );
}

export function ParametersPanel({
  stage,
  stage1RevealedCells,
  stage3CaseId,
  onStage3CaseChange,
}: {
  stage: number;
  stage1RevealedCells?: Set<Stage1MatrixCell>;
  stage3CaseId?: ClashCaseId;
  onStage3CaseChange?: (id: ClashCaseId) => void;
}) {
  if (stage === 1) {
    return <PayoffMatrix revealedCells={stage1RevealedCells} />;
  }
  if (stage === 2) {
    return <ParametersTable parameters={STAGE2_PARAMETERS} />;
  }
  if (stage === 3 && stage3CaseId !== undefined && onStage3CaseChange) {
    return <Stage3CasePanel selectedCaseId={stage3CaseId} onCaseChange={onStage3CaseChange} />;
  }
  return null;
}
