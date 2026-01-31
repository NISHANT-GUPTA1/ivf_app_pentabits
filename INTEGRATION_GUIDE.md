# Quick Integration Guide - Using New Explainability Features

## 🚀 Quick Start

### Step 1: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The new dependencies added:
- `scipy` - For advanced statistical analysis
- `scikit-image` - For enhanced image processing

### Step 2: Test Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Visit http://localhost:8000/docs to see the updated API documentation.

---

## 📝 Example: Complete Workflow

### Backend API Call

```typescript
// In your React component or service
async function analyzeEmbryo(imageFile: File): Promise<ComprehensivePrediction> {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Prediction failed');
  }
  
  const prediction: ComprehensivePrediction = await response.json();
  return prediction;
}
```

### Frontend Display - Option 1: Full Explainability Dashboard

```typescript
import { ExplainabilityDashboard } from './components/ExplainabilityDashboard';

function EmbryoDetailView() {
  const [prediction, setPrediction] = useState<ComprehensivePrediction | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleImageUpload = async (file: File) => {
    // Create preview URL
    setImageUrl(URL.createObjectURL(file));
    
    // Get prediction
    const result = await analyzeEmbryo(file);
    setPrediction(result);
  };

  if (!prediction) {
    return <ImageUploader onUpload={handleImageUpload} />;
  }

  return (
    <ExplainabilityDashboard 
      prediction={prediction}
      embryoName="Embryo #1"
      imageUrl={imageUrl}
    />
  );
}
```

### Frontend Display - Option 2: Individual Components

```typescript
import { ConfusionMatrix } from './components/ConfusionMatrix';
import { FeatureImportance } from './components/FeatureImportance';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';

function EmbryoAnalysisView({ prediction }: { prediction: ComprehensivePrediction }) {
  return (
    <div className="space-y-6">
      {/* Quick Summary Card */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Embryo #1</h2>
            <p className="text-4xl font-bold text-emerald-600 mt-2">
              {prediction.viability_score.toFixed(1)}
            </p>
            <Badge className="mt-2">
              {prediction.confidence_level} confidence
            </Badge>
          </div>
          
          <div className="text-right">
            {prediction.blastocyst_grading && (
              <div>
                <p className="text-sm text-gray-600">Gardner Grade</p>
                <p className="text-3xl font-bold text-purple-600">
                  {prediction.blastocyst_grading.overall_grade}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Clinical Recommendation */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50">
        <h3 className="font-semibold text-lg mb-2">Clinical Recommendation</h3>
        <p className="text-xl font-bold mb-3">
          {prediction.clinical_recommendation.transfer_recommendation}
        </p>
        <div className="space-y-1">
          {prediction.clinical_recommendation.reasoning.map((reason, idx) => (
            <p key={idx} className="text-sm text-gray-700">• {reason}</p>
          ))}
        </div>
      </Card>

      {/* Morphological Details */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Morphological Analysis</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Fragmentation</p>
            <p className="text-xl font-bold">
              {prediction.morphological_analysis.fragmentation_percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              {prediction.morphological_analysis.fragmentation_level}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Circularity</p>
            <p className="text-xl font-bold">
              {prediction.morphological_analysis.circularity_score.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500">
              {prediction.morphological_analysis.circularity_grade}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Cell Symmetry</p>
            <p className="text-sm font-semibold">
              {prediction.morphological_analysis.cell_symmetry}
            </p>
          </div>
        </div>
      </Card>

      {/* Genetic Risk */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Genetic Risk Assessment</h3>
        <div className="flex items-center gap-4 mb-3">
          <Badge variant={
            prediction.genetic_risk.chromosomal_risk_level === 'High' ? 'destructive' :
            prediction.genetic_risk.chromosomal_risk_level === 'Medium' ? 'default' : 'outline'
          }>
            {prediction.genetic_risk.chromosomal_risk_level} Risk
          </Badge>
          <span className="text-sm text-gray-600">
            Aneuploidy Risk: {prediction.genetic_risk.aneuploidy_risk_score.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-gray-700">
          <strong>PGT-A Recommendation:</strong> {prediction.genetic_risk.pgt_a_recommendation}
        </p>
      </Card>

      {/* Feature Importance */}
      <FeatureImportance features={prediction.explainability.feature_importance} />

      {/* Model Performance */}
      <ConfusionMatrix />
    </div>
  );
}
```

---

## 🎨 Styling Components

All components use Tailwind CSS and shadcn/ui components. Make sure you have:

```json
// package.json dependencies
{
  "dependencies": {
    "lucide-react": "^0.263.1",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    // ... other shadcn dependencies
  }
}
```

---

## 📊 Displaying Confusion Matrix

### Option 1: Show Static Training Performance

```typescript
<ConfusionMatrix 
  modelName="Embryo Viability Ensemble Model"
/>
```

### Option 2: Show Custom Metrics (if you calculate from validation)

```typescript
const performanceData: ConfusionMatrixData = {
  true_positives: 158,
  false_positives: 18,
  true_negatives: 68,
  false_negatives: 12,
  accuracy: 0.883,
  precision: 0.898,
  recall: 0.929,
  f1_score: 0.913
};

<ConfusionMatrix 
  data={performanceData}
  modelName="Validation Set Performance"
/>
```

---

## 🔄 Updating Existing Components

### Update CycleOverview.tsx

Add explainability modal:

```typescript
import { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { ExplainabilityDashboard } from './ExplainabilityDashboard';

function CycleOverview({ embryos }) {
  const [selectedEmbryo, setSelectedEmbryo] = useState<ComprehensivePrediction | null>(null);

  return (
    <>
      {/* Existing overview */}
      <div className="grid grid-cols-3 gap-4">
        {embryos.map(embryo => (
          <div 
            key={embryo.id}
            onClick={() => setSelectedEmbryo(embryo.comprehensiveAnalysis)}
            className="cursor-pointer hover:shadow-lg transition"
          >
            {/* Embryo card */}
          </div>
        ))}
      </div>

      {/* Explainability Modal */}
      <Dialog open={!!selectedEmbryo} onOpenChange={() => setSelectedEmbryo(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedEmbryo && (
            <ExplainabilityDashboard 
              prediction={selectedEmbryo}
              embryoName="Selected Embryo"
              imageUrl={embryos.find(e => e.comprehensiveAnalysis === selectedEmbryo)?.imageUrl || ''}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 🧪 Testing the Implementation

### Test 1: Basic Prediction

```bash
# In a terminal
cd backend
python -c "
from main import *
import io
from PIL import Image
import numpy as np

# Create test image
img = Image.fromarray(np.random.randint(0, 255, (128, 128, 3), dtype=np.uint8))
buffer = io.BytesIO()
img.save(buffer, format='JPEG')
buffer.seek(0)

# Test preprocessing
image = preprocess_image_fast(buffer.read())
print(f'Image shape: {image.shape}')

# Test feature extraction
features = extract_features_fast(image)
print(f'Features extracted: {len(features)}')

# Test ensemble
result = ensemble_predict(features)
print(f'Viability score: {result[\"viability_score\"]:.1f}')
"
```

### Test 2: Full API Endpoint

```bash
# Use curl or Postman
curl -X POST "http://localhost:8000/predict" \
  -F "file=@test_embryo.jpg" \
  | jq '.viability_score, .clinical_recommendation.transfer_recommendation'
```

### Test 3: Frontend Integration

```typescript
// Create a test component
function TestAnalysis() {
  const [result, setResult] = useState<any>(null);

  const testAnalysis = async () => {
    // Create a test image blob
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('file', blob, 'test.jpg');
      
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResult(data);
      console.log('Prediction result:', data);
    });
  };

  return (
    <div>
      <button onClick={testAnalysis}>Test Analysis</button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Issue: Import errors (scipy, scikit-image)

**Solution**:
```bash
pip uninstall scipy scikit-image
pip install scipy==1.11.4 scikit-image==0.22.0
```

### Issue: CORS errors

**Solution**: Check that backend CORS middleware includes your frontend URL:
```python
allow_origins=[
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # CRA default
    # Add your URL here
]
```

### Issue: Large response size

**Solution**: The comprehensive response is detailed but necessary. If needed:
- Cache predictions on frontend
- Only fetch detailed analysis when user clicks "View Details"
- Implement pagination for multiple embryos

---

## 📱 Mobile Responsive

All components are mobile-responsive using Tailwind's responsive classes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Automatically adjusts: 
      Mobile: 1 column
      Tablet: 2 columns  
      Desktop: 3 columns */}
</div>
```

---

## 🎯 Performance Optimization

### Lazy Load Components

```typescript
import { lazy, Suspense } from 'react';

const ExplainabilityDashboard = lazy(() => 
  import('./components/ExplainabilityDashboard').then(m => ({ 
    default: m.ExplainabilityDashboard 
  }))
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ExplainabilityDashboard {...props} />
    </Suspense>
  );
}
```

### Cache Predictions

```typescript
// Simple in-memory cache
const predictionCache = new Map<string, ComprehensivePrediction>();

async function analyzeEmbryoWithCache(imageFile: File): Promise<ComprehensivePrediction> {
  const cacheKey = `${imageFile.name}-${imageFile.size}`;
  
  if (predictionCache.has(cacheKey)) {
    return predictionCache.get(cacheKey)!;
  }
  
  const prediction = await analyzeEmbryo(imageFile);
  predictionCache.set(cacheKey, prediction);
  return prediction;
}
```

---

## 📚 Additional Resources

- **CLINICAL_EXPLAINABILITY_GUIDE.md** - Complete clinical reference
- **IMPLEMENTATION_SUMMARY.md** - What was added and why
- **backend/README.md** - API documentation
- **src/types/embryo.ts** - TypeScript type definitions

---

## 🎉 You're Ready!

Your embryo assessment application now has:

✅ Full clinical explainability
✅ Comprehensive morphological analysis  
✅ Gardner grading system
✅ Genetic risk assessment
✅ Clinical recommendations
✅ Abnormality detection
✅ Confusion matrix visualization
✅ Feature importance analysis

**Start the backend, integrate the components, and demonstrate to doctors!** 🚀
