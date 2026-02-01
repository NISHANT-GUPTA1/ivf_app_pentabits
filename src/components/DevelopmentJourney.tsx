import { useState } from 'react';
import type { EmbryoResult } from '../types/embryo';
import { Filter } from 'lucide-react';

interface DevelopmentJourneyProps {
  embryoData: EmbryoResult[];
}

export function DevelopmentJourney({ embryoData }: DevelopmentJourneyProps) {
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  
  // Filter out placeholder embryo
  const realEmbryos = embryoData.filter(e => e.id !== 'placeholder-embryo');
  
  // Filter by selected development day
  const filteredEmbryos = selectedDay === 'all' 
    ? realEmbryos 
    : realEmbryos.filter(e => e.developmentDay === selectedDay);
  
  // Group embryos by development day
  const embryosByDay = realEmbryos.reduce<Record<number, EmbryoResult[]>>((acc, embryo) => {
    const day = embryo.developmentDay || 5;
    if (!acc[day]) acc[day] = [];
    acc[day].push(embryo);
    return acc;
  }, {});
  
  // Determine milestone status dynamically based on actual uploaded development days
  // Check which days have embryos uploaded
  const uploadedDays = new Set(realEmbryos.map(e => e.developmentDay).filter(Boolean));
  
  // Map day ranges to specific day numbers for checking
  const dayRangeMapping: Record<number, number[]> = {
    1: [0, 1], // Day 0-1
    2: [2, 3], // Day 2-3
    3: [4],    // Day 4
    4: [5],    // Day 5 (Early Blastocyst)
    5: [5, 6], // Day 5-6 (Expanded Blastocyst)
  };
  
  // Helper function to check if a milestone has uploaded embryos
  const hasDayUploaded = (milestoneStage: number): boolean => {
    const daysForMilestone = dayRangeMapping[milestoneStage] || [];
    return daysForMilestone.some(day => uploadedDays.has(day));
  };
  
  const milestones = [
    { label: 'Day 0-1', detail: 'Fertilization & Pronuclei', stage: 1, status: hasDayUploaded(1) ? 'complete' : 'pending' },
    { label: 'Day 2-3', detail: 'Cleavage & Compaction', stage: 2, status: hasDayUploaded(2) ? 'complete' : 'pending' },
    { label: 'Day 4', detail: 'Morula Check', stage: 3, status: hasDayUploaded(3) ? 'complete' : 'pending' },
    { label: 'Day 5', detail: 'Early Blastocyst', stage: 4, status: hasDayUploaded(4) ? 'complete' : 'pending' },
    { label: 'Day 5-6', detail: 'Expanded Blastocyst', stage: 5, status: hasDayUploaded(5) ? 'complete' : 'pending' },
  ];
  
  const stageCounts = filteredEmbryos.reduce<Record<string, number>>((acc, embryo) => {
    // Use real-time comprehensiveAnalysis data if available, otherwise fallback
    const stage = embryo.comprehensiveAnalysis?.morphokinetics?.estimated_developmental_stage 
      || embryo.features.developmentalStage 
      || 'Unspecified';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
            <p className="text-sm font-semibold text-teal-medical">Cycle Map</p>
            <h1 className="text-2xl font-bold text-charcoal">Development Journey</h1>
            <p className="text-charcoal/60 text-sm">Track cohort progression against expected milestones.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Day Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Filter by Day:</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent border-none text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Days</option>
              {Object.keys(embryosByDay).sort((a, b) => Number(a) - Number(b)).map(day => (
                <option key={day} value={day}>Day {day} ({embryosByDay[Number(day)].length})</option>
              ))}
            </select>
          </div>
          <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium border border-green-100">
            {filteredEmbryos.length} embryos {selectedDay !== 'all' ? `(Day ${selectedDay})` : 'monitored'}
          </div>
        </div>
      </header>

        <section className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal">Milestone Timeline</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blush text-teal-medical border border-lavender">
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
                    ? 'border-lavender bg-blush'
                    : 'border-[#E6E6E6] bg-blush'
              }`}
            >
                <div className="text-xs font-semibold text-charcoal/60">{step.label}</div>
                <div className="font-semibold text-charcoal">{step.detail}</div>
              <div className="mt-2 flex items-center gap-2 text-xs font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    step.status === 'complete'
                      ? 'bg-green-500'
                      : step.status === 'in-progress'
                        ? 'bg-teal-medical animate-pulse'
                        : 'bg-charcoal/40'
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
          <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal">Current Stage Mix</h3>
              <span className="text-xs text-charcoal/60">Live cohort {selectedDay !== 'all' ? `- Day ${selectedDay}` : ''}</span>
          </div>
          {filteredEmbryos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-2">No embryo data{selectedDay !== 'all' ? ` for Day ${selectedDay}` : ' yet'}</p>
              <p className="text-xs text-gray-400">Upload images to track developmental stages</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stageCounts).map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-medical" />
                <div className="flex-1">
                    <div className="text-sm font-medium text-charcoal">{stage}</div>
                    <div className="h-2 bg-blush rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-teal-medical to-lavender"
                      style={{ width: `${Math.min(100, (count / filteredEmbryos.length) * 100)}%` }}
                    />
                  </div>
                </div>
                  <div className="text-sm font-semibold text-charcoal">{count}</div>
              </div>
            ))}
            </div>
          )}
        </div>

          <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
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
