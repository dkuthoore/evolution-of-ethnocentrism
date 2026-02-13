import { useState } from 'react';
import { HeaderLegend } from './components/HeaderLegend';
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

function App() {
  const [currentStage, setCurrentStage] = useState(1);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-900 text-white">
      <HeaderLegend />
      <div className="flex flex-1 min-h-0 relative">
        <main className="flex-1 min-h-0 overflow-auto">
          {currentStage === 1 && <Stage1Basics />}
          {currentStage === 2 && <Stage2Homogeneous />}
          {currentStage === 3 && <Stage3Clash />}
          {currentStage === 4 && <Stage4Population />}
          {currentStage === 5 && <Stage5Evolution />}
          {currentStage === 6 && <Stage6GodMode />}
        </main>
        <SidebarLegend />
      </div>
      <FooterNav stage={currentStage} setStage={setCurrentStage} total={TOTAL_STAGES} />
    </div>
  );
}

export default App;
