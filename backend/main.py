from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import employees, attendance, dashboard

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API", version="1.0.0")

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
    "https://hrms24x7.netlify.app",
    "*",  # Allow all (for simplicity during deployment)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All routers under /api prefix
app.include_router(employees.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to HRMS Lite API"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
