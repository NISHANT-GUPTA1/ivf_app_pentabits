import { useState } from 'react';
import type { EmbryoResult } from '../types/embryo';

interface MorphologyDeepDiveProps {
  embryoData: EmbryoResult[];
}

const scoringRules = [
  { label: 'Symmetry', detail: 'Cell distribution and radial balance', weight: '25%' },
  { label: 'Fragmentation', detail: 'Cytoplasmic debris & exclusion bodies', weight: '20%' },
  { label: 'Trophectoderm', detail: 'Cohesion and epithelial uniformity', weight: '20%' },
  { label: 'Inner Cell Mass', detail: 'Density and compaction quality', weight: '20%' },
  { label: 'Expansion', detail: 'Blastocoel volume & thinning', weight: '15%' },
];

export function MorphologyDeepDive({ embryoData }: MorphologyDeepDiveProps) {
  // Filter out placeholder embryo
  const realEmbryos = embryoData.filter(e => e.id !== 'placeholder-embryo');
  const [showQCPanel, setShowQCPanel] = useState(false);
  const [reviewedEmbryos, setReviewedEmbryos] = useState<Set<string>>(new Set());
  const [escalatedEmbryos, setEscalatedEmbryos] = useState<Set<string>>(new Set());
  
  const handleMarkReviewed = (embryoId: string) => {
    setReviewedEmbryos(prev => new Set(prev).add(embryoId));
  };
  
  const handleEscalate = (embryoId: string) => {
    setEscalatedEmbryos(prev => new Set(prev).add(embryoId));
  };
  
  const pendingReviewCount = realEmbryos.length - reviewedEmbryos.size;
  
  const symmetryBreakdown = realEmbryos.reduce<Record<string, number>>((acc, embryo) => {
    const symmetry = embryo.features.symmetry;
    acc[symmetry] = (acc[symmetry] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-purple-600">Morphology Lab</p>
          <h1 className="text-2xl font-bold text-gray-900">Morphology Deep Dive</h1>
          <p className="text-gray-500 text-sm">Qualitative features, scoring rationale, and review queue.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-semibold border border-purple-100">
            QC review pending: {pendingReviewCount}
          </span>
          <button 
            onClick={() => setShowQCPanel(!showQCPanel)}
            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            {showQCPanel ? 'Close QC panel' : 'Open QC panel'}
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Scoring Matrix</h2>
            <span className="text-xs text-gray-500">Weighted model inputs</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scoringRules.map((rule) => (
              <div key={rule.label} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-gray-900">{rule.label}</div>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">{rule.weight}</span>
                </div>
                <p className="text-sm text-gray-600">{rule.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Symmetry Snapshot</h3>
            <span className="text-xs text-gray-500">Live cohort</span>
          </div>
          {realEmbryos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-2">No embryo data yet</p>
              <p className="text-xs text-gray-400">Upload images to see symmetry analysis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(symmetryBreakdown).map(([label, value]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{label}</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{ width: `${Math.min(100, (value / realEmbryos.length) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800">{value}</div>
              </div>
            ))}
            </div>
          )}
        </div>
      </section>

      {showQCPanel && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Manual Review Queue</h3>
            <button className="text-sm text-purple-700 font-semibold px-3 py-1.5 rounded-lg border border-purple-100 hover:bg-purple-50">
              Assign reviewer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {realEmbryos.map((embryo) => {
              const isReviewed = reviewedEmbryos.has(embryo.id);
              const isEscalated = escalatedEmbryos.has(embryo.id);
              
              return (
                <div key={embryo.id} className={`border rounded-lg p-4 ${
                  isReviewed ? 'border-green-200 bg-green-50' : 
                  isEscalated ? 'border-red-200 bg-red-50' : 
                  'border-gray-100 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-900">{embryo.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isReviewed ? 'bg-green-100 text-green-700' :
                      isEscalated ? 'bg-red-100 text-red-700' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      {isReviewed ? 'Reviewed' : isEscalated ? 'Escalated' : 'Needs check'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{embryo.features.developmentalStage}</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>Symmetry: <span className="font-semibold text-gray-900">{embryo.features.symmetry}</span></li>
                    <li>Fragmentation: <span className="font-semibold text-gray-900">{embryo.features.fragmentation}</span></li>
                    {embryo.features.trophectoderm && (
                      <li>TE: <span className="font-semibold text-gray-900">{embryo.features.trophectoderm}</span></li>
                    )}
                    {embryo.features.innerCellMass && (
                      <li>ICM: <span className="font-semibold text-gray-900">{embryo.features.innerCellMass}</span></li>
                    )}
                  </ul>
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                    <button 
                      onClick={() => handleMarkReviewed(embryo.id)}
                      disabled={isReviewed || isEscalated}
                      className={`flex-1 rounded-md py-2 transition-colors ${
                        isReviewed ? 'bg-green-600 text-white cursor-not-allowed' :
                        'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {isReviewed ? '✓ Reviewed' : 'Mark reviewed'}
                    </button>
                    <button 
                      onClick={() => handleEscalate(embryo.id)}
                      disabled={isReviewed || isEscalated}
                      className={`flex-1 border rounded-md py-2 transition-colors ${
                        isEscalated ? 'border-red-600 bg-red-600 text-white cursor-not-allowed' :
                        'border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {isEscalated ? '⚠ Escalated' : 'Escalate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
