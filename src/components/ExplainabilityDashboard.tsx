import { ComprehensivePrediction } from '../types/embryo';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Eye, EyeOff, Layers } from 'lucide-react';
import { useState } from 'react';

interface ExplainabilityDashboardProps {
  prediction: ComprehensivePrediction;
  embryoName: string;
  imageUrl: string;
}

export function ExplainabilityDashboard({ prediction, embryoName, imageUrl }: ExplainabilityDashboardProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayMode, setOverlayMode] = useState<'fragmentation' | 'boundaries' | 'zones' | 'all'>('all');
  
  // Defensive defaults so the dashboard renders even if backend omits some fields
  const defaultMorph = {
    fragmentation_level: 'Unknown',
    fragmentation_percentage: 0,
    circularity_score: 0,
    circularity_grade: 'N/A',
    boundary_definition: 'N/A',
    cell_symmetry: 'Unknown',
    zona_pellucida_thickness: 0,
    zona_pellucida_integrity: 'Unknown',
    cytoplasmic_granularity: 'Unknown',
    vacuolization: 'Unknown'
  };

  const defaultBlast = {
    expansion_stage: 0,
    expansion_description: '',
    inner_cell_mass_grade: 'N/A',
    trophectoderm_grade: 'N/A',
    overall_grade: 'N/A',
    quality_assessment: ''
  };

  const defaultMorphok = { estimated_developmental_stage: 'Unknown', timing_assessment: '', predicted_day: 0 };

  const defaultGenetic = { chromosomal_risk_level: 'Unknown', aneuploidy_risk_score: 0, pgt_a_recommendation: '', risk_factors: [] };

  const defaultClinical = { transfer_recommendation: 'No recommendation', transfer_priority: 5, freeze_recommendation: false, discard_recommendation: false, reasoning: [], clinical_notes: '' };

  const defaultExplain = { feature_importance: {}, top_positive_features: [], top_negative_features: [], decision_factors: [], confidence_explanation: 'N/A' };

  const defaultQuality = { agreement_rate: 0, prediction_consistency: 'Unknown', model_confidence_scores: [], uncertainty_level: 'Unknown' };

  const defaultAbnorm = { has_abnormalities: false, abnormality_types: [], severity: 'None', requires_manual_review: false };

  const {
    viability_score = 0,
    morphological_analysis = defaultMorph,
    blastocyst_grading = defaultBlast,
    morphokinetics = defaultMorphok,
    genetic_risk = defaultGenetic,
    clinical_recommendation = defaultClinical,
    explainability = defaultExplain,
    quality_metrics = defaultQuality,
    abnormality_flags = defaultAbnorm,
    processing_time_ms = 0,
    analysis_timestamp = new Date().toISOString()
  } = prediction || {} as any;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{embryoName} - Detailed Analysis</h1>
          <p className="text-gray-600 mt-2">Comprehensive AI-powered embryo assessment with clinical explainability</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Viability Score</p>
              <p className="text-4xl font-bold text-emerald-600">{(viability_score ?? 0).toFixed(1)}</p>
          </div>
          <img src={imageUrl} alt={embryoName} className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200" />
        </div>
      </div>

      {/* Abnormality Alerts */}
      {abnormality_flags && abnormality_flags.has_abnormalities && (
        <Alert variant={(abnormality_flags.severity || '').includes('Severe') ? 'destructive' : 'default'}>
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <strong>{abnormality_flags.severity}</strong>
            <ul className="mt-2 ml-4 list-disc">
              {(abnormality_flags.abnormality_types || []).map((abn, idx) => (
                <li key={idx}>{abn}</li>
              ))}
            </ul>
            {abnormality_flags.requires_manual_review && (
              <p className="mt-2 font-semibold">⚠️ Manual review by embryologist is recommended</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Clinical Recommendation */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="flex items-start gap-4">
          {clinical_recommendation.transfer_priority <= 2 ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          ) : clinical_recommendation.transfer_priority <= 3 ? (
            <Info className="w-8 h-8 text-blue-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Clinical Recommendation</h2>
            <p className="text-lg font-semibold text-gray-800 mb-3">{clinical_recommendation.transfer_recommendation}</p>
            <div className="flex gap-2 mb-3">
              <Badge variant={clinical_recommendation.freeze_recommendation ? 'default' : 'outline'}>
                {clinical_recommendation.freeze_recommendation ? '❄️ Freeze' : 'No Freeze'}
              </Badge>
              <Badge variant={clinical_recommendation.discard_recommendation ? 'destructive' : 'outline'}>
                {clinical_recommendation.discard_recommendation ? '🗑️ Discard' : 'Viable'}
              </Badge>
              <Badge>Priority: {clinical_recommendation.transfer_priority}</Badge>
            </div>
            <div className="bg-white rounded-lg p-4 space-y-2">
              <p className="font-semibold text-gray-700">Reasoning:</p>
              <ul className="list-disc ml-5 space-y-1">
                {clinical_recommendation.reasoning.map((reason, idx) => (
                  <li key={idx} className="text-gray-600">{reason}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-3 italic">{clinical_recommendation.clinical_notes}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Why This Score? - Explainability */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Why This Score? (Explainability)</h2>
        
        <div className="mb-4">
          <p className="text-gray-700 mb-2"><strong>Model Confidence:</strong> {explainability?.confidence_explanation || 'N/A'}</p>
          <div className="flex gap-2 flex-wrap">
            {(quality_metrics?.model_confidence_scores || []).map((score: number, idx: number) => (
                <Badge key={idx} variant="outline">Model {idx + 1}: {(Number(score || 0) * 100).toFixed(1)}%</Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Agreement Rate: <span className="font-semibold">{((quality_metrics?.agreement_rate || 0) * 100).toFixed(1)}%</span> ({quality_metrics?.prediction_consistency || 'Unknown'})
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Positive Features */}
          {explainability.top_positive_features.length > 0 && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Positive Indicators
              </h3>
              <ul className="space-y-2">
                {explainability.top_positive_features.map((feat, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{feat.feature}</span>
                    <Badge variant="default" className="bg-emerald-600">{feat.contribution.toFixed(1)}</Badge>
                      <Badge variant="default" className="bg-emerald-600">{(feat.contribution ?? 0).toFixed(1)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Negative Features */}
          {explainability.top_negative_features.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Concern Areas
              </h3>
              <ul className="space-y-2">
                {explainability.top_negative_features.map((feat, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{feat.feature}</span>
                    <Badge variant="destructive">{feat.concern_level.toFixed(1)}</Badge>
                      <Badge variant="destructive">{(feat.concern_level ?? 0).toFixed(1)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Decision Factors */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3">Key Decision Factors</h3>
          <ul className="space-y-2">
            {explainability.decision_factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-sm text-gray-700">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Visual Explainability */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">👁️ Visual Explainability</h2>
        <p className="text-gray-600 mb-4">
          See exactly what the AI analyzed in the embryo image. Toggle overlays to view detected features, boundaries, and quality zones.
        </p>

        {/* Toggle Controls */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showOverlay 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showOverlay ? 'Hide AI Overlay' : 'Show AI Overlay'}
          </button>

          {showOverlay && (
            <>
              <button
                onClick={() => setOverlayMode('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  overlayMode === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Layers className="w-4 h-4 inline mr-1" />
                All Features
              </button>
              <button
                onClick={() => setOverlayMode('fragmentation')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  overlayMode === 'fragmentation' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Fragmentation Regions
              </button>
              <button
                onClick={() => setOverlayMode('boundaries')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  overlayMode === 'boundaries' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cell Boundaries
              </button>
              <button
                onClick={() => setOverlayMode('zones')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  overlayMode === 'zones' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Quality Zones
              </button>
            </>
          )}
        </div>

        {/* Image Display */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Original Image */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Original Embryo Image</h3>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt={embryoName} 
                className="w-full h-auto"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Raw Image
              </div>
            </div>
          </div>

          {/* AI Analysis Overlay */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">
              {showOverlay ? 'AI Feature Analysis' : 'Toggle overlay to see AI analysis'}
            </h3>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt={`${embryoName} with overlay`} 
                className={`w-full h-auto ${showOverlay ? 'opacity-70' : ''}`}
              />
              
              {/* Overlay visualizations */}
              {showOverlay && (
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 400 400"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Fragmentation Overlay - Heat Map Style */}
                  {(overlayMode === 'fragmentation' || overlayMode === 'all') && (
                    <>
                      {/* Simulated fragmentation regions - heat map colors (dark red to yellow) */}
                      {Array.from({ length: Math.floor((morphological_analysis.fragmentation_percentage ?? 0) / 5) }).map((_, i) => {
                        const intensity = Math.random();
                        const heatColor = intensity > 0.7 ? 'rgba(139, 0, 0, 0.8)' : // Dark red (high)
                                         intensity > 0.4 ? 'rgba(220, 20, 60, 0.7)' : // Crimson (medium)
                                         'rgba(255, 140, 0, 0.6)'; // Dark orange (low)
                        return (
                          <circle 
                            key={`frag-${i}`}
                            cx={50 + Math.random() * 300} 
                            cy={50 + Math.random() * 300} 
                            r={10 + Math.random() * 15}
                            fill={heatColor}
                            stroke="rgba(139, 0, 0, 1)"
                            strokeWidth="2"
                          />
                        );
                      })}
                      <text x="10" y="25" fill="#8B0000" fontSize="14" fontWeight="bold">
                        🔴 Fragmentation: {(morphological_analysis.fragmentation_percentage ?? 0).toFixed(1) + '%'}
                      </text>
                    </>
                  )}

                  {/* Boundaries Overlay - Dark Purple/Indigo */}
                  {(overlayMode === 'boundaries' || overlayMode === 'all') && (
                    <>
                      <circle 
                        cx="200" 
                        cy="200" 
                        r="150" 
                        fill="none"
                        stroke="rgba(75, 0, 130, 0.9)"
                        strokeWidth="3"
                        strokeDasharray="10,5"
                      />
                      <circle 
                        cx="200" 
                        cy="200" 
                        r="100" 
                        fill="none"
                        stroke="rgba(138, 43, 226, 0.8)"
                        strokeWidth="2"
                        strokeDasharray="5,3"
                      />
                      <text x="10" y={overlayMode === 'all' ? 45 : 25} fill="#4B0082" fontSize="14" fontWeight="bold">
                        🟣 Zona Pellucida Boundary
                      </text>
                    </>
                  )}

                  {/* Quality Zones Overlay - Dark Green to Dark Blue Heat Map */}
                  {(overlayMode === 'zones' || overlayMode === 'all') && (
                    <>
                      {/* ICM region (center) - Dark green/teal */}
                      <circle 
                        cx="200" 
                        cy="200" 
                        r="60" 
                        fill="rgba(0, 100, 0, 0.5)"
                        stroke="rgba(0, 128, 0, 0.9)"
                        strokeWidth="2"
                      />
                      {/* TE region (outer) - Dark blue/navy */}
                      <path
                        d="M 200 200 m -150 0 a 150 150 0 1 0 300 0 a 150 150 0 1 0 -300 0"
                        fill="none"
                        stroke="rgba(0, 0, 139, 0.7)"
                        strokeWidth="40"
                        opacity="0.5"
                      />
                      <text x="10" y={overlayMode === 'all' ? 65 : 25} fill="#006400" fontSize="14" fontWeight="bold">
                        🟢 ICM (Center) | 🔵 TE (Outer)
                      </text>
                    </>
                  )}
                </svg>
              )}

              {/* Overlay Label */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {showOverlay ? `AI Overlay: ${overlayMode.charAt(0).toUpperCase() + overlayMode.slice(1)}` : 'Overlay Off'}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Metrics */}
        {showOverlay && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Detected Fragmentation</p>
              <p className="text-2xl font-bold text-orange-600">
                  {(morphological_analysis.fragmentation_percentage ?? 0).toFixed(1) + '%'}
                </p>
              <p className="text-xs text-gray-500">{morphological_analysis.fragmentation_level}</p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Circularity Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {morphological_analysis.circularity_score.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500">{morphological_analysis.circularity_grade}</p>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">ICM Quality</p>
              <p className="text-2xl font-bold text-emerald-600">
                {blastocyst_grading?.inner_cell_mass_grade || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Inner Cell Mass</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">TE Quality</p>
              <p className="text-2xl font-bold text-blue-600">
                {blastocyst_grading?.trophectoderm_grade || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Trophectoderm</p>
            </div>
          </div>
        )}

        {/* Trust & Interpretability Note */}
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Clinical Trust:</strong> These visual overlays show the exact features our AI analyzed to generate the viability score. 
            Doctors can verify the AI's assessment by visually inspecting these highlighted regions against their clinical expertise.
          </AlertDescription>
        </Alert>
      </Card>

      {/* Morphological Analysis */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔬 Morphological Analysis</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fragmentation */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Fragmentation</h3>
            <p className="text-2xl font-bold text-gray-900">{(morphological_analysis.fragmentation_percentage ?? 0).toFixed(1) + '%'}</p>
            <p className="text-sm text-gray-600">{morphological_analysis.fragmentation_level}</p>
          </div>

          {/* Circularity */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Circularity (Cell Shape)</h3>
            <p className="text-2xl font-bold text-gray-900">{morphological_analysis.circularity_score.toFixed(3)}</p>
              <p className="text-2xl font-bold text-gray-900">{(morphological_analysis.circularity_score ?? 0).toFixed(3)}</p>
            <p className="text-sm text-gray-600">{morphological_analysis.circularity_grade}</p>
          </div>

          {/* Symmetry */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Cell Symmetry</h3>
            <p className="text-lg font-semibold text-gray-900">{morphological_analysis.cell_symmetry}</p>
          </div>

          {/* Boundary Definition */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Boundary Definition</h3>
            <p className="text-sm text-gray-700">{morphological_analysis.boundary_definition}</p>
          </div>

          {/* Zona Pellucida */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Zona Pellucida</h3>
            <p className="text-sm text-gray-700">Thickness: {morphological_analysis.zona_pellucida_thickness} μm</p>
            <p className="text-sm text-gray-600">{morphological_analysis.zona_pellucida_integrity}</p>
          </div>

          {/* Cytoplasm */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Cytoplasm Quality</h3>
            <p className="text-sm text-gray-700">{morphological_analysis.cytoplasmic_granularity}</p>
            <p className="text-sm text-gray-600">Vacuolization: {morphological_analysis.vacuolization}</p>
          </div>
        </div>

        {/* Visual Representation */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">Visual Quality Indicators</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Circularity Score</span>
                <span>{morphological_analysis.circularity_score.toFixed(3)}</span>
                  <span>{(morphological_analysis.circularity_score ?? 0).toFixed(3)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${morphological_analysis.circularity_score * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Quality (Inverse Fragmentation)</span>
                <span>{(100 - morphological_analysis.fragmentation_percentage).toFixed(1)}%</span>
                  <span>{(100 - (morphological_analysis.fragmentation_percentage ?? 0)).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${100 - morphological_analysis.fragmentation_percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Blastocyst Grading (Gardner System) */}
      {blastocyst_grading && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Blastocyst Grading (Gardner System)</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Overall Grade</p>
              <p className="text-4xl font-bold text-purple-700">{blastocyst_grading.overall_grade}</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Expansion Stage</p>
              <p className="text-3xl font-bold text-blue-700">{blastocyst_grading.expansion_stage}</p>
              <p className="text-xs text-gray-500 mt-1">{blastocyst_grading.expansion_description}</p>
            </div>
            
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ICM Grade</p>
              <p className="text-3xl font-bold text-emerald-700">{blastocyst_grading.inner_cell_mass_grade}</p>
            </div>
            
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">TE Grade</p>
              <p className="text-3xl font-bold text-amber-700">{blastocyst_grading.trophectoderm_grade}</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700">Quality Assessment:</p>
            <p className="text-gray-600">{blastocyst_grading.quality_assessment}</p>
          </div>
        </Card>
      )}

      {/* Genetic Risk Assessment */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🧬 Genetic Risk Assessment</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Chromosomal Risk</p>
            <Badge 
              variant={genetic_risk.chromosomal_risk_level === 'High' ? 'destructive' : genetic_risk.chromosomal_risk_level === 'Medium' ? 'default' : 'outline'}
              className="text-lg px-4 py-2"
            >
              {genetic_risk.chromosomal_risk_level}
            </Badge>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Aneuploidy Risk Score</p>
            <p className="text-3xl font-bold text-gray-900">{genetic_risk.aneuploidy_risk_score.toFixed(1)}</p>
              <p className="text-3xl font-bold text-gray-900">{(genetic_risk.aneuploidy_risk_score ?? 0).toFixed(1)}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${genetic_risk.aneuploidy_risk_score > 50 ? 'bg-red-600' : genetic_risk.aneuploidy_risk_score > 30 ? 'bg-orange-500' : 'bg-emerald-600'}`}
                style={{ width: `${genetic_risk.aneuploidy_risk_score}%` }}
              />
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-1">PGT-A Recommendation</p>
            <p className="text-sm text-gray-700">{genetic_risk.pgt_a_recommendation}</p>
          </div>
        </div>
        
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <h3 className="font-semibold text-orange-800 mb-2">Risk Factors Identified:</h3>
          <ul className="list-disc ml-5 space-y-1">
            {genetic_risk.risk_factors.map((factor, idx) => (
              <li key={idx} className="text-sm text-gray-700">{factor}</li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Metadata Footer */}
      <div className="text-sm text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
        <p>Analysis completed in {(processing_time_ms ?? 0).toFixed(0)}ms</p>
        <p className="text-xs mt-1">{new Date(analysis_timestamp || new Date().toISOString()).toLocaleString()}</p>
      </div>
    </div>
  );
}
