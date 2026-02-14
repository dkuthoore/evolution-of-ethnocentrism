import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FooterNavProps {
  stage: number;
  setStage: (stage: number) => void;
  total: number;
}

export function FooterNav({ stage, setStage, total }: FooterNavProps) {
  return (
    <footer className="flex-shrink-0 border-t border-slate-700 bg-slate-900 px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
        <button
          onClick={() => setStage(stage - 1)}
          disabled={stage <= 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-slate-700 hover:bg-slate-600 text-white disabled:hover:bg-slate-700"
          aria-label="Previous stage"
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={stage} aria-valuemin={0} aria-valuemax={total} aria-label={`Stage ${stage} of ${total}`}>
          {Array.from({ length: total }, (_, i) => {
            const stageIndex = i + 1;
            const isFilled = stage >= stageIndex;
            const isCurrent = stage === stageIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setStage(stageIndex)}
                className={`h-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isFilled
                    ? isCurrent
                      ? 'w-8 bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]'
                      : 'w-2 bg-sky-600/90'
                    : 'w-2 bg-slate-600'
                }`}
                aria-label={`Go to stage ${stageIndex}`}
                title={`Stage ${stageIndex}`}
              />
            );
          })}
        </div>
        <button
          onClick={() => setStage(stage + 1)}
          disabled={stage >= total}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-slate-700 hover:bg-slate-600 text-white disabled:hover:bg-slate-700"
          aria-label="Next stage"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </footer>
  );
}
