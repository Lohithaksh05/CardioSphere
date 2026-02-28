# CardioSphere — AI-Powered Heart Health Platform

Full-stack application for heart disease risk prediction, AI-personalized fitness & nutrition plans, medication tracking with SMS reminders, and community forums — featuring a modern glassmorphism UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 3.4, Shadcn UI, Framer Motion, Recharts, Axios |
| Backend | FastAPI (Python), Motor (async MongoDB), Pydantic v2 |
| Auth | Clerk v6 (frontend + JWT verification on backend) |
| ML | scikit-learn RandomForest, joblib |
| AI | OpenAI GPT-4o-mini (workout/diet/recommendations) |
| Database | MongoDB (Atlas or local) |
| SMS | Twilio + APScheduler (medication reminders) |
| Containerization | Docker + Docker Compose |

## Features

- **Heart Disease Risk Prediction** — ML model trained on 253k BRFSS samples with AI-generated recommendations
- **AI Workout Planner** — Personalized weekly plans based on heart risk, fitness level, injuries & equipment
- **AI Nutrition Planner** — Heart-healthy meal plans with macro breakdowns and ingredient lists
- **Medication Tracker** — Full CRUD with categories, dosage units, date ranges, streak tracking, time-wheel picker, and SMS reminders via Twilio
- **Dashboard** — Interactive risk gauge, BMI indicator, trend charts, prediction history
- **Community Forum** — Posts, comments, likes with real-time updates
- **Modern UI** — Glassmorphism design with frosted-glass cards, gradient accents, mesh-gradient backgrounds, and animated micro-interactions

## Project Structure

```
CardioSphere/
├── backend/                        # FastAPI server
│   ├── main.py                     # App entry + CORS + APScheduler
│   ├── config.py                   # Environment settings
│   ├── database.py                 # MongoDB connection (Motor)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env                        # ← Add your keys here
│   ├── middleware/
│   │   └── clerk_auth.py           # Clerk JWT verification
│   ├── models/
│   │   ├── user.py                 # User schema (includes phone_number)
│   │   ├── prediction.py           # Prediction I/O models
│   │   ├── medication.py           # Medication schemas (categories, SMS, streaks)
│   │   ├── community.py            # Post/comment schemas
│   │   └── ai_planner.py           # Workout/diet request & response schemas
│   ├── routes/
│   │   ├── auth.py                 # POST /auth/sync, GET|PUT /auth/me
│   │   ├── prediction.py           # POST /predict/risk, GET /predict/risk/{id}
│   │   ├── ai_planner.py           # Workout & diet generation + saved plans
│   │   ├── medication.py           # Full CRUD + take/skip/reset/toggle-sms
│   │   ├── dashboard.py            # GET /dashboard/stats, /risk-history, /progress-trend
│   │   └── community.py            # CRUD /community, comments, likes
│   ├── services/
│   │   ├── ml_service.py           # Model loading + prediction + AI recommendations
│   │   └── openai_service.py       # GPT workout/diet generation
│   └── ml/
│       └── train_model.py          # Script to train & save model
├── frontend-v2/                    # Next.js 16 app (primary frontend)
│   ├── src/
│   │   ├── proxy.ts                # Clerk middleware (Next.js 16 convention)
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout (ClerkProvider)
│   │   │   ├── page.tsx            # Landing page (glassmorphism hero)
│   │   │   ├── globals.css         # Design system (glass utilities, gradients, animations)
│   │   │   ├── sign-in/            # Clerk sign-in
│   │   │   ├── sign-up/            # Clerk sign-up
│   │   │   └── (app)/              # Protected route group
│   │   │       ├── layout.tsx      # Sidebar + AuthSync + mesh-gradient background
│   │   │       ├── dashboard/      # Risk gauge, BMI, charts, history
│   │   │       ├── risk-assessment/ # Multi-step health form + AI recommendations
│   │   │       ├── workout-plan/   # AI workout generator + saved plans
│   │   │       ├── diet-plan/      # AI nutrition planner + saved plans
│   │   │       ├── medication-tracker/ # Medication CRUD + SMS reminders
│   │   │       └── community/      # Forum: posts, comments, likes
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Glassmorphism sidebar with gradient nav items
│   │   │   ├── AuthSync.tsx        # Clerk → backend user sync
│   │   │   ├── TimeWheelPicker.tsx # Custom time picker for medications
│   │   │   └── ui/                 # Shadcn components
│   │   └── lib/
│   │       ├── api.ts              # Axios client + all API functions
│   │       └── utils.ts            # cn() utility
│   ├── package.json
│   ├── tailwind.config.ts          # Extended animations, shadows, design tokens
│   ├── tsconfig.json
│   └── .env                        # ← Add your Clerk keys
├── frontend/                       # Legacy Next.js 14 app (preserved as backup)
├── model/                          # Original training data
│   └── data.csv                    # BRFSS dataset (253k samples)
├── docker-compose.yml
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 20.9+ (tested with 24.x)
- Python 3.10+
- MongoDB (local or Atlas)
- Clerk account (https://clerk.com)
- OpenAI API key
- Twilio account (optional, for SMS reminders)

### 1. Clerk Setup

1. Create a Clerk application at https://dashboard.clerk.com
2. Copy your **Publishable Key** and **Secret Key**
3. From your Clerk dashboard → JWT Templates, get the **JWKS URL** (looks like `https://xxx.clerk.accounts.dev/.well-known/jwks.json`)
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

# Create .env with your keys:
# MONGODB_URL=mongodb://localhost:27017
# CLERK_SECRET_KEY=sk_...
# CLERK_JWKS_URL=https://xxx.clerk.accounts.dev/.well-known/jwks.json
# CLERK_ISSUER=https://xxx.clerk.accounts.dev
# OPENAI_API_KEY=sk-...
# TWILIO_ACCOUNT_SID=...     (optional)
# TWILIO_AUTH_TOKEN=...       (optional)
# TWILIO_PHONE_NUMBER=...    (optional)

# Run the server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend-v2

# Install dependencies
npm install --legacy-peer-deps

# Create .env with your Clerk keys:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
# CLERK_SECRET_KEY=sk_...

# Run dev server
npm run dev
```

Frontend available at: http://localhost:3000

### 4. Docker Setup (Alternative)

```bash
# Update .env files in backend/ and frontend-v2/ with your keys first
docker-compose up --build
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/sync` | Sync Clerk user to MongoDB |
| GET | `/api/v1/auth/me` | Get current user profile |
| PUT | `/api/v1/auth/me` | Update profile (including phone number) |

### Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/predict/risk` | Heart disease risk prediction + AI recommendations |
| GET | `/api/v1/predict/risk/{id}` | Get a specific prediction by ID |

### AI Planner
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/generate/workout` | Generate AI workout plan |
| GET | `/api/v1/generate/workouts` | List saved workout plans |
| GET | `/api/v1/generate/workout/{id}` | Get a specific workout plan |
| POST | `/api/v1/generate/diet` | Generate AI diet plan |
| GET | `/api/v1/generate/diets` | List saved diet plans |
| GET | `/api/v1/generate/diet/{id}` | Get a specific diet plan |

### Medications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/medications` | Add medication (with category, dosage unit, schedule, date range) |
| GET | `/api/v1/medications` | List all medications |
| PUT | `/api/v1/medications/{id}` | Update/edit medication details |
| PUT | `/api/v1/medications/{id}/take` | Mark as taken (increments streak) |
| PUT | `/api/v1/medications/{id}/skip` | Mark as skipped |
| PUT | `/api/v1/medications/{id}/reset` | Reset today's adherence status |
| PUT | `/api/v1/medications/{id}/toggle-sms` | Enable/disable SMS reminders |
| DELETE | `/api/v1/medications/{id}` | Delete medication |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Summary statistics |
| GET | `/api/v1/dashboard/risk-history` | Prediction history |
| GET | `/api/v1/dashboard/progress-trend` | Aggregated trend data |

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
  "input_summary": { ... },
  "recommendations": {
    "summary": "...",
    "risk_factors": [...],
    "positive_factors": [...],
    "lifestyle_changes": [...],
    "medical_recommendations": [...]
  }
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
    "dosage": "20",
    "dosage_unit": "mg",
    "category": "cholesterol",
    "time_schedule": ["08:00", "20:00"],
    "frequency": "daily",
    "start_date": "2026-02-26",
    "sms_reminders_enabled": true,
    "notes": "Take with food"
  }'
```

## MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles synced from Clerk (includes phone number) |
| `predictions` | All risk assessment results + AI recommendations |
| `medications` | Medication records with schedules, streaks, SMS flags |
| `posts` | Community forum posts with embedded comments & likes |
| `workout_plans` | Saved AI-generated workout plans |
| `diet_plans` | Saved AI-generated diet plans |

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — glassmorphism hero, feature cards, stats bar, CTA section |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/dashboard` | Interactive risk gauge, BMI indicator, trend charts, prediction history |
| `/risk-assessment` | Multi-step health form with gradient step indicator + AI result cards |
| `/workout-plan` | AI workout generator with weekly plan accordion + saved plans tab |
| `/diet-plan` | AI nutrition planner with meal cards, macro badges + saved plans tab |
| `/medication-tracker` | Medication CRUD, time-wheel picker, streak tracking, SMS toggle |
| `/community` | Forum with post creation, comments, likes |

## UI Design System

The frontend uses a modern glassmorphism design language:

- **Glass cards** — `backdrop-blur` with semi-transparent backgrounds and `border-white/20` borders
- **Gradient accents** — unique color identity per section (rose/pink for fitness, emerald/teal for nutrition, violet/purple for medications, amber/orange for community)
- **Animated micro-interactions** — Framer Motion staggered fade-up, scale-in, floating decorative elements
- **Gradient icon backgrounds** — colored rounded-xl containers with shadow glows
- **Mesh-gradient background** — multi-radial gradient on the app shell
- **Custom CSS utilities** — `.glass`, `.glass-card`, `.glass-card-hover`, `.gradient-text`, `.gradient-text-subtle`, `.mesh-gradient`, `.shimmer`

## ML Model

- **Algorithm:** RandomForest (100 trees, class_weight="balanced")
- **Dataset:** BRFSS 2015 — 253,680 samples
- **Features (15):** HighBP, HighChol, CholCheck, BMI, Smoker, Stroke, Diabetes, PhysActivity, Fruits, Veggies, HvyAlcoholConsump, GenHlth, DiffWalk, Sex, Age
- **Metrics:** ~0.82 ROC AUC, ~0.75 Accuracy
- **Post-prediction:** OpenAI GPT generates personalized risk_factors, positive_factors, lifestyle_changes, and medical_recommendations

## License

MIT
