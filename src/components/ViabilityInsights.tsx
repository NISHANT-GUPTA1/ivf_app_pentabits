import type { EmbryoResult } from '../types/embryo';

interface ViabilityInsightsProps {
  embryoData: EmbryoResult[];
}

export function ViabilityInsights({ embryoData }: ViabilityInsightsProps) {
  const avgScore = Math.round(
    embryoData.reduce((sum, e) => sum + e.viabilityScore, 0) / Math.max(embryoData.length, 1)
  );

  const topEmbryos = [...embryoData]
    .sort((a, b) => b.viabilityScore - a.viabilityScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">Transfer Planning</p>
          <h1 className="text-2xl font-bold text-gray-900">Viability Insights</h1>
          <p className="text-gray-500 text-sm">Scores, confidence, and prioritization for the current cohort.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-100">
            Avg viability: {avgScore}
          </div>
          <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">Export report</button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Prioritized Embryos</h2>
            <span className="text-xs text-gray-500">Top 5 by score</span>
          </div>
          <div className="divide-y divide-gray-100">
            {topEmbryos.map((embryo, idx) => (
              <div key={embryo.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{embryo.name}</div>
                    <div className="text-xs text-gray-500">{embryo.features.developmentalStage}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{embryo.viabilityScore}</div>
                  <div className="text-xs text-emerald-600 font-semibold">Ready for transfer</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Signals</h3>
            <span className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-md font-semibold border border-orange-100">Monitor</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 mt-1" />
              Variance in scores widening between Day 3 and Day 5; review outliers manually.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1" />
              Two embryos show plateaued expansion; consider extending culture check.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
              No major fragmentation alerts; fragmentation median within target range.
            </li>
          </ul>
          <button className="mt-4 w-full border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">
            View full alert log
          </button>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transfer Strategy</h3>
          <span className="text-xs text-gray-500">Draft recommendation</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <div className="text-xs font-semibold text-emerald-700 mb-1">Primary Candidate</div>
            <div className="text-sm font-bold text-gray-900">{topEmbryos[0]?.name ?? 'TBD'}</div>
            <p className="text-xs text-gray-600 mt-1">Optimal symmetry, strong TE score, high confidence.</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="text-xs font-semibold text-blue-700 mb-1">Backup</div>
            <div className="text-sm font-bold text-gray-900">{topEmbryos[1]?.name ?? 'TBD'}</div>
            <p className="text-xs text-gray-600 mt-1">Comparable score; minor fragmentation noted.</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-1">Notes</div>
            <p className="text-xs text-gray-700">Plan vitrification for remaining cohort after confirmation; sync with clinician for final sign-off.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
