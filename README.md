# PlacePro — College Placement Tracker

A full-stack college placement portal with AI career coaching.

## Tech Stack

- **Frontend** — React 18, Vite, Tailwind CSS
- **Backend** — Flask, SQLAlchemy, Flask-JWT-Extended
- **Database** — SQLite
- **AI** — Groq API (llama-3.3-70b-versatile)

## Features

- Student dashboard with application tracking and skill match scores
- Admin panel to manage companies, jobs, and application statuses
- AI Career Coach — personalized advice based on real profile and applications
- Role-based access (student / admin)
- Mobile responsive with bottom navigation

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
python app.py
```

### Frontend
```bash
npm install
npm run dev
```

Or run both at once:
```bash
bash start.sh
```

### Environment Variables

Create `backend/.env`:
```
JWT_SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///database.db
GROQ_API_KEY=your-groq-api-key
```

Get a free Groq API key at [console.groq.com](https://console.groq.com)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | rahul@college.edu | student123 |
| Admin | admin@college.edu | admin123 |
