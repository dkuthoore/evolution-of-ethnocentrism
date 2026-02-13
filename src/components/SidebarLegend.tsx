import { STRATEGY_COLORS } from '../lib/constants';
import type { Phenotype } from '../lib/constants';

const PHENOTYPE_LABELS: Record<Phenotype, string> = {
  altruist: 'Altruist',
  ethnocentric: 'Ethnocentrist',
  egoist: 'Egoist',
  traitor: 'Traitor',
};

const LEGEND_ITEMS: { phenotype: Phenotype; definition: string }[] = [
  { phenotype: 'altruist', definition: 'Helps everyone' },
  { phenotype: 'ethnocentric', definition: 'Helps same color, ignores others' },
  { phenotype: 'egoist', definition: 'Helps no one' },
  { phenotype: 'traitor', definition: 'Ignores same color, helps others' },
];

export function SidebarLegend() {
  return (
    <aside
      className="absolute left-24 top-1/2 -translate-y-1/2 w-64 px-3 py-4 z-10"
      role="navigation"
      aria-label="Pip strategy legend"
    >
      <div className="flex flex-col gap-2">
        {LEGEND_ITEMS.map(({ phenotype, definition }) => (
          <div
            key={phenotype}
            className="flex flex-col justify-center gap-1 rounded-lg bg-slate-800 px-3 py-2 h-14"
            role="listitem"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: STRATEGY_COLORS[phenotype] }}
                aria-hidden
              />
              <span
                className="font-medium text-sm"
                style={{ color: STRATEGY_COLORS[phenotype] }}
              >
                {PHENOTYPE_LABELS[phenotype]}
              </span>
            </div>
            <span className="text-slate-500 text-xs">{definition}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
