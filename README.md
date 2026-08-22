# DayFlow – Human Resource Management System

> "Every workday, perfectly aligned."

A modern HRMS built with React + FastAPI + PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS v4, Motion |
| Backend | Python FastAPI (async), SQLAlchemy 2.0, Alembic |
| Database | PostgreSQL |
| Auth | JWT (pyjwt) + Argon2 (pwdlib) |

## Project Structure

```
DayFlow/
├── frontend/     # React + Vite + TypeScript
├── backend/      # FastAPI + SQLAlchemy
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your DB credentials
alembic upgrade head
uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

## Features
- [x] Secure authentication (JWT + refresh tokens)
- [ ] Employee dashboard
- [ ] Profile management
- [ ] Attendance tracking
- [ ] Leave management
- [ ] Payroll visibility
- [ ] Admin approval workflows

## License
Private – All rights reserved.
