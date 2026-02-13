import { useEffect, useState } from 'react';
import { HeaderLegend } from './components/HeaderLegend';
import { HomePage } from './components/HomePage';
import { ParametersPanel } from './components/ParametersPanel';
import { SidebarLegend } from './components/SidebarLegend';
import { FooterNav } from './components/FooterNav';
import {
  Stage1Basics,
  Stage2Homogeneous,
  Stage3Clash,
  Stage4Population,
  Stage5Evolution,
  Stage6GodMode,
} from './components/stages';

const TOTAL_STAGES = 6;

/** Symmetric side panels: main margin 18rem each side so legend/params sit closer to content (Tailwind ml-72/mr-72) */

import type { Stage1MatrixCell } from './components/ParametersPanel';

function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [stage1RevealedCells, setStage1RevealedCells] = useState<Set<Stage1MatrixCell>>(new Set());

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
  const showLegend = currentStage >= 2;
  const showParameters = currentStage >= 1;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-900 text-white">
      <HeaderLegend />
      <div className="relative flex min-h-0 flex-1">
        {showLegend && <SidebarLegend />}
        {showParameters && (
          <ParametersPanel
            stage={currentStage}
            stage1RevealedCells={currentStage === 1 ? stage1RevealedCells : undefined}
          />
        )}
        <main
          className={`min-h-0 flex-1 overflow-auto ${useSymmetricLayout ? 'ml-72 mr-72' : ''}`}
        >
          {currentStage === 1 && (
            <Stage1Basics onScenarioClick={revealStage1Cell} />
          )}
          {currentStage === 2 && <Stage2Homogeneous />}
          {currentStage === 3 && <Stage3Clash />}
          {currentStage === 4 && <Stage4Population />}
          {currentStage === 5 && <Stage5Evolution />}
          {currentStage === 6 && <Stage6GodMode />}
        </main>
      </div>
      <FooterNav stage={currentStage} setStage={setCurrentStage} total={TOTAL_STAGES} />
    </div>
  );
}

export default App;
