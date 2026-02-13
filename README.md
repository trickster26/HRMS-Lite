# HRMS Lite

A lightweight Human Resource Management System for managing employee records and tracking daily attendance.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js, Express.js |
| Database | SQLite (via better-sqlite3) |

## Features

### Core
- **Employee Management** — Add, view, list, and delete employees
- **Attendance Tracking** — Mark daily attendance (Present/Absent) per employee
- **Dashboard** — Summary cards, department breakdown, recent activity

### Bonus
- Filter attendance records by date range
- Total present/absent days per employee
- Dashboard with aggregate statistics

### UI/UX
- Professional enterprise-grade design with Inter font
- Loading, empty, and error states throughout
- Search filtering on employee list
- Confirmation modals for destructive actions
- Toast notifications for success/error feedback
- Responsive layout for tablet/mobile

## Project Structure

```
hrms-lite/
├── backend/
│   ├── src/
│   │   ├── db/database.js           # SQLite connection & schema
│   │   ├── routes/
│   │   │   ├── employee.routes.js   # Employee CRUD
│   │   │   ├── attendance.routes.js # Attendance endpoints
│   │   │   └── dashboard.routes.js  # Dashboard summary
│   │   └── middleware/
│   │       ├── validators.js        # Request validation
│   │       └── errorHandler.js      # Global error handler
│   ├── server.js                    # Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/              # Reusable UI components
    │   ├── pages/                   # Page-level components
    │   ├── services/api.js          # API client
    │   ├── App.jsx                  # Routing & layout
    │   ├── App.css                  # Component styles
    │   └── index.css                # Design system tokens
    ├── index.html
    └── package.json
```

## Run Locally

### Prerequisites
- Node.js 18+ and npm

### Backend
```bash
cd backend
npm install
npm start
```
Server starts on `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App opens at `http://localhost:5173`

### Environment Variables

**Backend** (`.env`):
```
PORT=5000
DB_PATH=./data/hrms.db
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`.env` — optional):
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get single employee |
| POST | `/api/employees` | Create employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/attendance/:id` | Get attendance records |
| GET | `/api/attendance/summary/:id` | Attendance summary |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/dashboard/summary` | Dashboard stats |

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build    # outputs to dist/
```
Deploy `dist/` to Vercel. Set env variable `VITE_API_URL` to your deployed backend URL.

### Backend (Render)
Deploy the `backend/` directory. Set `PORT`, `DB_PATH`, and `CORS_ORIGIN` environment variables.

## Assumptions & Limitations
- Single admin user (no authentication)
- SQLite database (suitable for low-to-medium traffic)
- Leave management, payroll, and advanced HR features are out of scope
