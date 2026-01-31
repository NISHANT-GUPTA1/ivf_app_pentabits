import type { EmbryoResult, EmbryoFeatures } from '../types/embryo';

// Embryo images for mock data
const embryoImages = [
  '/images/image_2.png', // Single placeholder image
];

// Generate mock embryo data for the dashboard
export function generateMockEmbryos(): EmbryoResult[] {
  const results: EmbryoResult[] = [];
  const numEmbryos = 1; // Only 1 placeholder embryo

  for (let i = 0; i < numEmbryos; i++) {
    const viabilityScore = 0; // Placeholder with 0 score
    const features = generatePlaceholderFeatures();
    const keyFindings = ['No embryo analyzed yet', 'Upload an image in Assessment Hub to begin analysis'];
    const recommendation = 'Upload embryo image for analysis';

    results.push({
      id: `placeholder-embryo`,
      name: `Placeholder`,
      imageUrl: embryoImages[0],
      viabilityScore,
      rank: 1,
      features,
      keyFindings,
      recommendation
    });
  }

  return results;
}

function generatePlaceholderFeatures(): EmbryoFeatures {
  return {
    developmentalStage: 'Not analyzed',
    symmetry: 'Fair',
    fragmentation: 'Unknown'
  };
}

function generateViabilityScore(index: number): number {
  const baseScores = [87, 82, 74, 68, 56, 45];
  const score = baseScores[index % baseScores.length] || 60;
  const variation = Math.floor(Math.random() * 6) - 3;
  return Math.max(30, Math.min(95, score + variation));
}

function generateFeatures(score: number): EmbryoFeatures {
  const isBlastocyst = score >= 60;

  if (isBlastocyst) {
    return {
      developmentalStage: score >= 75 ? 'Blastocyst (Day 5)' : 'Early Blastocyst (Day 5)',
      symmetry: score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair',
      fragmentation: score >= 75 ? '<5% (Minimal)' : score >= 65 ? '5-10% (Low)' : '10-20% (Moderate)',
      blastocystExpansion: score >= 80 ? 'Grade 4 (Expanded)' : score >= 70 ? 'Grade 3 (Full)' : 'Grade 2 (Partial)',
      innerCellMass: score >= 80 ? 'Grade A (Excellent)' : score >= 70 ? 'Grade B (Good)' : 'Grade C (Fair)',
      trophectoderm: score >= 80 ? 'Grade A (Many cells)' : score >= 70 ? 'Grade B (Several cells)' : 'Grade C (Few cells)'
    };
  } else {
    return {
      developmentalStage: score >= 50 ? '8-cell (Day 3)' : score >= 40 ? '6-cell (Day 3)' : '4-cell (Day 2)',
      symmetry: score >= 50 ? 'Good' : 'Fair',
      fragmentation: score >= 50 ? '10-15% (Moderate)' : score >= 40 ? '15-25% (Moderate)' : '>25% (High)'
    };
  }
}

function generateKeyFindings(_features: EmbryoFeatures, score: number): string[] {
  const findings: string[] = [];

  if (score >= 80) {
    findings.push('Optimal developmental progression observed');
    findings.push('Excellent morphological characteristics');
    findings.push('Minimal fragmentation indicates healthy division');
    findings.push('Strong predictive markers for implantation');
  } else if (score >= 70) {
    findings.push('Good developmental stage for transfer');
    findings.push('Well-formed cellular structure');
    findings.push('Acceptable fragmentation levels');
    findings.push('Positive indicators for viability');
  } else if (score >= 50) {
    findings.push('Adequate developmental progression');
    findings.push('Moderate morphological quality');
    findings.push('Some fragmentation present but acceptable');
    findings.push('May benefit from extended culture');
  } else {
    findings.push('Suboptimal developmental characteristics');
    findings.push('Concerns with cellular organization');
    findings.push('Elevated fragmentation levels observed');
    findings.push('Limited implantation potential');
  }

  return findings;
}

function generateRecommendation(score: number): string {
  if (score >= 80) {
    return 'Excellent candidate for transfer. Highest priority for fresh or frozen embryo transfer based on clinical protocol.';
  } else if (score >= 70) {
    return 'Good candidate for transfer. Consider for fresh transfer or cryopreservation depending on patient factors.';
  } else if (score >= 50) {
    return 'Moderate quality. May be suitable for transfer if higher-graded embryos unavailable.';
  } else {
    return 'Lower viability potential. Consider extended culture or discuss alternative options with patient.';
  }
}
