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
  
  // Calculate average scores from real embryo data
  const calculateAverageScores = () => {
    if (realEmbryos.length === 0) {
      return [
        { label: 'Symmetry', detail: 'Cell distribution and radial balance', score: 'N/A', color: 'gray' },
        { label: 'Fragmentation', detail: 'Cytoplasmic debris & exclusion bodies', score: 'N/A', color: 'gray' },
        { label: 'Trophectoderm', detail: 'Cohesion and epithelial uniformity', score: 'N/A', color: 'gray' },
        { label: 'Inner Cell Mass', detail: 'Density and compaction quality', score: 'N/A', color: 'gray' },
        { label: 'Expansion', detail: 'Blastocoel volume & thinning', score: 'N/A', color: 'gray' },
      ];
    }
    
    // Calculate average viability score
    const avgViability = realEmbryos.reduce((sum, e) => sum + e.viabilityScore, 0) / realEmbryos.length;
    
    // Calculate average circularity (symmetry indicator)
    const avgCircularity = realEmbryos.reduce((sum, e) => {
      const circ = e.comprehensiveAnalysis?.morphological_analysis?.circularity_score || 0;
      return sum + circ;
    }, 0) / realEmbryos.length;
    
    // Calculate average fragmentation
    const avgFragmentation = realEmbryos.reduce((sum, e) => {
      const frag = e.comprehensiveAnalysis?.morphological_analysis?.fragmentation_percentage || 0;
      return sum + frag;
    }, 0) / realEmbryos.length;
    
    // Calculate average ICM and TE grades
    const icmGrades = realEmbryos.map(e => e.comprehensiveAnalysis?.blastocyst_grading?.inner_cell_mass_grade);
    const teGrades = realEmbryos.map(e => e.comprehensiveAnalysis?.blastocyst_grading?.trophectoderm_grade);
    
    const gradeToScore = (grades: (string | undefined)[]) => {
      const scores = grades.map(g => g === 'A' ? 90 : g === 'B' ? 75 : g === 'C' ? 55 : 40);
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    };
    
    const avgICM = gradeToScore(icmGrades);
    const avgTE = gradeToScore(teGrades);
    
    // Determine color based on score (green = good, yellow = moderate, red = poor)
    const getColor = (score: number, inverse = false) => {
      if (inverse) {
        return score < 20 ? 'emerald' : score < 40 ? 'amber' : 'red';
      }
      return score >= 70 ? 'emerald' : score >= 50 ? 'amber' : 'red';
    };
    
    return [
      { label: 'Symmetry', detail: 'Cell distribution and radial balance', score: `${Math.round(avgCircularity * 100)}%`, color: getColor(avgCircularity * 100) },
      { label: 'Fragmentation', detail: 'Cytoplasmic debris & exclusion bodies', score: `${Math.round(avgFragmentation)}%`, color: getColor(avgFragmentation, true) },
      { label: 'Trophectoderm', detail: 'Cohesion and epithelial uniformity', score: `${Math.round(avgTE)}%`, color: getColor(avgTE) },
      { label: 'Inner Cell Mass', detail: 'Density and compaction quality', score: `${Math.round(avgICM)}%`, color: getColor(avgICM) },
      { label: 'Expansion', detail: 'Blastocoel volume & thinning', score: `${Math.round(avgViability)}%`, color: getColor(avgViability) },
    ];
  };
  
  const scoringMetrics = calculateAverageScores();
  
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
            <span className="text-xs text-gray-500">Real-time cohort averages</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scoringMetrics.map((metric) => (
              <div key={metric.label} className={`border border-gray-100 rounded-lg p-4 bg-${metric.color}-50`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-gray-900">{metric.label}</div>
                  <span className={`text-sm font-bold text-${metric.color}-700 bg-${metric.color}-100 px-3 py-1 rounded-full`}>{metric.score}</span>
                </div>
                <p className="text-sm text-gray-600">{metric.detail}</p>
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
              
              // Use comprehensiveAnalysis data if available (real-time), otherwise fallback to features
              const developmentalStage = embryo.comprehensiveAnalysis?.morphokinetics?.estimated_developmental_stage 
                || embryo.features.developmentalStage;
              const symmetry = embryo.features.symmetry;
              const fragmentation = embryo.comprehensiveAnalysis?.morphological_analysis?.fragmentation_level 
                || embryo.features.fragmentation;
              const trophectoderm = embryo.comprehensiveAnalysis?.blastocyst_grading?.trophectoderm_grade 
                || embryo.features.trophectoderm;
              const innerCellMass = embryo.comprehensiveAnalysis?.blastocyst_grading?.inner_cell_mass_grade 
                || embryo.features.innerCellMass;
              
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
                  <p className="text-sm text-gray-600 mb-2">{developmentalStage}</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>Symmetry: <span className="font-semibold text-gray-900">{symmetry}</span></li>
                    <li>Fragmentation: <span className="font-semibold text-gray-900">{fragmentation}</span></li>
                    {trophectoderm && (
                      <li>TE: <span className="font-semibold text-gray-900">{trophectoderm}</span></li>
                    )}
                    {innerCellMass && (
                      <li>ICM: <span className="font-semibold text-gray-900">{innerCellMass}</span></li>
                    )}
                    {embryo.comprehensiveAnalysis && (
                      <>
                        <li>Viability: <span className="font-semibold text-gray-900">{embryo.viabilityScore}%</span></li>
                        <li>Confidence: <span className="font-semibold text-gray-900">{(embryo.comprehensiveAnalysis.confidence * 100).toFixed(0)}%</span></li>
                      </>
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
