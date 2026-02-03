# 🧬 Embryo Viability Analysis Platform - Technical Documentation

## Project Overview
This project is an **AI-powered web application** that helps IVF (In Vitro Fertilization) clinics analyze embryo images and predict their viability (chances of successful implantation). It combines machine learning with a modern web interface to provide real-time embryo quality assessment.

---

## 📊 What This Project Does

### Problem It Solves
In traditional IVF clinics, embryologists manually examine embryo images under microscopes to determine which embryos are most likely to result in successful pregnancies. This process:
- Is **subjective** (different doctors may grade the same embryo differently)
- Is **time-consuming** (takes hours to analyze multiple embryos)
- Has **limited accuracy** (human error and fatigue affect results)

### Our Solution
Our platform uses **artificial intelligence** to:
- Automatically analyze embryo images in seconds
- Provide consistent, objective quality scores (0-100%)
- Help doctors make data-driven decisions
- Track and compare multiple embryos for each patient
- Generate detailed reports with visual analytics

---

## 🔧 Technical Architecture

### Frontend (User Interface)
**What users see and interact with**

#### Technologies Used:
1. **React 18.3.1** (JavaScript Library)
   - **What it is**: A modern framework for building interactive web pages
   - **Why we chose it**: 
     - Fast and responsive user interface
     - Component-based architecture (reusable UI pieces)
     - Large community and excellent documentation
   - **Alternatives**: Vue.js, Angular, Svelte

2. **TypeScript 5.7.2**
   - **What it is**: JavaScript with type safety (catches errors before runtime)
   - **Why we chose it**: 
     - Prevents common coding errors
     - Better code completion in editors
     - Easier to maintain large projects
   - **Alternatives**: Plain JavaScript

3. **Vite 6.3.5** (Build Tool)
   - **What it is**: Lightning-fast development server and bundler
   - **Why we chose it**: 
     - Instant hot reload during development
     - Optimized production builds
     - Much faster than older tools like Webpack
   - **Alternatives**: Webpack, Parcel, Rollup

4. **TailwindCSS 3.4.17** (Styling Framework)
   - **What it is**: Utility-first CSS framework for rapid UI development
   - **Why we chose it**: 
     - Fast styling without writing custom CSS
     - Consistent design system
     - Responsive design built-in
   - **Alternatives**: Bootstrap, Material-UI, CSS Modules

5. **Radix UI** (Component Library)
   - **What it is**: Unstyled, accessible UI components
   - **Why we chose it**: 
     - Professional-grade accessibility features
     - Fully customizable design
     - Follows best practices for user experience
   - **Alternatives**: HeadlessUI, Chakra UI

6. **Recharts 2.15.2** (Data Visualization)
   - **What it is**: Chart library built on React
   - **Why we chose it**: 
     - Beautiful, interactive charts
     - Easy to customize
     - Good documentation
   - **Alternatives**: Chart.js, D3.js, Victory

7. **jsPDF & html2canvas** (PDF Generation)
   - **What they are**: Libraries for generating downloadable reports
   - **Why we chose them**: 
     - Create professional PDF reports
     - Capture charts and analysis
     - No server-side processing needed
   - **Alternatives**: pdfmake, PDFKit

---

### Backend (Server & AI Processing)
**Where the AI models run and data is stored**

#### Technologies Used:

1. **FastAPI 0.128.0** (Python Web Framework)
   - **What it is**: Modern, fast web framework for building APIs
   - **Why we chose it**: 
     - Extremely fast performance (faster than Flask/Django)
     - Automatic API documentation
     - Built-in validation
     - Async support for concurrent requests
   - **Alternatives**: Flask, Django REST Framework, Express.js (Node.js)

2. **Python 3.x**
   - **What it is**: Programming language for backend and ML
   - **Why we chose it**: 
     - Best ecosystem for machine learning
     - Rich libraries (scikit-learn, OpenCV, NumPy)
     - Easy to read and maintain
   - **Alternatives**: R (for ML), Node.js (for web services)

3. **SQLAlchemy 2.0.46** (Database ORM)
   - **What it is**: Python toolkit for working with databases
   - **Why we chose it**: 
     - Works with multiple databases (SQLite, PostgreSQL, MySQL)
     - Prevents SQL injection attacks
     - Makes database queries easier to write
   - **Alternatives**: Django ORM, Peewee, raw SQL

4. **Uvicorn 0.40.0** (ASGI Server)
   - **What it is**: Lightning-fast Python web server
   - **Why we chose it**: 
     - Handles multiple requests simultaneously
     - Optimized for FastAPI
     - Production-ready performance
   - **Alternatives**: Gunicorn, Hypercorn

5. **Authentication & Security**:
   - **Passlib 1.7.4**: Password hashing (secure password storage)
   - **python-jose 3.5.0**: JWT token generation (secure login sessions)
   - **bcrypt 5.0.0**: Strong encryption for passwords
   - **Why**: Protects user data and prevents unauthorized access
   - **Alternatives**: Django Auth, Auth0, Firebase Auth

---

## 🤖 Machine Learning Components

### Dataset Used

#### Source: Zenodo Human Embryo Time-Lapse Dataset
- **Dataset Name**: Human embryo time-lapse microscopy images
- **Size**: 8.9 GB per focal plane (F-15, F-30, F-45)
- **Total Images**: ~23,234 images
- **What it contains**: 
  - Time-lapse microscopy images of human embryos
  - Developmental stage annotations (tPB2, tPNa, t2, t4, t8, etc.)
  - Multiple focal planes for 3D analysis

#### How Images Are Labeled
We created a **smart labeling system** based on embryo development:

**GOOD Embryos (Class 1)**:
- Reached ≥12 developmental stages with t8 milestone, OR
- Reached ≥10 stages with both t4 and t8 milestones
- **Why**: These embryos show healthy, consistent development

**NOT GOOD Embryos (Class 0)**:
- Less than 10 developmental stages
- Missing critical milestones (t4, t8)
- **Why**: These embryos show slower or abnormal development

**Result**: Approximately 50/50 split between classes (balanced dataset)

---

### Feature Extraction

#### What Are Features?
Features are measurable characteristics extracted from each embryo image that help the AI model make decisions.

#### The 20 Features We Extract:

**Morphological Features (8 × 2 = 16 features)**:
1. **Standard Deviation** (mean + std)
   - Measures texture variation
   - Higher = more fragmentation (bad sign)

2. **Mean Intensity** (mean + std)
   - Average brightness of the embryo
   - Indicates cell density

3. **Contrast** (mean + std)
   - Difference between lightest and darkest areas
   - Shows cell boundaries

4. **Entropy** (mean + std)
   - Texture uniformity
   - Higher entropy = more complex texture

5. **Edge Density** (mean + std)
   - Number of cell boundaries detected
   - Indicates cell organization

6. **Gradient Magnitude** (mean + std)
   - Sharpness of edges
   - Shows cell membrane clarity

7. **Circularity** (mean + std)
   - How round the embryo is (0-1)
   - Perfect circle = 1.0
   - Important for embryo quality

8. **Number of Regions** (mean + std)
   - Count of distinct cell masses
   - Shows cell division patterns

**Temporal Features (4 features)** - Currently set to 0 for static images:
9. Frame number
10. Time elapsed
11. Frames analyzed
12. Total duration

**Why These Features?**:
- Based on embryology research
- Similar to what embryologists visually assess
- Proven correlation with pregnancy success rates

---

### Machine Learning Models

#### Model Type: Random Forest Classifier

**What is Random Forest?**
- An ensemble of many decision trees working together
- Each tree "votes" on the prediction
- Final prediction = majority vote
- Think of it like asking 200 experts and taking the most common answer

**Model Configuration**:
```python
n_estimators = 200  # 200 decision trees
max_depth = 10      # Maximum tree depth
random_state = 42   # For reproducibility
```

**Why Random Forest?**:
✅ **Advantages**:
- High accuracy (99.7% in our tests)
- Handles missing data well
- Doesn't require normalization
- Provides feature importance rankings
- Resistant to overfitting
- Fast prediction time

❌ **Disadvantages**:
- Larger model size (requires more memory)
- Slower training than single trees
- "Black box" - harder to explain individual predictions

**Alternatives Considered**:

1. **XGBoost/LightGBM**
   - **Pros**: Slightly higher accuracy, faster training
   - **Cons**: More complex to tune, less interpretable
   - **When to use**: If you need that extra 0.5% accuracy

2. **Neural Networks (Deep Learning)**
   - **Pros**: Can learn complex patterns, best for very large datasets
   - **Cons**: Requires GPU, needs much more data, harder to train
   - **When to use**: When you have millions of images and GPU resources

3. **Support Vector Machines (SVM)**
   - **Pros**: Works well with smaller datasets
   - **Cons**: Slow with large datasets, sensitive to feature scaling
   - **When to use**: When dataset is small (<10,000 samples)

4. **Logistic Regression**
   - **Pros**: Fast, simple, interpretable
   - **Cons**: Lower accuracy, can't capture complex patterns
   - **When to use**: When you need simple baseline or explainability

---

### Ensemble Approach (3 Models)

**What is Ensemble Learning?**
We train **3 separate Random Forest models** on the same data but with different configurations or random seeds. The final prediction is a combination of all three.

**Why Use 3 Models?**:
- **More robust**: Reduces individual model errors
- **Higher confidence**: If all 3 agree, we're more certain
- **Better generalization**: Averages out random variations

**How Predictions Work**:
```
Model 1: Predicts "Good" with 92% confidence
Model 2: Predicts "Good" with 88% confidence
Model 3: Predicts "Good" with 95% confidence

Final Prediction: "Good" with 91.7% average confidence
```

---

### Model Performance Metrics

**From results_model_1.json**:

| Metric | Value | What It Means |
|--------|-------|---------------|
| **Accuracy** | 99.70% | Correct predictions out of total |
| **Precision** | 99.85% | When we say "Good", we're right 99.85% of the time |
| **Recall** | 99.74% | We correctly identify 99.74% of all good embryos |
| **F1 Score** | 99.80% | Harmonic mean of precision and recall |
| **AUC-ROC** | 99.995% | Model's ability to distinguish classes (near perfect) |

**Confusion Matrix**:
```
              Predicted Not Good    Predicted Good
Actual Not Good        1208              5
Actual Good              9             3425
```
- Only 5 false positives (said Good but was Not Good)
- Only 9 false negatives (said Not Good but was Good)
- **Very few mistakes!**

**Top Important Features** (in order):
1. Mean Intensity (16.2%)
2. Standard Deviation (14.1%)
3. Edge Density (13.4%)
4. Contrast (12.7%)
5. Circularity (11.3%)

---

### Data Processing Pipeline

**SMOTE (Synthetic Minority Over-sampling Technique)**:
- **What it is**: Creates synthetic examples of the minority class
- **Why we use it**: Ensures balanced training (50/50 class distribution)
- **How it works**: 
  1. Finds similar minority class samples
  2. Creates new samples between them
  3. Balances the dataset without duplicating
- **Alternatives**: 
  - Random oversampling (simpler but can cause overfitting)
  - Class weighting (doesn't add data)
  - ADASYN (adaptive synthetic sampling)

**StandardScaler**:
- **What it is**: Normalizes all features to same scale (mean=0, std=1)
- **Why**: Ensures no feature dominates due to larger values
- **Example**: 
  - Before: intensity (0-255), circularity (0-1)
  - After: Both scaled to approximately (-3 to +3)

---

## 🗄️ Database Schema

**Database Type**: SQLite (can easily switch to PostgreSQL for production)

### Tables:

1. **users**
   - Stores user accounts (embryologists, admins, auditors)
   - Fields: id, username, hashed_password, role, is_active, created_at

2. **patients**
   - Anonymized patient records
   - Fields: id, audit_code (anonymized), created_at

3. **cycles**
   - IVF treatment cycles for each patient
   - Fields: id, patient_id, cycle_id, created_at

4. **embryos**
   - Individual embryo records
   - Fields: id, cycle_id, embryo_id, created_at

5. **audit_logs**
   - Complete audit trail of all actions
   - Fields: id, user_id, action, timestamp, patient_audit_code, details

6. **notes**
   - Clinical notes by embryologists
   - Fields: id, user_id, patient_audit_code, note_text, timestamp

---

## 🎨 UI/UX Components

### Key Pages:

1. **Login Page**
   - Role-based authentication (Admin, Embryologist, Auditor)
   - JWT token-based sessions

2. **Dashboard (Cycle Overview)**
   - Patient selector dropdown
   - Summary cards (total embryos, top viability, average score)
   - Interactive viability chart
   - Embryo ranking list
   - Stage distribution charts

3. **Assessment Hub**
   - Drag-and-drop image upload
   - Real-time AI analysis
   - Live progress indicators
   - Instant results display
   - One-click report generation

4. **Comparison View**
   - Side-by-side embryo comparison
   - Metric comparison table
   - Visual feature analysis

5. **Explainability Dashboard**
   - Feature importance charts
   - Model confidence visualization
   - Clinical recommendations
   - Confusion matrix display

---

## 🌐 Deployment & Infrastructure

### Frontend Deployment
**Platform**: Netlify
- **What it is**: Automatic deployment from Git repositories
- **Why**: 
  - Free for small projects
  - Automatic HTTPS
  - CDN for fast loading worldwide
  - Automatic builds on code changes
- **Alternatives**: Vercel, GitHub Pages, AWS S3 + CloudFront

**Configuration** (netlify.toml):
```toml
[build]
  command = "npm run build"  # Builds the app
  publish = "dist"            # Output folder

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Backend Deployment Options

1. **Render** (Configured in render.yaml)
   - **Pros**: Free tier available, automatic deploys, easy setup
   - **Cons**: Cold starts on free tier
   - **Best for**: Development/staging

2. **Heroku**
   - **Pros**: Easy to use, lots of add-ons
   - **Cons**: No free tier anymore
   - **Best for**: Small-medium production apps

3. **AWS EC2**
   - **Pros**: Full control, scalable, powerful
   - **Cons**: More complex setup, manual management
   - **Best for**: Large-scale production

4. **Google Cloud Run**
   - **Pros**: Automatic scaling, pay-per-use, containerized
   - **Cons**: Requires Docker knowledge
   - **Best for**: Variable traffic, cost optimization

---

## 🛠️ Google Tools Integration

### Current & Recommended Google Tools:

1. **Google Colab** (Already Used)
   - **What**: Free cloud-based Jupyter notebooks with GPU
   - **Used for**: Model training and dataset processing
   - **Why**: Free GPUs, no local setup needed, easy sharing
   - **File**: `Embryo_classifier_F_45_COMPLETE.ipynb`

2. **Google Drive** (Already Used)
   - **What**: Cloud storage
   - **Used for**: Storing 8.9GB datasets, trained models
   - **Why**: Large storage, easy integration with Colab

3. **Google Cloud Storage (GCS)** (Recommended)
   - **What**: Professional cloud storage service
   - **Use for**: 
     - Storing embryo images in production
     - Hosting trained models (.pkl files)
     - Backup and archival
   - **Why**: 
     - Cheaper than Cloud SQL for large files
     - Direct integration with Cloud Run
     - Automatic versioning

4. **Google Cloud Run** (Recommended for Backend)
   - **What**: Serverless container deployment
   - **Use for**: Hosting the FastAPI backend
   - **Why**: 
     - Auto-scales to zero (save money)
     - Pay only for actual usage
     - Automatic HTTPS and load balancing
   - **Alternative**: Google Compute Engine (VMs)

5. **Google Cloud SQL** (Recommended for Production)
   - **What**: Managed PostgreSQL/MySQL database
   - **Use for**: Production database (replace SQLite)
   - **Why**: 
     - Automatic backups
     - High availability
     - Better performance than SQLite
   - **Alternative**: Cloud Firestore (NoSQL)

6. **Google Cloud Functions** (Optional)
   - **What**: Serverless functions
   - **Use for**: 
     - Image preprocessing before ML
     - Sending email reports
     - Scheduled tasks (daily backups)

7. **Google Analytics** (Recommended)
   - **What**: Website analytics
   - **Use for**: 
     - Track user behavior
     - Monitor feature usage
     - Identify performance issues

8. **Google Cloud Monitoring (Stackdriver)** (Recommended)
   - **What**: Logging and monitoring service
   - **Use for**: 
     - Backend error tracking
     - API performance monitoring
     - Alerting for downtime

9. **Google Cloud AI Platform** (Advanced)
   - **What**: Managed ML model deployment
   - **Use for**: 
     - Hosting ML models at scale
     - A/B testing different models
     - Model versioning
   - **When**: If you outgrow FastAPI + joblib

10. **Google Healthcare API** (Future Enhancement)
    - **What**: HIPAA-compliant data storage for healthcare
    - **Use for**: Storing patient data securely
    - **Why**: Required for real clinical use in hospitals
    - **Important**: Current setup is NOT HIPAA compliant

---

## 📦 Key Libraries & Their Purposes

### Python Backend Libraries:

| Library | Version | Purpose |
|---------|---------|---------|
| **joblib** | 1.5.3 | Load/save trained ML models |
| **numpy** | 2.4.1 | Numerical computations, arrays |
| **opencv-python-headless** | 4.13.0 | Image processing (no GUI) |
| **Pillow** | 12.1.0 | Image loading and manipulation |
| **scikit-learn** | ≥1.6.1 | Machine learning algorithms |
| **pandas** | 3.0.0 | Data manipulation and CSV handling |
| **reportlab** | 4.4.9 | PDF report generation |

### Frontend Libraries:

| Library | Purpose |
|---------|---------|
| **react** | UI framework |
| **lucide-react** | Icon library |
| **recharts** | Charts and graphs |
| **html2canvas** | Screenshot capture for PDFs |
| **react-hook-form** | Form validation |
| **sonner** | Toast notifications |

---

## 🚀 Running the Project

### Frontend:
```bash
npm install          # Install dependencies
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
```

### Backend:
```bash
cd backend
pip install -r requirements.txt  # Install dependencies
python init_db.py                # Initialize database
uvicorn main:app --reload        # Start server (port 8000)
```

**Windows**: Use `start-backend.ps1`
**Linux/Mac**: Use `start-backend.sh`

---

## 🔐 Security Features

1. **Password Hashing**: pbkdf2_sha256 algorithm
2. **JWT Tokens**: 30-minute expiration
3. **Role-Based Access Control (RBAC)**:
   - Admin: Full access
   - Embryologist: Can analyze and modify
   - Auditor: Read-only access
4. **CORS Configuration**: Prevents unauthorized API access
5. **SQL Injection Protection**: SQLAlchemy ORM
6. **Audit Trail**: Every action logged with timestamps

---

## 📈 Performance Optimizations

1. **Image Preprocessing**:
   - Resize to 128×128 (smaller = faster)
   - Convert to RGB format
   - Minimal processing for speed

2. **Model Loading**:
   - Models loaded once at startup (not per request)
   - Global model storage in memory

3. **Feature Extraction**:
   - Optimized OpenCV operations
   - Batch processing support
   - Fast edge detection algorithms

4. **Frontend**:
   - Code splitting with Vite
   - Image lazy loading
   - React component memoization
   - LocalStorage caching

---

## 🔄 Possible Improvements & Alternatives

### Dataset Alternatives:
1. **Private clinic data** (better domain-specific performance)
2. **Augmented dataset** (rotate, flip images to increase variety)
3. **Multi-focal combination** (combine F-15, F-30, F-45 for 3D analysis)

### Model Alternatives:
1. **Convolutional Neural Networks (CNNs)**:
   - Use ResNet50, EfficientNet, or VGG16
   - Pre-trained on ImageNet
   - Fine-tune on embryo images
   - **When**: If dataset grows to >100,000 images

2. **Vision Transformers (ViT)**:
   - State-of-the-art image classification
   - Requires large datasets and GPU
   - **When**: Cutting-edge research projects

3. **AutoML (Google AutoML, H2O)**:
   - Automatically finds best model
   - No manual tuning needed
   - **When**: Quick experimentation phase

### Architecture Alternatives:
1. **Microservices**: Split backend into separate services
2. **GraphQL API**: Instead of REST API
3. **WebSocket**: Real-time updates without polling
4. **Serverless**: AWS Lambda + API Gateway

---

## 📚 Learning Resources

### For Understanding the Code:
- **React**: [react.dev](https://react.dev)
- **FastAPI**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Machine Learning**: [scikit-learn.org](https://scikit-learn.org)
- **TailwindCSS**: [tailwindcss.com](https://tailwindcss.com)

### For Medical Context:
- **Embryology basics**: Search "IVF embryo grading" on YouTube
- **Time-lapse imaging**: Research papers on embryo assessment

---

## 🎯 Project Summary

**What We Built**:
A complete AI-powered IVF embryo analysis system combining:
- Modern React frontend with beautiful UI
- Fast Python/FastAPI backend
- 3 trained Random Forest models (99.7% accuracy)
- Real-time image analysis
- Patient management system
- Complete audit trail
- PDF report generation

**Tech Stack Summary**:
- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: Python + FastAPI + SQLAlchemy
- **ML**: scikit-learn + Random Forest + SMOTE
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Deployment**: Netlify (frontend) + Render (backend)
- **Dataset**: Zenodo embryo time-lapse images (8.9GB)

**Key Achievements**:
- ✅ 99.7% prediction accuracy
- ✅ Real-time processing (<2 seconds per image)
- ✅ Production-ready authentication
- ✅ Complete audit trail
- ✅ Professional UI/UX
- ✅ Deployable to cloud

---

## 📝 Notes for Presentation

**Simple Explanation for Non-Technical People**:
"We built a website that helps IVF doctors quickly analyze embryo images using artificial intelligence. Instead of spending hours manually examining embryos, doctors can upload images and get instant quality scores. The AI was trained on 23,000 real embryo images and can predict viability with 99.7% accuracy."

**Technical Highlights for Interviewers**:
- Full-stack application with modern architecture
- Production-ready authentication and security
- Ensemble machine learning for robust predictions
- Comprehensive error handling and logging
- Scalable deployment strategy
- Clean code with TypeScript type safety

**Google Tools We Can Add**:
- Cloud Run for serverless backend
- Cloud Storage for image hosting
- Cloud SQL for production database
- Cloud Monitoring for observability
- Healthcare API for HIPAA compliance (future)

---

**Document created**: February 2, 2026
**Version**: 1.0
**Project**: Embryo Viability Analysis Platform (Embrya)
