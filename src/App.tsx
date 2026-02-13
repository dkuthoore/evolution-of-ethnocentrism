import { useEffect, useState } from 'react';
import { HeaderLegend } from './components/HeaderLegend';
import { HomePage } from './components/HomePage';
import { ParametersPanel, Stage1LeftPanel } from './components/ParametersPanel';
import { SidebarLegend } from './components/SidebarLegend';
import { FooterNav } from './components/FooterNav';
import { DEFAULT_PARAMS } from './lib/constants';
import type { SimulationParams } from './lib/constants';
import {
  Stage1Basics,
  Stage2Homogeneous,
  Stage3Clash,
  Stage4Population,
  Stage5Evolution,
  Stage6GodMode,
  Stage7Takeaways,
} from './components/stages';

const TOTAL_STAGES = 7;

/** Symmetric side panels: panels at left-24/right-24 (6rem), width 16rem; main margin 22rem (ml-88/mr-88) so content starts where panels end. */

import type { Stage1MatrixCell } from './components/ParametersPanel';
import type { ClashCaseId } from './components/stages/Stage3Clash';

function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [stage1RevealedCells, setStage1RevealedCells] = useState<Set<Stage1MatrixCell>>(new Set());
  const [stage3CaseId, setStage3CaseId] = useState<ClashCaseId>('altruist-vs-egoist');
  const [stage6Params, setStage6Params] = useState<SimulationParams>(() => ({ ...DEFAULT_PARAMS }));

  useEffect(() => {
    if (currentStage !== 1) setStage1RevealedCells(new Set());
  }, [currentStage]);

  const revealStage1Cell = (cell: Stage1MatrixCell) => {
    setStage1RevealedCells((prev) => new Set(prev).add(cell));
  };

  if (currentStage === 0) {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-900 text-white">
        <HomePage onExplore={() => setCurrentStage(1)} />
      </div>
    );
  }

  const useSymmetricLayout = currentStage >= 1;
  const showLegend = currentStage >= 2 && currentStage !== 5;
  const showParameters = currentStage >= 1;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-900 text-white">
      <HeaderLegend />
      <div className="relative flex min-h-0 flex-1">
        {currentStage === 1 && <Stage1LeftPanel revealedCells={stage1RevealedCells} />}
        {showLegend && <SidebarLegend />}
        {showParameters && (
          <ParametersPanel
            stage={currentStage}
            stage1RevealedCells={currentStage === 1 ? stage1RevealedCells : undefined}
            stage3CaseId={currentStage === 3 ? stage3CaseId : undefined}
            onStage3CaseChange={currentStage === 3 ? setStage3CaseId : undefined}
            stage6Params={currentStage === 6 ? stage6Params : undefined}
            onStage6ParamsChange={currentStage === 6 ? setStage6Params : undefined}
          />
        )}
        <main
          className={`flex min-h-0 flex-1 flex-col overflow-hidden ${useSymmetricLayout ? 'ml-88 mr-88' : ''}`}
        >
          {currentStage === 1 && (
            <Stage1Basics onScenarioClick={revealStage1Cell} />
          )}
          {currentStage === 2 && <Stage2Homogeneous />}
          {currentStage === 3 && (
            <Stage3Clash
              selectedCaseId={stage3CaseId}
              onCaseChange={setStage3CaseId}
            />
          )}
          {currentStage === 4 && <Stage4Population />}
          {currentStage === 5 && <Stage5Evolution />}
          {currentStage === 6 && <Stage6GodMode params={stage6Params} />}
          {currentStage === 7 && <Stage7Takeaways />}
        </main>
      </div>
      <FooterNav stage={currentStage} setStage={setCurrentStage} total={TOTAL_STAGES} />
    </div>
  );
}

export default App;
