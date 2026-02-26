# CardioSphere — AI-Powered Heart Health Platform

Full-stack application for heart disease risk prediction, personalized fitness/nutrition plans, medication tracking, and community forums.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Shadcn UI, Recharts, Axios |
| Backend | FastAPI (Python), Motor (async MongoDB), Pydantic |
| Auth | Clerk (frontend + JWT verification on backend) |
| ML | scikit-learn RandomForest, joblib |
| AI | OpenAI GPT-3.5-turbo |
| Database | MongoDB |
| Containerization | Docker + Docker Compose |

## Project Structure

```
CardioSphere-main/
├── backend/                    # FastAPI server
│   ├── main.py                 # App entry point
│   ├── config.py               # Environment settings
│   ├── database.py             # MongoDB connection (Motor)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env                    # ← Add your keys here
│   ├── middleware/
│   │   └── clerk_auth.py       # Clerk JWT verification
│   ├── models/
│   │   ├── user.py             # User schema
│   │   ├── prediction.py       # Prediction I/O models
│   │   ├── medication.py       # Medication schemas
│   │   ├── community.py        # Post/comment schemas
│   │   └── ai_planner.py       # Workout/diet schemas
│   ├── routes/
│   │   ├── auth.py             # POST /auth/sync, GET /auth/me
│   │   ├── prediction.py       # POST /predict/risk
│   │   ├── ai_planner.py       # POST /generate/workout, /generate/diet
│   │   ├── medication.py       # CRUD /medications
│   │   ├── dashboard.py        # GET /dashboard/stats, /risk-history, /progress-trend
│   │   └── community.py        # CRUD /community, comments, likes
│   ├── services/
│   │   ├── ml_service.py       # Model loading + prediction
│   │   └── openai_service.py   # GPT workout/diet generation
│   └── ml/
│       └── train_model.py      # Script to train & save model
├── frontend/                   # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout (ClerkProvider)
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── globals.css     # Shadcn CSS variables
│   │   │   ├── sign-in/        # Clerk sign-in
│   │   │   ├── sign-up/        # Clerk sign-up
│   │   │   └── (app)/          # Protected route group
│   │   │       ├── layout.tsx  # Sidebar + AuthSync
│   │   │       ├── dashboard/
│   │   │       ├── risk-assessment/
│   │   │       ├── workout-plan/
│   │   │       ├── diet-plan/
│   │   │       ├── medication-tracker/
│   │   │       └── community/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AuthSync.tsx
│   │   │   └── ui/             # Shadcn components
│   │   └── lib/
│   │       ├── api.ts          # Axios client + all API functions
│   │       └── utils.ts        # cn() utility
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env                    # ← Add your Clerk keys
├── model/                      # Original training data
│   └── data.csv                # BRFSS dataset (253k samples)
├── docker-compose.yml
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Clerk account (https://clerk.com)
- OpenAI API key

### 1. Clerk Setup

1. Create a Clerk application at https://dashboard.clerk.com
2. Copy your **Publishable Key** and **Secret Key**
3. From your Clerk dashboard > JWT Templates, get the **JWKS URL** (looks like `https://xxx.clerk.accounts.dev/.well-known/jwks.json`)
4. Update both `.env` files with these values

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model
python ml/train_model.py

# Update .env with your keys
# MONGODB_URL, CLERK_SECRET_KEY, CLERK_JWKS_URL, CLERK_ISSUER, OPENAI_API_KEY

# Run the server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Update .env with your Clerk keys
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY

# Run dev server
npm run dev
```

Frontend available at: http://localhost:3000

### 4. Docker Setup (Alternative)

```bash
# Update .env files in backend/ and frontend/ with your keys first
docker-compose up --build
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/sync` | Sync Clerk user to MongoDB |
| GET | `/api/v1/auth/me` | Get current user profile |
| PUT | `/api/v1/auth/me` | Update profile |

### Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/predict/risk` | Heart disease risk prediction |

### AI Planner
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/generate/workout` | Generate workout plan |
| POST | `/api/v1/generate/diet` | Generate diet plan |

### Medications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/medications` | Add medication |
| GET | `/api/v1/medications` | List medications |
| PUT | `/api/v1/medications/{id}/take` | Mark as taken |
| PUT | `/api/v1/medications/{id}/reset` | Reset adherence |
| DELETE | `/api/v1/medications/{id}` | Delete medication |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Summary statistics |
| GET | `/api/v1/dashboard/risk-history` | Prediction history |
| GET | `/api/v1/dashboard/progress-trend` | Aggregated trend |

### Community
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/community` | Create post |
| GET | `/api/v1/community` | List posts |
| GET | `/api/v1/community/{id}` | Get post |
| POST | `/api/v1/community/{id}/comment` | Add comment |
| POST | `/api/v1/community/{id}/like` | Toggle like |
| DELETE | `/api/v1/community/{id}` | Delete post |

## Sample API Requests

### Predict Heart Disease Risk

```bash
curl -X POST http://localhost:8000/api/v1/predict/risk \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "high_bp": 1, "high_cholesterol": 1, "cholesterol_check": 1,
    "bmi": 30, "smoker": 1, "stroke": 0, "diabetes": 2,
    "physical_activity": 0, "fruits": 0, "veggies": 0,
    "heavy_alcohol": 0, "general_health": 4,
    "difficulty_walking": 1, "sex": 1, "age": 9
  }'
```

**Response:**
```json
{
  "probability": 0.6234,
  "risk_percentage": 62.34,
  "risk_category": "High",
  "confidence_score": 0.6234,
  "input_summary": { ... }
}
```

### Generate Workout Plan

```bash
curl -X POST http://localhost:8000/api/v1/generate/workout \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "heart_risk": "Medium",
    "equipment": ["dumbbells", "resistance bands"],
    "injuries": "lower back pain",
    "fitness_goal": "heart health",
    "fitness_level": "beginner"
  }'
```

### Add Medication

```bash
curl -X POST http://localhost:8000/api/v1/medications \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "medication_name": "Atorvastatin",
    "dosage": "20mg",
    "time_schedule": ["08:00", "20:00"],
    "notes": "Take with food"
  }'
```

## MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles (synced from Clerk) |
| `predictions` | All risk assessment results |
| `medications` | Medication reminders |
| `posts` | Community forum posts + comments |

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero + features |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/dashboard` | Risk gauge, BMI indicator, charts, history |
| `/risk-assessment` | Multi-step health assessment form |
| `/workout-plan` | AI workout plan generator |
| `/diet-plan` | AI nutrition planner |
| `/medication-tracker` | Medication CRUD + adherence tracking |
| `/community` | Forum with posts, comments, likes |

## ML Model

- **Algorithm:** RandomForest (100 trees)
- **Dataset:** BRFSS 2015 — 253,680 samples
- **Features (15):** HighBP, HighChol, CholCheck, BMI, Smoker, Stroke, Diabetes, PhysActivity, Fruits, Veggies, HvyAlcoholConsump, GenHlth, DiffWalk, Sex, Age
- **Metrics:** ~0.82 ROC AUC, ~0.75 Accuracy

## License

MIT
