// ==================== MORPHOLOGICAL ANALYSIS ====================

export interface MorphologicalAnalysis {
  fragmentation_level: string;
  fragmentation_percentage: number;
  circularity_score: number;
  circularity_grade: string;
  boundary_definition: string;
  cell_symmetry: string;
  zona_pellucida_thickness: number;
  zona_pellucida_integrity: string;
  cytoplasmic_granularity: string;
  vacuolization: string;
}

// ==================== BLASTOCYST GRADING (GARDNER SYSTEM) ====================

export interface BlastocystGrading {
  expansion_stage: number; // 1-6
  expansion_description: string;
  inner_cell_mass_grade: string; // A, B, C
  trophectoderm_grade: string; // A, B, C
  overall_grade: string; // e.g., "4AA", "3BB"
  quality_assessment: string;
}

// ==================== MORPHOKINETICS ====================

export interface MorphokineticsTimings {
  estimated_developmental_stage: string;
  timing_assessment: string;
  predicted_day: number;
}

// ==================== GENETIC RISK INDICATORS ====================

export interface GeneticRiskIndicators {
  chromosomal_risk_level: string; // Low, Medium, High
  aneuploidy_risk_score: number; // 0-100
  pgt_a_recommendation: string;
  risk_factors: string[];
}

// ==================== CLINICAL RECOMMENDATIONS ====================

export interface ClinicalRecommendation {
  transfer_recommendation: string;
  transfer_priority: number; // 1-5
  freeze_recommendation: boolean;
  discard_recommendation: boolean;
  reasoning: string[];
  clinical_notes: string;
}

// ==================== EXPLAINABILITY DATA ====================

export interface ExplainabilityData {
  feature_importance: Record<string, number>;
  top_positive_features: Array<{ feature: string; contribution: number }>;
  top_negative_features: Array<{ feature: string; concern_level: number }>;
  decision_factors: string[];
  confidence_explanation: string;
}

// ==================== QUALITY METRICS ====================

export interface QualityMetrics {
  agreement_rate: number;
  prediction_consistency: string;
  model_confidence_scores: number[];
  uncertainty_level: string;
}

// ==================== ABNORMALITY FLAGS ====================

export interface AbnormalityFlags {
  has_abnormalities: boolean;
  abnormality_types: string[];
  severity: string;
  requires_manual_review: boolean;
}

// ==================== MODEL PREDICTIONS ====================

export interface ModelPrediction {
  model: string;
  prediction: number;
  probability_good: number;
  probability_not_good: number;
  confidence?: number;
}

// ==================== LEGACY FEATURES (for backward compatibility) ====================

export interface EmbryoFeatures {
  developmentalStage: string;
  symmetry: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  fragmentation: string;
  blastocystExpansion?: string;
  innerCellMass?: string;
  trophectoderm?: string;
}

// ==================== COMPREHENSIVE PREDICTION RESPONSE ====================

export interface ConfusionMatrixData {
  true_positives: number;
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
  accuracy: number;
  sensitivity: number;
  specificity: number;
  precision: number;
}

export interface ComprehensivePrediction {
  prediction: string;
  viability_score: number;
  confidence: number;
  confidence_level: string;
  model_predictions: ModelPrediction[];
  features: Record<string, number>;
  confusion_matrix?: ConfusionMatrixData;
  
  // Clinical Analysis
  morphological_analysis: MorphologicalAnalysis;
  blastocyst_grading?: BlastocystGrading;
  morphokinetics: MorphokineticsTimings;
  genetic_risk: GeneticRiskIndicators;
  clinical_recommendation: ClinicalRecommendation;
  explainability: ExplainabilityData;
  quality_metrics: QualityMetrics;
  abnormality_flags: AbnormalityFlags;
  
  // Metadata
  analysis_timestamp: string;
  processing_time_ms: number;
}

// ==================== EMBRYO RESULT (Enhanced) ====================

export interface EmbryoResult {
  id: string;
  name: string;
  imageUrl: string;
  viabilityScore: number;
  rank: number;
  features: EmbryoFeatures;
  keyFindings: string[];
  recommendation: string;
  
  // Patient tracking
  patientId?: string;
  
  // Development tracking
  developmentDay?: number; // Day 3, Day 5, etc.
  
  // NEW: Comprehensive analysis data
  comprehensiveAnalysis?: ComprehensivePrediction;
  
  // Best embryo selection
  isSelected?: boolean; // Mark as "best" embryo
  
  // Manual Override Fields
  manualGrade?: string;
  overrideScore?: number;
  overrideReason?: string;
  notes?: string;
  
  // Metadata for uploaded images
  uploadedAt?: Date;
  processingStatus?: 'pending' | 'processing' | 'completed';
}

// ==================== CONFUSION MATRIX DATA ====================

export interface ConfusionMatrixData {
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  sensitivity?: number;  // TPR - can be calculated from TP/(TP+FN)
  specificity?: number;  // TNR - can be calculated from TN/(TN+FP)
}

// ==================== MODEL PERFORMANCE ====================

export interface ModelPerformance {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: ConfusionMatrixData;
  roc_auc?: number;
}

// ==================== PATIENT MANAGEMENT ====================

export interface Patient {
  id: string;
  name: string;
  cycleNumber: number;
  createdAt: Date;
  age?: number;
  patientId?: string;
  mobile?: string;
  email?: string;
  address?: string;
  notes?: string;
  contact_number?: string;
  audit_code?: string;
  assigned_doctor?: string;
  dob?: string;
}
