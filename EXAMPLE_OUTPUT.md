# Example API Response - Complete Embryo Analysis

## Sample Request

```bash
POST http://localhost:8000/predict
Content-Type: multipart/form-data

file: embryo_image_day5.jpg
```

---

## Sample Response (Complete JSON)

```json
{
  "prediction": "good",
  "viability_score": 82.5,
  "confidence": 0.85,
  "confidence_level": "high",
  
  "model_predictions": [
    {
      "model": "model_1",
      "prediction": 1,
      "probability_good": 0.83,
      "probability_not_good": 0.17
    },
    {
      "model": "model_2",
      "prediction": 1,
      "probability_good": 0.85,
      "probability_not_good": 0.15
    },
    {
      "model": "model_3",
      "prediction": 1,
      "probability_good": 0.87,
      "probability_not_good": 0.13
    }
  ],
  
  "features": {
    "std_dev_mean": 38.5,
    "std_dev_std": 0.0,
    "mean_intensity_mean": 132.8,
    "mean_intensity_std": 0.0,
    "contrast_mean": 185.3,
    "contrast_std": 0.0,
    "entropy_mean": 6.2,
    "entropy_std": 0.0,
    "edge_density_mean": 0.158,
    "edge_density_std": 0.0,
    "gradient_magnitude_mean": 42.3,
    "gradient_magnitude_std": 0.0,
    "circularity_mean": 0.873,
    "circularity_std": 0.0,
    "num_regions_mean": 8.0,
    "num_regions_std": 0.0,
    "frame_number": 0.0,
    "time_elapsed": 0.0,
    "frames_analyzed": 1.0,
    "total_duration": 0.0
  },
  
  "morphological_analysis": {
    "fragmentation_level": "Moderate (10-25%)",
    "fragmentation_percentage": 12.5,
    "circularity_score": 0.873,
    "circularity_grade": "Excellent",
    "boundary_definition": "Sharp - Well-defined boundaries",
    "cell_symmetry": "Excellent - Highly symmetric",
    "zona_pellucida_thickness": 15.2,
    "zona_pellucida_integrity": "Intact - Normal appearance",
    "cytoplasmic_granularity": "Minimal - Smooth cytoplasm",
    "vacuolization": "None - No vacuoles detected"
  },
  
  "blastocyst_grading": {
    "expansion_stage": 4,
    "expansion_description": "Expanded blastocyst",
    "inner_cell_mass_grade": "A",
    "trophectoderm_grade": "A",
    "overall_grade": "4AA",
    "quality_assessment": "Excellent - Top quality blastocyst"
  },
  
  "morphokinetics": {
    "estimated_developmental_stage": "Expanded Blastocyst (Day 5-6)",
    "timing_assessment": "Optimal - Expected developmental timing",
    "predicted_day": 5
  },
  
  "genetic_risk": {
    "chromosomal_risk_level": "Low",
    "aneuploidy_risk_score": 18.5,
    "pgt_a_recommendation": "Optional - Low risk profile",
    "risk_factors": [
      "No significant risk factors identified"
    ]
  },
  
  "clinical_recommendation": {
    "transfer_recommendation": "Transfer immediately - Excellent candidate",
    "transfer_priority": 1,
    "freeze_recommendation": false,
    "discard_recommendation": false,
    "reasoning": [
      "High viability score (82.5) with low genetic risk",
      "Morphology: Excellent - Highly symmetric",
      "Blastocyst grade: 4AA"
    ],
    "clinical_notes": "Embryo shows excellent - highly symmetric with moderate (10-25%). Genetic risk assessment: Low. Gardner grade: 4AA."
  },
  
  "explainability": {
    "feature_importance": {
      "Circularity (cell shape)": 87.3,
      "Fragmentation indicator": 80.5,
      "Cell boundary definition": 79.0,
      "Cytoplasm quality": 52.0,
      "Cell complexity": 93.0,
      "Gradient sharpness": 84.6,
      "Contrast quality": 72.7,
      "Structural integrity": 60.0
    },
    "top_positive_features": [
      {
        "feature": "Cell complexity",
        "contribution": 93.0
      },
      {
        "feature": "Circularity (cell shape)",
        "contribution": 87.3
      },
      {
        "feature": "Gradient sharpness",
        "contribution": 84.6
      }
    ],
    "top_negative_features": [],
    "decision_factors": [
      "✓ Excellent cell shape and symmetry",
      "✓ Low fragmentation - uniform appearance",
      "✓ Well-defined cell boundaries",
      "✓ Minimal cellular fragmentation"
    ],
    "confidence_explanation": "High confidence (85.0%) - All 3 AI models strongly agree on this assessment"
  },
  
  "quality_metrics": {
    "agreement_rate": 1.0,
    "prediction_consistency": "High - Models strongly agree",
    "model_confidence_scores": [
      0.83,
      0.85,
      0.87
    ],
    "uncertainty_level": "Low - Very confident prediction"
  },
  
  "abnormality_flags": {
    "has_abnormalities": false,
    "abnormality_types": [
      "No significant abnormalities detected"
    ],
    "severity": "None - Normal morphology",
    "requires_manual_review": false
  },
  
  "analysis_timestamp": "2026-01-31T14:23:45.678912",
  "processing_time_ms": 285.42
}
```

---

## Visual Interpretation

### 🎯 Summary Card

```
┌─────────────────────────────────────────────────┐
│  EMBRYO #1 - Day 5 Analysis                     │
│                                                  │
│  Viability Score: 82.5  (High Confidence: 85%)  │
│  Gardner Grade: 4AA     (Excellent Quality)     │
│                                                  │
│  ✅ Transfer immediately - Excellent candidate  │
│  Priority: 1 (Highest)                          │
└─────────────────────────────────────────────────┘
```

---

### 🔬 Morphological Assessment

```
┌──────────────────────────────────────────┐
│  Fragmentation:        12.5% (Moderate)  │
│  ├─ Level: Acceptable                    │
│  └─ Visual: [■■■□□□□□□□] 25% scale      │
│                                          │
│  Circularity:          0.873 (Excellent) │
│  ├─ Grade: Excellent                     │
│  └─ Visual: [■■■■■■■■■□] 87.3%          │
│                                          │
│  Cell Symmetry:        Excellent         │
│  Boundary Definition:  Sharp             │
│  Cytoplasm:           Minimal granularity│
│  Zona Pellucida:      15.2μm, Intact     │
│  Vacuolization:       None detected      │
└──────────────────────────────────────────┘
```

---

### 📊 Blastocyst Grading (Gardner)

```
┌──────────────────────────────────────────┐
│        GARDNER GRADE: 4AA                │
│                                          │
│  Expansion Stage: 4 (Expanded)           │
│  ┌────────────────────────────────┐     │
│  │ 1 ─ 2 ─ 3 ─[4]─ 5 ─ 6         │     │
│  │ Early  ↑  Full  ↑  Hatching    │     │
│  └────────────────────────────────┘     │
│                                          │
│  Inner Cell Mass (ICM): A (Best)         │
│  Trophectoderm (TE):    A (Best)         │
│                                          │
│  ★★★★★ Excellent - Top quality          │
└──────────────────────────────────────────┘
```

---

### 🧬 Genetic Risk Assessment

```
┌──────────────────────────────────────────┐
│  Chromosomal Risk:  LOW                  │
│  Aneuploidy Score:  18.5 / 100           │
│                                          │
│  Risk Level: [■■░░░░░░░░] 18.5%         │
│                                          │
│  PGT-A: Optional - Low risk profile      │
│                                          │
│  Risk Factors:                           │
│    ✓ No significant risks identified     │
└──────────────────────────────────────────┘
```

---

### 🔍 Why This Score? (Explainability)

```
┌──────────────────────────────────────────┐
│  MODEL CONFIDENCE: 85% (HIGH)            │
│                                          │
│  Model Agreement:                        │
│    Model 1: 83% ■■■■■■■■□□               │
│    Model 2: 85% ■■■■■■■■■□               │
│    Model 3: 87% ■■■■■■■■■□               │
│    Agreement Rate: 100%                  │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  TOP FEATURES (What helped the score):   │
│                                          │
│  #1 Cell complexity        93.0         │
│      [■■■■■■■■■■■] High    ↑ Positive   │
│                                          │
│  #2 Circularity            87.3         │
│      [■■■■■■■■■□□] Excellent ↑ Positive │
│                                          │
│  #3 Gradient sharpness     84.6         │
│      [■■■■■■■■□□□] Sharp    ↑ Positive  │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  KEY DECISION FACTORS:                   │
│    ✓ Excellent cell shape and symmetry  │
│    ✓ Low fragmentation - uniform        │
│    ✓ Well-defined cell boundaries       │
│    ✓ Minimal cellular fragmentation     │
└──────────────────────────────────────────┘
```

---

### 💊 Clinical Recommendation

```
┌──────────────────────────────────────────┐
│  RECOMMENDATION:                         │
│  🚀 Transfer immediately                 │
│     Excellent candidate                  │
│                                          │
│  Priority: 1 / 5 (Highest)               │
│                                          │
│  Actions:                                │
│    ✅ Transfer: YES                      │
│    ❄️ Freeze:   NO                       │
│    🗑️ Discard:  NO                       │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  REASONING:                              │
│                                          │
│  1. High viability score (82.5)          │
│     with low genetic risk                │
│                                          │
│  2. Morphology: Excellent - Highly       │
│     symmetric                            │
│                                          │
│  3. Blastocyst grade: 4AA                │
│     (Top quality)                        │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  CLINICAL NOTES:                         │
│  Embryo shows excellent symmetry with    │
│  moderate fragmentation (12.5%).         │
│  Genetic risk: Low. Gardner: 4AA.        │
│  Optimal candidate for transfer.         │
└──────────────────────────────────────────┘
```

---

### ⚠️ Quality & Safety Checks

```
┌──────────────────────────────────────────┐
│  ABNORMALITY DETECTION:                  │
│  ✅ No abnormalities detected            │
│                                          │
│  Severity: None - Normal morphology      │
│  Manual Review: Not required             │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  MODEL QUALITY METRICS:                  │
│                                          │
│  Agreement Rate:    100.0%               │
│  Consistency:       High - Models agree  │
│  Uncertainty:       Low - Very confident │
│                                          │
│  ✅ Safe for automated assessment        │
└──────────────────────────────────────────┘
```

---

## Example 2: Poor Quality Embryo

### Sample Response (Abbreviated)

```json
{
  "viability_score": 28.3,
  "confidence": 0.78,
  "confidence_level": "medium",
  
  "morphological_analysis": {
    "fragmentation_level": "Severe (>25%)",
    "fragmentation_percentage": 35.8,
    "circularity_score": 0.432,
    "circularity_grade": "Poor",
    "cell_symmetry": "Poor - Significant asymmetry"
  },
  
  "blastocyst_grading": {
    "expansion_stage": 2,
    "overall_grade": "2CC",
    "quality_assessment": "Poor - Consider extended culture"
  },
  
  "genetic_risk": {
    "chromosomal_risk_level": "High",
    "aneuploidy_risk_score": 68.5,
    "pgt_a_recommendation": "Strongly recommended - High aneuploidy risk",
    "risk_factors": [
      "High fragmentation associated with aneuploidy risk",
      "Asymmetric division may indicate chromosomal abnormalities",
      "Low morphological quality correlates with aneuploidy"
    ]
  },
  
  "clinical_recommendation": {
    "transfer_recommendation": "Consider discard - Poor viability indicators",
    "transfer_priority": 5,
    "freeze_recommendation": false,
    "discard_recommendation": true,
    "reasoning": [
      "Poor viability score (28.3)",
      "High fragmentation: 35.8%",
      "Multiple negative quality indicators"
    ]
  },
  
  "abnormality_flags": {
    "has_abnormalities": true,
    "abnormality_types": [
      "Severe fragmentation (>25%)",
      "Significant asymmetry detected",
      "High chromosomal risk indicators"
    ],
    "severity": "Severe - Multiple abnormalities",
    "requires_manual_review": true
  }
}
```

### Visual Interpretation

```
┌─────────────────────────────────────────────────┐
│  EMBRYO #2 - Day 5 Analysis                     │
│                                                  │
│  Viability Score: 28.3  ⚠️ (Medium Confidence)  │
│  Gardner Grade: 2CC     (Poor Quality)          │
│                                                  │
│  ⚠️ Consider discard - Poor viability           │
│  Priority: 5 (Lowest)                           │
│                                                  │
│  🚨 ABNORMALITIES DETECTED:                     │
│     • Severe fragmentation (35.8%)              │
│     • Significant asymmetry                     │
│     • High chromosomal risk                     │
│                                                  │
│  ⚠️ MANUAL REVIEW REQUIRED                      │
└─────────────────────────────────────────────────┘
```

---

## Processing Metadata

```
Analysis Timestamp: 2026-01-31 14:23:45
Processing Time:    285.42 ms
Models Used:        3 (ensemble)
Image Size:         128x128 pixels
Features Extracted: 20 morphological
```

---

## Integration Example

```typescript
// Fetch prediction
const response = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  body: formData
});

const prediction: ComprehensivePrediction = await response.json();

// Display summary
console.log(`
Viability Score: ${prediction.viability_score}
Gardner Grade: ${prediction.blastocyst_grading?.overall_grade}
Recommendation: ${prediction.clinical_recommendation.transfer_recommendation}
Confidence: ${(prediction.confidence * 100).toFixed(1)}%
Processing Time: ${prediction.processing_time_ms}ms
`);

// Check if manual review needed
if (prediction.abnormality_flags.requires_manual_review) {
  alert('⚠️ Manual review by embryologist required');
}

// Show explainability
prediction.explainability.decision_factors.forEach(factor => {
  console.log(factor);
});
```

---

**This comprehensive output provides everything an embryologist needs to make an informed decision!** 🎯
