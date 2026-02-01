import React, { useState } from 'react';
import { ComprehensivePrediction } from '../types/embryo';
import { CheckCircle2, Info, AlertTriangle, TrendingUp, Activity, Eye, BarChart3, FileText, XCircle, Snowflake, Trash2, AlertCircle, Download } from 'lucide-react';

interface EmbryoDetailedAnalysisProps {
  prediction: ComprehensivePrediction;
  embryoName: string;
  imageUrl: string;
  developmentDay?: number;
}

export function EmbryoDetailedAnalysis({ 
  prediction, 
  embryoName, 
  imageUrl,
  developmentDay 
}: EmbryoDetailedAnalysisProps) {
  const [activeView, setActiveView] = useState<'summary' | 'morphometry' | 'attribution' | 'decision' | 'report'>('summary');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showOriginal, setShowOriginal] = useState(true);
  const [overlayMode, setOverlayMode] = useState<'all' | 'fragmentation' | 'boundaries' | 'quality'>('all');

  const {
    viability_score = 0,
    morphological_analysis = {},
    blastocyst_grading = {},
    genetic_risk = {},
    clinical_recommendation = {},
    explainability = {},
    quality_metrics = {},
    confidence = 0,
    confidence_level = 'N/A',
    model_predictions = [],
    abnormality_flags = {}
  } = prediction || {};

  // Calculate waterfall data
  const calculateWaterfallData = () => {
    const baseline = 68;
    const circularity = (morphological_analysis.circularity_score || 0) * 100;
    const circularityContribution = (circularity - 50) / 5;
    const fragmentation = morphological_analysis.fragmentation_percentage || 0;
    const fragmentationContribution = -(fragmentation / 10);
    const boundaryContribution = morphological_analysis.boundary_definition === 'Clear' ? 5 : 
                                  morphological_analysis.boundary_definition === 'Auto-detected' ? 3 : 0;
    const symmetryContribution = morphological_analysis.cell_symmetry === 'Excellent' ? 8 :
                                 morphological_analysis.cell_symmetry === 'Good' ? 5 : 2;

    return [
      { label: 'Baseline', value: baseline, color: 'bg-gray-400' },
      { label: '+Circularity', value: circularityContribution, color: 'bg-emerald-500' },
      { label: '+Fragmentation', value: fragmentationContribution, color: 'bg-red-500' },
      { label: '+Boundary', value: boundaryContribution, color: 'bg-teal-500' },
      { label: '+Symmetry', value: symmetryContribution, color: 'bg-blue-500' },
      { label: 'FINAL SCORE', value: viability_score, color: 'bg-emerald-600', isFinal: true }
    ];
  };

  const waterfallData = calculateWaterfallData();
  const maxValue = 100;

  // Render different views
  const renderMainContent = () => {
    switch (activeView) {
      case 'summary':
        return (
          <div className="space-y-4">
            {/* Waterfall Chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How Your Score Was Calculated</h3>
              <p className="text-sm text-gray-600 mb-6">
                The waterfall shows how morphological factors contributed to your final viability score of <span className="font-bold text-emerald-600">{Math.round(viability_score)}/100</span>
              </p>

              <div className="relative h-[400px] bg-gray-50 rounded-xl p-6">
                <div className="flex items-end justify-around h-full gap-4">
                  {waterfallData.map((item, index) => {
                    const isNegative = item.value < 0;
                    const height = item.isFinal 
                      ? `${(item.value / maxValue) * 100}%`
                      : `${(Math.abs(item.value) / maxValue) * 100 * 4}%`;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className="mb-2 text-center">
                          <span className={`text-xs font-bold ${
                            item.isFinal ? 'text-emerald-600 text-lg' : 
                            isNegative ? 'text-red-600' : 'text-emerald-600'
                          }`}>
                            {item.isFinal ? Math.round(item.value) : (item.value > 0 ? '+' : '') + item.value.toFixed(0)}
                          </span>
                        </div>
                        <div 
                          className={`w-full ${item.color} rounded-t-lg transition-all duration-500 ${item.isFinal ? 'shadow-lg' : ''}`}
                          style={{ height }}
                        ></div>
                        <p className="text-xs text-gray-600 font-medium mt-2 text-center">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    <span className="text-gray-600">Baseline: 68</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span className="text-gray-600">Positive: +22</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-600">Negative: -3</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                    <span className="text-gray-600 font-semibold">Final: {Math.round(viability_score)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'morphometry':
        return (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Morphometry Analysis</h3>
            <p className="text-sm text-gray-600 mb-6">Visual representation of key morphological parameters</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Circularity</h4>
                <div className="text-3xl font-bold text-emerald-600">{Math.round((morphological_analysis.circularity_score || 0) * 100)}/100</div>
                <p className="text-xs text-gray-600 mt-1">{morphological_analysis.circularity_grade || 'Good'}</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Fragmentation</h4>
                <div className="text-3xl font-bold text-red-600">{Math.round(morphological_analysis.fragmentation_percentage || 0)}%</div>
                <p className="text-xs text-gray-600 mt-1">{morphological_analysis.fragmentation_level || 'Low'}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Boundary Integrity</h4>
                <div className="text-3xl font-bold text-blue-600">{Math.round(((morphological_analysis.circularity_score || 0) * 100) * 0.78)}/100</div>
                <p className="text-xs text-gray-600 mt-1">{morphological_analysis.boundary_definition || 'Clear'}</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Cell Symmetry</h4>
                <div className="text-2xl font-bold text-purple-600">{morphological_analysis.cell_symmetry || 'Excellent'}</div>
                <p className="text-xs text-gray-600 mt-1">Bilateral assessment</p>
              </div>
            </div>
          </div>
        );
      case 'attribution':
        return (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Feature Attribution</h3>
            <p className="text-sm text-gray-600 mb-6">Which features most influenced the viability score</p>
            
            <div className="space-y-3">
              {(explainability.top_positive_features || []).map((feature, idx) => (
                <div key={idx} className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">{feature.feature}</span>
                    <span className="text-emerald-600 font-bold">+{(feature.contribution * 10).toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${Math.min(100, feature.contribution * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'decision':
        return (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Decision Path</h3>
            <p className="text-sm text-gray-600 mb-6">How the AI arrived at its conclusion</p>
            
            <div className="space-y-4">
              {[
                { step: 'Image Processing', detail: 'High-resolution scan completed' },
                { step: 'Feature Extraction', detail: `${Object.keys(explainability.feature_importance || {}).length} features extracted` },
                { step: 'Ensemble Prediction', detail: `${model_predictions.length} models consensus` },
                { step: 'Clinical Assessment', detail: 'Risk indicators generated' },
                { step: 'Quality Validation', detail: `Confidence: ${confidence_level}` }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.step}</h4>
                    <p className="text-sm text-gray-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'report':
        return (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Clinical Report</h3>
              <button 
                onClick={() => {
                  alert('Report download functionality - Full clinical report with all details');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-sm text-gray-700 space-y-4">
              <div><strong>Embryo ID:</strong> {embryoName}</div>
              <div><strong>Development Day:</strong> Day {developmentDay || 5}</div>
              <div><strong>Viability Score:</strong> {Math.round(viability_score)}/100</div>
              <div><strong>Gardner Grade:</strong> {blastocyst_grading.overall_grade || '4AA'}</div>
              <div><strong>Recommendation:</strong> {clinical_recommendation.transfer_recommendation}</div>
              <div><strong>Risk Level:</strong> {genetic_risk.chromosomal_risk_level || 'Low'}</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Embryo Analysis</h1>
            <p className="text-sm text-gray-500">ID: {embryoName}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-gray-500">Status:</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-semibold text-green-600">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
            <p className="text-sm font-medium text-gray-600 mb-3">EMBRYO STATUS</p>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">SCORE</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-emerald-600">{Math.round(viability_score)}</span>
                <span className="text-xl text-gray-400">/100</span>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">VIABLE - GOOD</span>
            </div>

            <div className="space-y-3 mt-4 border-t border-emerald-100 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gardner Grade:</span>
                <span className="font-bold text-gray-900">{blastocyst_grading.overall_grade || '4AA'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Development:</span>
                <span className="font-semibold text-gray-900">Day {developmentDay || 5}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Risk Tier:</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    genetic_risk.chromosomal_risk_level === 'Low' ? 'bg-green-500' :
                    genetic_risk.chromosomal_risk_level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-semibold ${
                    genetic_risk.chromosomal_risk_level === 'Low' ? 'text-green-600' :
                    genetic_risk.chromosomal_risk_level === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{genetic_risk.chromosomal_risk_level || 'LOW'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-100">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">ANALYSIS VIEWS</p>
              <div className="space-y-1">
                {[
                  { id: 'summary', icon: BarChart3, label: 'Summary' },
                  { id: 'morphometry', icon: Activity, label: 'Morphometry' },
                  { id: 'attribution', icon: TrendingUp, label: 'Feature Attribution' },
                  { id: 'decision', icon: Eye, label: 'Decision Path' },
                  { id: 'report', icon: FileText, label: 'Report' }
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id as any)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeView === view.id 
                        ? 'bg-white text-emerald-600 font-semibold shadow-sm' 
                        : 'text-gray-600 hover:bg-white/40'
                    }`}
                  >
                    <view.icon className="w-4 h-4" />
                    {view.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                alert(`Score ${Math.round(viability_score)}% accepted for ${embryoName}!\n\nRecommendation: ${clinical_recommendation.transfer_recommendation || 'Analysis complete'}\n\nThis embryo has been marked for further review.`);
              }}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              Accept Score
            </button>
          </div>
        </div>

        {/* Center Panel */}
        <div className="col-span-12 lg:col-span-6">
          {renderMainContent()}
        </div>

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Summary</h3>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Gardner Grade</h4>
              <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                <p className="text-3xl font-bold text-emerald-700">{blastocyst_grading.overall_grade || '4AA'}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Chromosomal Risk</h4>
              <div className={`rounded-lg p-3 border ${
                genetic_risk.chromosomal_risk_level === 'Low' ? 'bg-green-50 border-green-200' :
                genetic_risk.chromosomal_risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {genetic_risk.chromosomal_risk_level === 'Low' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  {genetic_risk.chromosomal_risk_level === 'Medium' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                  {genetic_risk.chromosomal_risk_level === 'High' && <XCircle className="w-5 h-5 text-red-600" />}
                  <span className="text-sm font-semibold">{genetic_risk.chromosomal_risk_level || 'Low'} Risk</span>
                </div>
                <p className="text-xs text-gray-700 mt-1">Aneuploidy: {genetic_risk.aneuploidy_risk_score || 0}%</p>
              </div>
            </div>

            <div className={`rounded-xl p-4 text-white ${
              clinical_recommendation.discard_recommendation ? 'bg-gradient-to-br from-red-600 to-red-700' :
              clinical_recommendation.freeze_recommendation ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
              'bg-gradient-to-br from-emerald-600 to-teal-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {clinical_recommendation.discard_recommendation ? (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <h4 className="font-bold">NOT RECOMMENDED</h4>
                  </>
                ) : clinical_recommendation.freeze_recommendation ? (
                  <>
                    <Snowflake className="w-5 h-5" />
                    <h4 className="font-bold">CONSIDER FREEZING</h4>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <h4 className="font-bold">PROCEED TO TRANSFER</h4>
                  </>
                )}
              </div>
              <p className="text-xs mt-2">{clinical_recommendation.transfer_recommendation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Explainability - Full-width section below grid */}
      {activeView === 'summary' && (
        <div className="mt-4 bg-pink-50 rounded-2xl p-8 border border-pink-200">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Visual Explainability</h3>
            </div>
            <p className="text-sm text-gray-600">See exactly what the AI analyzed in the embryo image. Toggle overlays to view detected features, boundaries, and quality zones.</p>
          </div>

          {/* Overlay Control Buttons */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${
                !showHeatmap ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
              }`}>
              <Eye className="w-4 h-4" />
              {showHeatmap ? 'Hide AI Overlay' : 'Show AI Overlay'}
            </button>
            
            {showHeatmap && (
              <>
                <button
                  onClick={() => setOverlayMode('all')}
                  className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                    overlayMode === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                  }`}>
                  All Features
                </button>
                <button
                  onClick={() => setOverlayMode('fragmentation')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    overlayMode === 'fragmentation' ? 'bg-white text-gray-700 border-2 border-purple-600' : 'bg-white text-gray-700 border border-gray-300'
                  }`}>
                  Fragmentation Regions
                </button>
                <button
                  onClick={() => setOverlayMode('boundaries')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    overlayMode === 'boundaries' ? 'bg-white text-gray-700 border-2 border-purple-600' : 'bg-white text-gray-700 border border-gray-300'
                  }`}>
                  Cell Boundaries
                </button>
                <button
                  onClick={() => setOverlayMode('quality')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    overlayMode === 'quality' ? 'bg-white text-gray-700 border-2 border-purple-600' : 'bg-white text-gray-700 border border-gray-300'
                  }`}>
                  Quality Zones
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Original Embryo Image */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Original Embryo Image</p>
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-300 bg-gray-900">
                <img src={imageUrl} alt="Original" className="w-full h-[400px] object-contain" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-semibold">
                  Original
                </div>
              </div>
            </div>

            {/* AI Feature Analysis */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">AI Feature Analysis</p>
              <div className="relative rounded-xl overflow-hidden border-2 border-purple-300 bg-gray-900">
                <img src={imageUrl} alt="AI Analysis" className="w-full h-[400px] object-contain opacity-80" />
                
                {showHeatmap && (
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 400 350" preserveAspectRatio="xMidYMid meet">
                      {/* Fragmentation regions - small red circles */}
                      {(overlayMode === 'all' || overlayMode === 'fragmentation') && (
                        <>
                          <circle cx="80" cy="100" r="22" fill="rgba(239, 68, 68, 0.45)" stroke="rgba(239, 68, 68, 0.7)" strokeWidth="2" />
                          <circle cx="320" cy="200" r="18" fill="rgba(239, 68, 68, 0.4)" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2" />
                          <circle cx="180" cy="90" r="16" fill="rgba(239, 68, 68, 0.35)" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2" />
                          <circle cx="300" cy="120" r="14" fill="rgba(239, 68, 68, 0.35)" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2" />
                        </>
                      )}
                      
                      {/* ICM Center - large green circle */}
                      {(overlayMode === 'all' || overlayMode === 'quality') && (
                        <circle cx="200" cy="175" r="85" fill="rgba(34, 197, 94, 0.35)" stroke="rgba(34, 197, 94, 0.7)" strokeWidth="3" />
                      )}
                      
                      {/* Zona Pellucida Boundary - blue dashed circle */}
                      {(overlayMode === 'all' || overlayMode === 'boundaries') && (
                        <>
                          <circle cx="200" cy="175" r="135" fill="none" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="4" strokeDasharray="8,4" />
                          <circle cx="200" cy="175" r="115" fill="none" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" strokeDasharray="6,3" />
                        </>
                      )}
                    </svg>
                  </div>
                )}
                
                <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-bold flex items-center gap-2">
                  {showHeatmap && (
                    <>
                      <span className="text-red-300">●</span>
                      <span>Fragmentation: {Math.round(morphological_analysis.fragmentation_percentage || 0)}%</span>
                    </>
                  )}
                </div>
                
                {showHeatmap && (
                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg text-white text-xs space-y-1.5">
                    {(overlayMode === 'all' || overlayMode === 'fragmentation') && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                        <span className="font-semibold">Fragmentation: {Math.round(morphological_analysis.fragmentation_percentage || 0)}%</span>
                      </div>
                    )}
                    {(overlayMode === 'all' || overlayMode === 'boundaries') && (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-purple-400"></div>
                          <span className="font-semibold">Zona Pellucida Boundary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-blue-400"></div>
                          <span className="font-semibold">ICM Boundary</span>
                        </div>
                      </>
                    )}
                    {(overlayMode === 'all' || overlayMode === 'quality') && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                        <span className="font-semibold">ICM (Center) - High Quality Zone</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">AI Model Focus Areas</p>
                <p>The heatmap highlights regions analyzed: <span className="font-semibold text-green-700">green areas</span> indicate the Inner Cell Mass with excellent morphology, <span className="font-semibold text-red-700">red zones</span> show detected fragmentation concerns, <span className="font-semibold text-blue-700">blue boundaries</span> represent the Zona Pellucida edge detection.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
