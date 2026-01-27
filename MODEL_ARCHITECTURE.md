# Model Architecture - Embryo Viability Analysis

## Overview
This project uses an **ensemble machine learning approach** with three **Random Forest Classifier** models trained independently on embryo time-lapse image datasets to predict embryo viability for IVF procedures.

---

## Model Details

### Algorithm
**Random Forest Classifier** (Scikit-learn)

### Ensemble Configuration
- **Number of Models**: 3 independent models
  - `embryo_model_1.pkl`
  - `embryo_model_2.pkl`
  - `embryo_model_3.pkl`
- **Ensemble Strategy**: Probability averaging
  - Each model predicts independently
  - Final probability = average of all 3 model probabilities
  - Classification threshold: 0.5 (good if avg_probability > 0.5)
  - Confidence level = max(probability_good, probability_not_good)

### Model Hyperparameters
```python
RandomForestClassifier(
    n_estimators=200,           # 200 decision trees per model
    max_depth=10,               # Maximum tree depth
    min_samples_split=4,        # Minimum samples to split internal node
    min_samples_leaf=2,         # Minimum samples at leaf node
    class_weight='balanced',    # Handle class imbalance
    random_state=42,            # Reproducibility
    n_jobs=-1,                  # Use all CPU cores
    verbose=1
)
```

---

## Feature Engineering

### Input Features (20 total)
The model uses **20 engineered features** extracted from embryo images:

#### Morphological Features (16 features)
8 base features, each with mean and standard deviation:

1. **std_dev** (mean, std): Standard deviation of pixel intensities - fragmentation indicator
2. **mean_intensity** (mean, std): Average pixel brightness
3. **contrast** (mean, std): Difference between max and min pixel intensity
4. **entropy** (mean, std): Shannon entropy of intensity histogram - texture uniformity measure
5. **edge_density** (mean, std): Proportion of edge pixels detected via Canny edge detection
6. **gradient_magnitude** (mean, std): Average Sobel gradient magnitude - boundary sharpness
7. **circularity** (mean, std): Shape regularity metric (4π × area / perimeter²)
8. **num_regions** (mean, std): Count of connected components - cell fragmentation

#### Temporal Features (4 features)
For static images, these are set to default values:
- **frame_number**: Frame index in time-lapse sequence (0 for static images)
- **time_elapsed**: Time since start (0 for static images)
- **frames_analyzed**: Number of frames processed (1 for static images)
- **total_duration**: Total video duration (0 for static images)

### Feature Extraction Pipeline
```
Raw Image (JPG/PNG/TIFF)
    ↓
Resize to 128×128 (BILINEAR interpolation)
    ↓
Convert to RGB (if needed)
    ↓
Convert to Grayscale (for feature extraction)
    ↓
Extract 8 morphological features using OpenCV
    ↓
Compute mean & std for each feature
    ↓
Add 4 temporal features
    ↓
Result: 20-dimensional feature vector
```

---

## Training Pipeline

### Dataset
- **Source**: Human embryo time-lapse image sequences (F-45 focal plane)
- **Size**: 211,248 images from 704 embryos
- **Labels**: Binary classification
  - **Class 0 (Not Good)**: 229 embryos (32.5%)
  - **Class 1 (Good)**: 475 embryos (67.5%)
- **Labeling Criteria**: Based on developmental progression milestones
  - Good: ≥12 developmental stages with t8, OR ≥10 stages with both t4 and t8
  - Not Good: <10 stages or missing critical milestones

### Preprocessing Steps
1. **Feature Scaling**: StandardScaler normalization (fit on training set)
2. **Class Balancing**: SMOTE (Synthetic Minority Over-sampling Technique)
   - Balances class distribution in training set
   - k_neighbors=3 for SMOTE
3. **Train-Test Split**: 80% train / 20% test (stratified)

### Training Configuration
```python
# Data Split
train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Feature Scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# SMOTE for Class Balance
smote = SMOTE(random_state=42, k_neighbors=3)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train_scaled, y_train)

# Model Training
model.fit(X_train_balanced, y_train_balanced)
```

---

## Model Performance

### Expected Metrics
- **Accuracy**: 85-90%
- **Precision**: High precision for "Good" class
- **Recall**: Balanced recall for both classes
- **AUC-ROC**: >0.85
- **F1-Score**: >0.80

### Evaluation Metrics Tracked
- Confusion Matrix
- Classification Report (per-class metrics)
- ROC-AUC Score
- Feature Importance Rankings

---

## Inference Pipeline

### Backend API Flow
```
1. Client uploads embryo image (multipart/form-data)
        ↓
2. FastAPI receives image bytes
        ↓
3. Image preprocessing (resize, convert to array)
        ↓
4. Feature extraction (20 features)
        ↓
5. Load 3 trained models (.pkl files)
        ↓
6. Each model predicts:
   - Class (0 or 1)
   - Probability [prob_not_good, prob_good]
        ↓
7. Ensemble prediction:
   - Average probabilities across 3 models
   - Final class = argmax(avg_probabilities)
   - Confidence = max(avg_probabilities)
        ↓
8. Format response:
   {
     "viability_score": int(0-100),  # probability_good × 100
     "prediction": "good" | "poor",
     "confidence_level": "high" | "medium" | "low",
     "model_predictions": [...],     # Individual model outputs
     "features": {...}               # Extracted features
   }
        ↓
9. Return JSON response to client
```

### Confidence Level Determination
```python
confidence = max(probability_good, probability_not_good)

if confidence >= 0.80:
    confidence_level = "high"
elif confidence >= 0.60:
    confidence_level = "medium"
else:
    confidence_level = "low"
```

---

## Technology Stack

### Core ML Libraries
- **scikit-learn 1.6.1**: RandomForestClassifier, StandardScaler, train_test_split, metrics
- **imbalanced-learn**: SMOTE for class balancing
- **joblib 1.4.2**: Model serialization (.pkl files)

### Image Processing
- **OpenCV 4.10**: Image manipulation, edge detection (Canny), gradient calculation (Sobel), contour detection
- **Pillow 10.4.0**: Image I/O, format conversion, resizing
- **NumPy 1.26.4**: Array operations, statistical calculations

### Backend Framework
- **FastAPI 0.115.0**: REST API for model serving
- **Uvicorn 0.31.0**: ASGI server
- **Pydantic**: Request/response validation

---

## Model Files

### Stored Artifacts
```
Complete_training_pipeline/
├── embryo_model_1.pkl          # Trained RandomForest model #1
├── embryo_model_2.pkl          # Trained RandomForest model #2
├── embryo_model_3.pkl          # Trained RandomForest model #3
├── scaler_F-45.pkl             # StandardScaler (optional)
├── feature_names_F-45.json     # Feature name list
└── results_F-45.json           # Training metrics
```

### Model Loading (Backend)
```python
models = {}
for i in range(1, 4):
    model_path = f"../Complete_training_pipeline/embryo_model_{i}.pkl"
    models[f"model_{i}"] = joblib.load(model_path)
```

---

## Advantages of This Architecture

1. **Ensemble Robustness**: 3 independent models reduce variance and improve generalization
2. **Balanced Training**: SMOTE handles class imbalance effectively
3. **Interpretability**: Random Forest provides feature importance rankings
4. **Fast Inference**: <100ms prediction time for real-time analysis
5. **Scalability**: Models can be retrained independently
6. **Production-Ready**: Serialized .pkl files for easy deployment

---

## Future Enhancements

- [ ] Explore deep learning models (CNNs for raw image input)
- [ ] Add XGBoost and Logistic Regression to ensemble
- [ ] Implement cross-validation for hyperparameter tuning
- [ ] Train on larger datasets (>10,000 embryos)
- [ ] Incorporate time-lapse video features (temporal dynamics)
- [ ] Add explainability (SHAP values, LIME)
- [ ] Model versioning and A/B testing framework

---

## References

- **Dataset**: Human embryo time-lapse imaging (F-45 focal plane)
- **Training Notebook**: `Complete_training_pipeline/Copy_of_embryo_classifier_F_45_COMPLETE.ipynb`
- **Backend Implementation**: `backend/main.py`
- **Algorithm**: Breiman, L. (2001). "Random Forests". Machine Learning. 45(1): 5–32.
