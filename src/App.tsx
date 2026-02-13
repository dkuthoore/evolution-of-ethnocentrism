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

function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [hasCooperatedStage1, setHasCooperatedStage1] = useState(false);

  useEffect(() => {
    if (currentStage !== 1) setHasCooperatedStage1(false);
  }, [currentStage]);

  if (currentStage === 0) {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-900 text-white">
        <HomePage onExplore={() => setCurrentStage(1)} />
      </div>
    );
  }

  const useSymmetricLayout = currentStage >= 1;
  const showLegend = currentStage >= 2;
  const showParameters =
    currentStage >= 2 || (currentStage === 1 && hasCooperatedStage1);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-900 text-white">
      <HeaderLegend />
      <div className="relative flex min-h-0 flex-1">
        {showLegend && <SidebarLegend />}
        {showParameters && (
          <ParametersPanel
            stage={currentStage}
            showStage1Params={currentStage === 1 && hasCooperatedStage1}
          />
        )}
        <main
          className={`min-h-0 flex-1 overflow-auto ${useSymmetricLayout ? 'ml-72 mr-72' : ''}`}
        >
          {currentStage === 1 && (
            <Stage1Basics onCooperate={() => setHasCooperatedStage1(true)} />
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
