from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud, schemas, database

router = APIRouter(
    prefix="/employees",
    tags=["employees"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(database.get_db)):
    db_employee = crud.get_employee_by_emp_id(db, emp_id=employee.employee_id)
    if db_employee:
        raise HTTPException(status_code=400, detail="Employee ID already registered")

    db_email = crud.get_employee_by_email(db, email=employee.email)
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    result = crud.create_employee(db=db, employee=employee)
    return result


@router.get("/")
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    employees = crud.get_employees(db, skip=skip, limit=limit)
    return {"data": employees}


@router.get("/{employee_id}")
def read_employee(employee_id: int, db: Session = Depends(database.get_db)):
    db_employee = crud.get_employee(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"data": db_employee}


@router.delete("/{employee_id}", response_model=schemas.Employee)
def delete_employee(employee_id: int, db: Session = Depends(database.get_db)):
    db_employee = crud.delete_employee(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return db_employee


@router.put("/{employee_id}", response_model=schemas.Employee)
def update_employee(employee_id: int, employee: schemas.EmployeeCreate, db: Session = Depends(database.get_db)):
    db_employee = crud.update_employee(db, employee_id=employee_id, employee_data=employee)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return db_employee
