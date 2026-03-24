# SkillForge — Strava for Coders 🚀

A gamified, competitive tracking platform for computer science students. Track your coding progress across GitHub, LeetCode, Codeforces, and CodeChef. Compete with peers, earn XP, and level up your skills.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Tailwind CSS + Recharts |
| Backend | Python FastAPI |
| Database | MongoDB (Beanie ODM) |
| Auth | JWT (access tokens + bcrypt password hashing) |

## Project Structure

```
skill-forge/
├── backend/          # FastAPI backend
│   ├── app/          # Application code
│   ├── tests/        # Pytest tests
│   └── requirements.txt
├── frontend/         # React frontend
│   └── src/
└── README.md
```

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # Edit with your settings
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env         # Edit with your settings
npm run dev
```

### Environment Variables

See `.env.example` files in both `backend/` and `frontend/` directories.

## Features

- 🔐 JWT Authentication
- 📊 Unified Dashboard with platform stats
- 🎯 Task Tracker with XP rewards
- 🏆 Gamification (XP, Levels, Streaks, Badges)
- 📈 Skill Radar & Improvement Charts
- 🥇 Leaderboards with peer comparison
- 🧠 AI-powered skill recommendations
- 📧 Automated email reminders
