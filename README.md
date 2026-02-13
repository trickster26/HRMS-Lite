# HRMS Lite - Pro

A modern, high-performance Human Resource Management System built for small to medium-sized teams. Manage employees, track attendance, and visualize company health with a sleek, responsive dashboard.

## 🚀 Key Features
- **Interactive Dashboard**: Real-time analytics charts using Recharts for attendance trends.
- **Employee Management**: Full CRUD (Create, Read, Update, Delete) with modal-based editing.
- **Attendance Tracking**: Simple daily marking system with monthly/yearly historical filters.
- **Smart Stats**: Automatic recalculation of attendance rates and headcounts.
- **Modern UI**: Dark/Light mode support with premium aesthetics and smooth animations.
- **Full-Stack Validation**: Double-layer validation (Pydantic schemas + Frontend constraints).

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide icons, Recharts, React Hot Toast.
- **Backend**: FastAPI (Python), SQLAlchemy ORM, Pydantic v2.
- **Database**: 
  - **Local**: MySQL (using PyMySQL).
  - **Production**: Optimized for Railway MySQL or PostgreSQL.
- **Deployment**: Configured for Vercel/Netlify (Frontend) and Railway (Backend).

## 💻 Local Setup

### Prerequisites
- **Node.js**: v16+
- **Python**: v3.9+
- **MySQL**: A running MySQL instance (Local or Remote).

### 1. Database Configuration
1. Create a database named `hrms_lite`.
2. Find the `.env` file in the `backend/` directory (or create one) and set your connection string:
   ```env
   DATABASE_URL=mysql+pymysql://user:password@localhost/hrms_lite
   ```

### 2. Backend Installation
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
*API will be available at `http://localhost:8000/docs` (Swagger UI)*

### 3. Frontend Installation
```bash
cd frontend
npm install
npm run dev
```
*App will be available at `http://localhost:5173`*

## 📝 Assumptions & Limitations
- **Security**: This version has **no authentication/login**. It is designed as an internal tool or a base for a larger system where auth is handled by a gateway or higher-level service.
- **Browser Support**: Best experienced on modern browsers (Chrome, Firefox, Safari, Edge).
- **Offline Support**: Currently requires an active connection to the backend API.
- **Scaling**: Optimized for up to ~1000 employees. For larger enterprises, further database indexing and caching are recommended.


