import { motion, useReducedMotion } from 'framer-motion';
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
  const reducedMotion = useReducedMotion();

  return (
    <aside
      className="absolute left-12 top-1/2 -translate-y-1/2 w-64 px-3 py-4 z-10"
      role="navigation"
      aria-label="Pip strategy legend"
    >
      <motion.div
        className="flex flex-col gap-2"
        initial="hidden"
        animate="visible"
        variants={
          reducedMotion
            ? undefined
            : {
                visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                hidden: {},
              }
        }
      >
        {LEGEND_ITEMS.map(({ phenotype, definition }) => (
          <motion.div
            key={phenotype}
            className="flex flex-col justify-center gap-1 rounded-lg bg-slate-800/90 px-3 py-2 h-14 border-l-2 border-slate-700 transition-colors duration-200"
            style={{ borderLeftColor: STRATEGY_COLORS[phenotype] }}
            role="listitem"
            variants={
              reducedMotion
                ? undefined
                : { hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }
            }
            transition={{ duration: 0.2 }}
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
            <span className="text-slate-200 text-xs">{definition}</span>
          </motion.div>
        ))}
      </motion.div>
    </aside>
  );
}
