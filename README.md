# SkillForge — Strava for Coders 🚀

A visually stunning, gamified, competitive tracking platform for computer science students and developers. Track your coding progress across **GitHub, LeetCode, Codeforces, and CodeChef** all in one unified dashboard. Compete with peers, earn XP, and level up your skills to become a master developer.

![SkillForge Demo](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## ✨ Features

- **🔐 Secure Authentication:** Full JWT-based auth flow.
- **📊 Unified Dashboard:** Cross-platform metrics aggregated seamlessly via HTTP and GraphQL APIs.
- **🟩 3D Activity Heatmap:** A rich, interactive isometric GitHub-style heatmap showing contributions across all platforms.
- **🏆 Gamification & Progression:** Earn XP for solving problems, build streaks, level up, and unlock dynamically rendered badges.
- **🥷 Gamified Rivalries:** Search for peers globally, add them as rivals, and compare your Hard Problems Solved, Match Ratings, and GitHub Commits in a side-by-side 'VS' arena.
- **📈 Advanced Skill Radar:** Track your programming language distribution with Recharts pie and radar charts.
- **📚 Deep Skill Inventory:** Tag your DSA topics, frameworks, and soft skills inside your professional profile.
- **🥇 Global Leaderboards:** Rank among your peers based on total XP and streaks.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React (Vite), Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python 3.10+, FastAPI, Pydantic |
| **Database** | MongoDB & Beanie ODM (Async Object-Document Mapper) |
| **Auth** | JWT Access Tokens + bcrypt hashing |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/downloads/) (v3.10 or higher)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/) (Local instance or a free MongoDB Atlas URI)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/skill-forge.git
cd skill-forge
```

### 2. Backend Setup (FastAPI)

Navigate to the backend directory and set up your Python environment:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Environment Variables (Backend)
Create a `.env` file in the `backend/` directory (you can use `.env.example` as a template):
```env
# backend/.env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/skillforge?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
GITHUB_TOKEN=optional_github_personal_access_token_for_higher_rate_limits
```

#### Run the Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*The API will be running at `http://localhost:8000`. You can view the Interactive API Docs at `http://localhost:8000/docs`.*

### 3. Frontend Setup (React / Vite)

Open a new terminal window/tab, navigate to the frontend directory:

```bash
cd frontend

# Install Node.js dependencies
npm install
```

#### Environment Variables (Frontend)
Create a `.env` file in the `frontend/` directory (you can use `.env.example` as a template):
```env
# frontend/.env
VITE_API_URL=http://localhost:8000/api
```

#### Run the Frontend Development Server
```bash
npm run dev
```
*The web app will be running at `http://localhost:5173`.*

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
