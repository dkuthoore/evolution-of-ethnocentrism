const STAGE1_PARAMETERS = [
  { param: 'Cost', description: 'PTR −1% when donating. Giving is costly.' },
  { param: 'Benefit', description: 'PTR +3% when receiving. Receiving helps.' },
];

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
    <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 z-10">
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

export function ParametersPanel({
  stage,
  showStage1Params = false,
}: {
  stage: number;
  showStage1Params?: boolean;
}) {
  if (stage === 1 && showStage1Params) {
    return <ParametersTable parameters={STAGE1_PARAMETERS} colWidth="w-16" />;
  }
  if (stage === 2) {
    return <ParametersTable parameters={STAGE2_PARAMETERS} />;
  }
  return null;
}
