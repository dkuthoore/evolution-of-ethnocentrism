export function Stage7Takeaways() {
  return (
    <div className="h-full flex flex-col px-4 py-6 overflow-auto">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <h2 className="text-2xl font-bold text-white text-center">Takeaways</h2>

        <section className="rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5 space-y-3">
          <h3 className="text-lg font-semibold text-white">Why this study matters</h3>
          <p className="text-slate-300 text-sm">
            The paper asks: <strong className="text-slate-200">why does ethnocentrism</strong> — favoring in-group members over out-group members — <strong className="text-slate-200">emerge and persist</strong>, even when it seems individually costly? Using a simple agent-based simulation, Axelrod and Hammond show that ethnocentric strategies consistently dominate. Ethnocentric agents form clusters of like-tagged cooperators that out-compete both unconditional cooperators (who get exploited) and defectors. The mechanism is <strong className="text-slate-200">spatial clustering</strong>: ethnocentrics are surrounded by similar agents, so they receive cooperation often while being protected from out-group defectors.
          </p>
          <p className="text-slate-300 text-sm">
            Importantly, ethnocentrism doesn’t require sophisticated cognition, culture, or genetic relatedness — it can emerge purely from the structure of local interaction and reproduction.
          </p>
        </section>

        <section className="rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5 space-y-3">
          <h3 className="text-lg font-semibold text-white">Implications</h3>
          <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside pl-1">
            <li><strong className="text-slate-200">Tags are meaningless.</strong> In the model, tags and strategies are assigned independently. A tag carries zero information about how an agent will behave — yet it still drives discrimination. Prejudice can be evolutionarily stable even when the basis for group distinctions is entirely superficial.</li>
            <li><strong className="text-slate-200">Ethnocentrism is not globally optimal.</strong> Universal cooperation would maximize total welfare. Ethnocentrism wastes defection at boundaries and locks the population into a lower-welfare equilibrium — like an arms race where neither side can unilaterally drop their guard.</li>
            <li><strong className="text-slate-200">The tag creates the reality.</strong> What wins is the ethnocentric strategy itself, not any particular tag. Once a tag exists and ethnocentric strategies cluster around it, the dynamic becomes self-sustaining regardless of whether the original distinction was meaningful.</li>
          </ul>
        </section>

        <section className="rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5 space-y-3">
          <h3 className="text-lg font-semibold text-white">Where this shows up in society</h3>
          <p className="text-slate-300 text-sm">
            The same structure — strong in-group cooperation, out-group defection, arbitrary tags — appears in many real settings:
          </p>
          <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside pl-1">
            <li><strong className="text-slate-200">Religion:</strong> Internal cooperation and costly signals (dietary laws, dress, rituals) act like tags; Mormons, Orthodox Jews, Amish.</li>
            <li><strong className="text-slate-200">Nationalism:</strong> Taxes, military service, welfare for co-nationals; borders and passports as tags.</li>
            <li><strong className="text-slate-200">Gangs:</strong> Colors, tattoos, symbols as literal tags; loyalty inside, defection outside.</li>
            <li><strong className="text-slate-200">Corporate tribalism:</strong> Team identity boosts cooperation inside, turf wars and information hoarding between teams.</li>
            <li><strong className="text-slate-200">Politics:</strong> Party identity (red vs. blue) has become a tag that drives positions; in-group cooperation (donations, hiring, benefit of the doubt) and out-group defection (affective polarization) match the model. Legislation with broad support can stall because cross-party cooperation is punished.</li>
            <li><strong className="text-slate-200">Sports fans, ethnic business networks, academic tribes:</strong> Same pattern — arbitrary markers enabling in-group trust and out-group boundaries.</li>
          </ul>
        </section>

        <section className="rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5 space-y-3">
          <h3 className="text-lg font-semibold text-white">How this differs from The Evolution of Trust</h3>
          <p className="text-slate-300 text-sm">
            <strong className="text-slate-200">The Evolution of Trust</strong> (Nicky Case’s interactive, from Axelrod’s tournament work) is about <strong className="text-slate-200">two players over repeated interactions</strong>. Repetition changes everything: when you’ll meet the same person again, cooperation can emerge through Tit-for-Tat and reputation. Trust is built or destroyed through a history of interactions; the shadow of the future makes cooperation rational.
          </p>
          <p className="text-slate-300 text-sm">
            <strong className="text-slate-200">The Evolution of Ethnocentrism</strong> strips that away. There are <strong className="text-slate-200">no repeated interactions</strong> — agents meet once, anonymously. So reputation, reciprocity, and punishment are absent. The puzzle is: how does cooperation emerge at all? The answer: <strong className="text-slate-200">population structure and tags substitute for repetition</strong>. You don’t need to remember your partner’s history if you can use their tag as a proxy; selection over generations does the rest.
          </p>
          <div className="rounded-lg border border-slate-600 overflow-hidden mt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800 text-slate-300">
                  <th className="px-3 py-2 text-left font-medium w-28">Aspect</th>
                  <th className="px-3 py-2 text-left font-medium">Evolution of Trust</th>
                  <th className="px-3 py-2 text-left font-medium">Evolution of Ethnocentrism</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-t border-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-300">Unit</td>
                  <td className="px-3 py-2">Two players, repeated interactions</td>
                  <td className="px-3 py-2">Whole population, one-shot interactions</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-300">Mechanism</td>
                  <td className="px-3 py-2">Reciprocity, reputation, punishment</td>
                  <td className="px-3 py-2">Tags, spatial clustering, selection</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-300">Insight</td>
                  <td className="px-3 py-2">Repetition makes cooperation rational</td>
                  <td className="px-3 py-2">Tags substitute for repetition</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-300">Explains</td>
                  <td className="px-3 py-2">Why you trust your long-term partner</td>
                  <td className="px-3 py-2">Why you help a stranger in your team’s jersey</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-300 text-sm mt-3">
            The two models are <strong className="text-slate-200">complementary</strong>. In the real world both operate: we use tags to find likely cooperators, then repeated interaction to build or destroy trust with specific individuals.
          </p>
        </section>
      </div>
    </div>
  );
}
