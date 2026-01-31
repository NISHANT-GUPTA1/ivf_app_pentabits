export interface EmbryoFeatures {
  developmentalStage: string;
  symmetry: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  fragmentation: string;
  blastocystExpansion?: string;
  innerCellMass?: string;
  trophectoderm?: string;
}

export interface EmbryoResult {
  id: string;
  name: string;
  imageUrl: string;
  viabilityScore: number;
  rank: number;
  features: EmbryoFeatures;
  keyFindings: string[];
  recommendation: string;
  // Manual Override Fields
  manualGrade?: string;
  overrideScore?: number;
  overrideReason?: string;
  notes?: string;
  // Metadata for uploaded images
  uploadedAt?: Date;
  processingStatus?: 'pending' | 'processing' | 'completed';
}
