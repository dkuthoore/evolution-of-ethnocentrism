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
          disabled={stage <= 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-slate-700 hover:bg-slate-600 text-white disabled:hover:bg-slate-700"
          aria-label="Previous stage"
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        <span className="text-sm text-slate-400 tabular-nums">
          Stage {stage} of {total}
        </span>
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
