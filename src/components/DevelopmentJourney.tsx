import type { EmbryoResult } from '../types/embryo';

interface DevelopmentJourneyProps {
  embryoData: EmbryoResult[];
}

const milestones = [
  { label: 'Day 0-1', detail: 'Fertilization & Pronuclei', status: 'complete' },
  { label: 'Day 2-3', detail: 'Cleavage & Compaction', status: 'complete' },
  { label: 'Day 4', detail: 'Morula Check', status: 'in-progress' },
  { label: 'Day 5', detail: 'Early Blastocyst', status: 'pending' },
  { label: 'Day 5-6', detail: 'Expanded Blastocyst', status: 'pending' },
];

export function DevelopmentJourney({ embryoData }: DevelopmentJourneyProps) {
  if (embryoData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Development Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload embryo images to track developmental milestones
          </p>
        </div>
      </div>
    );
  }
  
  const stageCounts = embryoData.reduce<Record<string, number>>((acc, embryo) => {
    const stage = embryo.features.developmentalStage || 'Unspecified';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Cycle Map</p>
          <h1 className="text-2xl font-bold text-gray-900">Development Journey</h1>
          <p className="text-gray-500 text-sm">Track cohort progression against expected milestones.</p>
        </div>
        <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium border border-green-100">
          {embryoData.length} embryos monitored
        </div>
      </header>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Milestone Timeline</h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Real-time
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {milestones.map((step, idx) => (
            <div
              key={step.label}
              className={`relative p-4 rounded-lg border ${
                step.status === 'complete'
                  ? 'border-green-200 bg-green-50'
                  : step.status === 'in-progress'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-xs font-semibold text-gray-500">{step.label}</div>
              <div className="font-semibold text-gray-900">{step.detail}</div>
              <div className="mt-2 flex items-center gap-2 text-xs font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    step.status === 'complete'
                      ? 'bg-green-500'
                      : step.status === 'in-progress'
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-400'
                  }`}
                />
                {step.status === 'complete' && 'Completed'}
                {step.status === 'in-progress' && 'In progress'}
                {step.status === 'pending' && 'Pending'}
              </div>
              {idx < milestones.length - 1 && (
                <div className="hidden lg:block absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-[1px] bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Stage Mix</h3>
            <span className="text-xs text-gray-500">Live cohort</span>
          </div>
          <div className="space-y-3">
            {Object.entries(stageCounts).map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{stage}</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{ width: `${Math.min(100, (count / embryoData.length) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Readiness & Risks</h3>
            <span className="text-xs text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded-md font-medium">
              Watchlist
            </span>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 mt-1" />
              62% of embryos are at or ahead of expected pace for Day 5 blastulation.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
              3 embryos flagged for delayed compaction; recommend re-check in 4 hours.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 mt-1" />
              Observe one morula with asymmetric cell mass; manual review suggested.
            </li>
          </ul>
          <button className="mt-4 w-full border border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">
            Export development snapshot
          </button>
        </div>
      </section>
    </div>
  );
}
