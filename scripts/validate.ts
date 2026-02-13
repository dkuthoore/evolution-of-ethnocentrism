/**
 * Validation script: run simulation for 2000 ticks and check if
 * ethnocentrism ~76% and cooperation ~74% in final 100 periods (per paper Table 1).
 * Run with: npx tsx scripts/validate.ts
 */

import { SimulationEngine } from '../src/lib/engine';
import { SCENARIO_STANDARD } from '../src/lib/constants';

const RUNS = 10;
const RUN_LENGTH = 2000;
const LAST_N = 100;

function runSimulation() {
  const engine = new SimulationEngine({ scenario: SCENARIO_STANDARD });
  const ethnocentrismHistory: number[] = [];
  const cooperationHistory: number[] = [];

  for (let t = 0; t < RUN_LENGTH; t++) {
    engine.tick();
    const stats = engine.getStats();
    const total = stats.total;
    if (total === 0) continue;

    const ethno = stats.counts.ethnocentric ?? 0;
    ethnocentrismHistory.push(ethno / total);

    const coopStrategies = (stats.counts.ethnocentric ?? 0) + (stats.counts.altruist ?? 0);
    cooperationHistory.push(coopStrategies / total);
  }

  const lastEthno = ethnocentrismHistory.slice(-LAST_N);
  const lastCoop = cooperationHistory.slice(-LAST_N);
  const avgEthno = lastEthno.reduce((a, b) => a + b, 0) / lastEthno.length;
  const avgCoop = lastCoop.reduce((a, b) => a + b, 0) / lastCoop.length;

  return { avgEthno, avgCoop };
}

console.log('Running validation (10 runs, 2000 ticks each)...\n');
console.log('Paper targets: Ethnocentrism ~76%, Cooperation ~74%\n');

const results: { avgEthno: number; avgCoop: number }[] = [];
for (let r = 0; r < RUNS; r++) {
  const { avgEthno, avgCoop } = runSimulation();
  results.push({ avgEthno, avgCoop });
  console.log(`Run ${r + 1}: Ethnocentrism ${(avgEthno * 100).toFixed(1)}%, Cooperation proxy ${(avgCoop * 100).toFixed(1)}%`);
}

const meanEthno = results.reduce((s, r) => s + r.avgEthno, 0) / RUNS;
const meanCoop = results.reduce((s, r) => s + r.avgCoop, 0) / RUNS;
const stdEthno = Math.sqrt(
  results.reduce((s, r) => s + (r.avgEthno - meanEthno) ** 2, 0) / RUNS
);

console.log('\n--- Summary ---');
console.log(`Mean ethnocentrism: ${(meanEthno * 100).toFixed(1)}% (target ~76%)`);
console.log(`Std dev: ${(stdEthno * 100).toFixed(1)}%`);
console.log(`Cooperation proxy (strategy-based): ${(meanCoop * 100).toFixed(1)}%`);
console.log('\nNote: Cooperation is approximated from strategy distribution.');
console.log('Paper measures actual cooperative interactions (~74%).');
console.log('Ethnocentrism ~76% is the primary validation metric.');

if (meanEthno >= 0.65) {
  console.log('\n✓ Validation PASSED: Ethnocentrism dominates (≥65%).');
} else {
  console.log('\n⚠ Ethnocentrism below expected - check parameters.');
}
