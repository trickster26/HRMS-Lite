from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import crud, schemas, database

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"],
    responses={404: {"description": "Not found"}},
)


@router.post("/{employee_id}", response_model=schemas.Attendance)
def mark_attendance(employee_id: int, attendance: schemas.AttendanceCreate, db: Session = Depends(database.get_db)):
    db_employee = crud.get_employee(db, employee_id=employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    result = crud.mark_attendance(db=db, attendance=attendance, employee_db_id=employee_id)
    return result


@router.post("/")
def mark_attendance_by_emp_id(data: dict, db: Session = Depends(database.get_db)):
    """Mark attendance using employee_id string (from frontend form)."""
    emp_id_str = data.get("employee_id")
    date_str = data.get("date")
    status_str = data.get("status")

    if not emp_id_str or not date_str or not status_str:
        raise HTTPException(status_code=400, detail="employee_id, date, and status are required")

    # Look up employee by string employee_id
    db_employee = crud.get_employee_by_emp_id(db, emp_id=emp_id_str)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    attendance = schemas.AttendanceCreate(date=date_str, status=status_str)
    result = crud.mark_attendance(db=db, attendance=attendance, employee_db_id=db_employee.id)
    return {"message": "Attendance marked successfully", "data": result}


@router.get("/summary/{employee_id}")
def get_attendance_summary(employee_id: int, db: Session = Depends(database.get_db)):
    db_employee = crud.get_employee(db, employee_id=employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    summary = crud.get_attendance_summary(db, employee_id=employee_id)
    return {"data": summary}


@router.get("/{employee_id}")
def read_attendance(
    employee_id: int,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    db_employee = crud.get_employee(db, employee_id=employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    sd = date.fromisoformat(start_date) if start_date else None
    ed = date.fromisoformat(end_date) if end_date else None

    records = crud.get_attendance(db, employee_id=employee_id, start_date=sd, end_date=ed)
    return {"data": records}
