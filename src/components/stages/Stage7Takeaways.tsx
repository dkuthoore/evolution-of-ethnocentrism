import { useState } from 'react';

type AccordionId = 'why-matters' | 'implications' | 'where-shows-up' | 'evolution-of-trust' | null;

export function Stage7Takeaways() {
  const [expandedId, setExpandedId] = useState<AccordionId>(null);

  const toggle = (id: AccordionId) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="h-full flex flex-col px-4 overflow-hidden">
      <div className="shrink-0 pt-4 h-16">
        <h2 className="text-2xl font-bold text-white text-center">Summary</h2>
      </div>
      <div className="flex-1 min-h-0 overflow-auto py-6 scrollbar-hide">
        <div className="max-w-2xl mx-auto w-full space-y-2">

        <section className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('why-matters')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
            aria-expanded={expandedId === 'why-matters'}
          >
            <h3 className="text-lg font-semibold text-white">Why this study matters</h3>
            <span className="text-white shrink-0 ml-2" aria-hidden>
              {expandedId === 'why-matters' ? '▼' : '▶'}
            </span>
          </button>
          {expandedId === 'why-matters' && (
            <div className="px-6 pb-5 pt-0 space-y-3 border-t border-slate-700">
          <p className="text-white text-sm pt-3">
            Most explanations for tribalism assume it requires something real — shared ancestry, common beliefs, a genuine threat from outsiders. This paper challenges that assumption. Using a simple computer simulation, Axelrod and Hammond show that in-group favoritism doesn&apos;t need any of that. It can emerge spontaneously, from nothing more than arbitrary group labels and the basic logic of cooperation and competition.
          </p>
          <p className="text-white text-sm">
            The mechanism is surprisingly simple: agents who cooperate with their own group and defect against others tend to cluster together, which means they receive cooperation often while being shielded from exploitation. Over time, this strategy out-competes both unconditional cooperators (who get taken advantage of) and unconditional defectors (who cooperate with no one). No culture, no cognition, no kinship required — just a tag and a population.
          </p>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('implications')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
            aria-expanded={expandedId === 'implications'}
          >
            <h3 className="text-lg font-semibold text-white">Implications</h3>
            <span className="text-white shrink-0 ml-2" aria-hidden>
              {expandedId === 'implications' ? '▼' : '▶'}
            </span>
          </button>
          {expandedId === 'implications' && (
            <div className="px-6 pb-5 pt-0 border-t border-slate-700 space-y-4 pt-3">
          <p className="text-white text-sm">
            <strong className="text-slate-200">The tag doesn&apos;t need to mean anything.</strong> In the model, tags and strategies are assigned independently and randomly. A tag carries zero information about how an agent will actually behave — yet it still drives discrimination and shapes who cooperates with whom. This is the paper&apos;s most unsettling finding: prejudice can become evolutionarily stable even when the basis for group distinction is entirely arbitrary. The tag doesn&apos;t reflect a real difference. It creates one.
          </p>
          <p className="text-white text-sm">
            <strong className="text-slate-200">Tribalism is not globally optimal — just competitively stable.</strong> Universal cooperation would produce the best outcome for everyone. Tribalism wastes enormous value at group boundaries — every cross-group interaction that defaults to defection is a missed opportunity for mutual gain. But once tribalism takes hold, no individual can unilaterally abandon it without being exploited. The population gets locked into a worse equilibrium, like an arms race where both sides would be better off disarming but neither can go first.
          </p>
          <p className="text-white text-sm">
            <strong className="text-slate-200">Evolution doesn&apos;t optimize for the common good.</strong> What wins in the simulation isn&apos;t what&apos;s best for the group as a whole — it&apos;s what&apos;s hardest to exploit. That distinction matters enormously for how we think about human nature. Our tribal instincts aren&apos;t a design flaw or a cultural artifact. They&apos;re the predictable output of a selection process that rewards competitive survival, not collective flourishing.
          </p>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('where-shows-up')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
            aria-expanded={expandedId === 'where-shows-up'}
          >
            <h3 className="text-lg font-semibold text-white">Where this shows up in society</h3>
            <span className="text-white shrink-0 ml-2" aria-hidden>
              {expandedId === 'where-shows-up' ? '▼' : '▶'}
            </span>
          </button>
          {expandedId === 'where-shows-up' && (
            <div className="px-6 pb-5 pt-0 border-t border-slate-700 space-y-4 pt-3">
          <p className="text-white text-sm">
            Once you see the pattern — arbitrary tag, in-group cooperation, out-group defection, self-reinforcing dynamic — it&apos;s hard to unsee it. It appears across vastly different contexts, which is what makes the model so powerful.
          </p>
          <p className="text-white text-sm">
            <strong className="text-slate-200">Religion</strong> uses costly signals (dietary laws, dress codes, rituals) as tags. These signals are expensive enough that only committed members maintain them, which makes them reliable filters for finding trustworthy cooperators. The result is tight internal solidarity and sharp boundaries against outsiders.
          </p>
          <p className="text-white text-sm">
            <strong className="text-slate-200">Nationalism</strong> scales the same logic to the level of states. Citizens accept significant personal costs — taxes, military service, civic obligations — for co-nationals they&apos;ll never meet, while extending far less to foreigners. Borders and passports are institutional tags.
          </p>
          <p className="text-white text-sm">
            <strong className="text-slate-200">Politics</strong> may be the most striking contemporary example. Party identity has become a tag that precedes and shapes policy views, rather than following from them. People update their positions to match their team. In-group cooperation is real and tangible — donations, hiring, professional loyalty — and out-group hostility has intensified far faster than actual policy disagreement. Legislation with broad public support stalls because cross-party cooperation would mean giving the other side a win. The system produces less than it could, exactly as the model predicts.
          </p>
          <p className="text-white text-sm">
            <strong className="text-slate-200">Academic and intellectual tribes.</strong> Schools of thought in academia — Keynesian vs. monetarist economists, Freudians vs. behaviorists — show strong in-group citation, mutual promotion, and coordinated skepticism toward outsiders. Researchers genuinely cooperate more with tag-mates and are harsher reviewers of out-group work, even when they&apos;d deny doing so.
          </p>
          <p className="text-white text-sm">
            <strong className="text-slate-200">Gangs, corporate teams, sports fans, ethnic business networks</strong> all follow the same structure — arbitrary or semi-arbitrary markers enabling in-group trust and out-group exclusion. The content of the tag varies wildly. The dynamic is always the same.
          </p>
          <p className="text-white text-sm">
            In each case, an initially small or arbitrary distinction can get weaponized or institutionalized. Cooperative clusters form around it and the dynamic becomes self-sustaining. Once that happens, the tag starts doing real social work — shaping who you marry, who you hire, who you trust, who you fear — which makes it feel increasingly real and meaningful even though it may have started from almost nothing. The model predicts exactly this: you don&apos;t need a meaningful tag to start the process, but once the process starts, the tag becomes meaningful.
          </p>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('evolution-of-trust')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
            aria-expanded={expandedId === 'evolution-of-trust'}
          >
            <h3 className="text-lg font-semibold text-white">How this differs from The Evolution of Trust</h3>
            <span className="text-white shrink-0 ml-2" aria-hidden>
              {expandedId === 'evolution-of-trust' ? '▼' : '▶'}
            </span>
          </button>
          {expandedId === 'evolution-of-trust' && (
            <div className="px-6 pb-5 pt-0 border-t border-slate-700 space-y-4 pt-3">
          <p className="text-white text-sm">
            These two models are often discussed together, but they&apos;re solving fundamentally different problems.
          </p>
          <p className="text-white text-sm">
            <strong className="text-slate-200">The Evolution of Trust</strong> is about what happens between two specific people over time. Repeated interaction changes the math of cooperation entirely — if you&apos;ll meet the same person again, defecting today has consequences tomorrow. Strategies like Tit-for-Tat work because the future casts a shadow over the present. Trust is earned or destroyed through history between particular individuals.
          </p>
          <p className="text-white text-sm">
            <strong className="text-slate-200">The Evolution of Ethnocentrism</strong> strips all of that away. Agents meet once, anonymously, and never again. There&apos;s no reputation, no memory, no possibility of punishment or forgiveness. The question becomes: how does cooperation emerge at all without any of those mechanisms? The answer is that <strong className="text-slate-200">tags and population structure substitute for repeated interaction</strong>. You don&apos;t need your partner&apos;s history if their tag gives you a proxy. Selection over generations does the work that memory and punishment do in the repeated game.
          </p>
          <div className="rounded-lg border border-slate-600 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-3 py-2 text-left font-medium w-28" />
                  <th className="px-3 py-2 text-left font-medium">Evolution of Trust</th>
                  <th className="px-3 py-2 text-left font-medium">Evolution of Ethnocentrism</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-t border-slate-700">
                  <td className="px-3 py-2 font-medium text-white">Setup</td>
                  <td className="px-3 py-2">Two players, repeated interactions</td>
                  <td className="px-3 py-2">Whole population, one-shot interactions</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="px-3 py-2 font-medium text-white">Cooperation mechanism</td>
                  <td className="px-3 py-2">Reciprocity, reputation, punishment</td>
                  <td className="px-3 py-2">Tags, spatial clustering, selection</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="px-3 py-2 font-medium text-white">Core insight</td>
                  <td className="px-3 py-2">Repetition makes cooperation rational</td>
                  <td className="px-3 py-2">Tags substitute for repetition</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="px-3 py-2 font-medium text-white">Explains</td>
                  <td className="px-3 py-2">Why you trust your long-term partner</td>
                  <td className="px-3 py-2">Why you help a stranger wearing your team&apos;s jersey</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-white text-sm">
            The two models are complementary rather than competing. In real life both operate at once — we use tags to identify likely cooperators, then build or destroy actual trust through repeated experience with specific individuals. The first explains your relationship with a colleague you&apos;ve known for years. The second explains why you felt an instant bond with a stranger at the airport wearing your university&apos;s sweatshirt.
          </p>
            </div>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}
