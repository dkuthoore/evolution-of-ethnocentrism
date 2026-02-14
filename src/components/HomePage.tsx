type HomePageProps = {
  onExplore: () => void;
};

export function HomePage({ onExplore }: HomePageProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <img src="/naval.png" alt="" className="max-w-xl w-full rounded-lg shadow-lg -mt-8" />
        <h1 className="text-3xl font-bold text-white">The Evolution of Ethnocentrism</h1>
        <p className="max-w-xl text-lg text-white">
          An interactive, educational web simulation exploring the Hammond & Axelrod (2006) paper{' '}
          <a
            href="https://artisresearch.com/files/articles/axelrod_evolution_of_ethnocentrism.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 underline hover:text-sky-300"
          >
            <em>"The Evolution of Ethnocentrism"</em>
          </a>{' '}
          and its implications.
          <br />
          (inspired by{' '}
          <a
            href="https://ncase.me/trust/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 underline hover:text-sky-300"
          >
            Nicky Case's The Evolution of Trust
          </a>
          )
        </p>
        <button
          type="button"
          onClick={onExplore}
          className="rounded-lg bg-sky-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Get Started!
        </button>
      </div>
      <footer className="py-4 text-center text-sm text-slate-200">
        By: Damian Kuthoore, 2026
      </footer>
    </div>
  );
}
