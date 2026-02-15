import { useRef, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PipBackground } from './PipBackground';

type HomePageProps = {
  onExplore: () => void;
};

const container = {
  hidden: { opacity: 0 },
  visible: (reduced: boolean) => ({
    opacity: 1,
    transition: reduced
      ? { duration: 0 }
      : { staggerChildren: 0.08, delayChildren: 0.06 },
  }),
};

const item = (reduced: boolean) => ({
  hidden: reduced ? undefined : { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  transition: { duration: reduced ? 0 : 0.25 },
});

export function HomePage({ onExplore }: HomePageProps) {
  const reducedMotion = useReducedMotion();
  const navalImageRef = useRef<HTMLDivElement>(null);
  const getStartedButtonRef = useRef<HTMLDivElement>(null);
  const obstacleRefs = useMemo(
    () => [navalImageRef, getStartedButtonRef],
    []
  );

  return (
    <div className="flex flex-1 flex-col relative">
      <PipBackground obstacleRefs={obstacleRefs} />
      <motion.div
        className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center"
        variants={container}
        initial="hidden"
        animate="visible"
        custom={!!reducedMotion}
      >
        <motion.div ref={navalImageRef} variants={item(!!reducedMotion)} className="max-w-xl w-full -mt-8">
          <img
            src="/naval.png"
            alt=""
            className="w-full rounded-lg shadow-lg block"
          />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold text-white"
          variants={item(!!reducedMotion)}
        >
          The Evolution of Ethnocentrism
        </motion.h1>
        <motion.p
          className="max-w-xl text-lg text-white"
          variants={item(!!reducedMotion)}
        >
          An interactive, educational web simulation exploring the Hammond & Axelrod (2006) paper{' '}
          <a
            href="https://artisresearch.com/files/articles/axelrod_evolution_of_ethnocentrism.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 underline hover:text-sky-300 transition-colors duration-150"
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
            className="text-sky-400 underline hover:text-sky-300 transition-colors duration-150"
          >
            Nicky Case's The Evolution of Trust
          </a>
          )
        </motion.p>
        <motion.div ref={getStartedButtonRef} variants={item(!!reducedMotion)}>
          <button
            type="button"
            onClick={onExplore}
            className="btn-interactive rounded-lg bg-sky-600 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Get Started!
          </button>
        </motion.div>
      </motion.div>
      <footer className="relative z-10 py-4 text-center text-sm text-slate-200">
      </footer>
    </div>
  );
}
