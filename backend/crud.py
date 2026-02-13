from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
import models, schemas


def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()


def get_employee_by_emp_id(db: Session, emp_id: str):
    return db.query(models.Employee).filter(models.Employee.employee_id == emp_id).first()


def get_employee_by_email(db: Session, email: str):
    return db.query(models.Employee).filter(models.Employee.email == email).first()


def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Employee).offset(skip).limit(limit).all()


def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email,
        department=employee.department
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


def delete_employee(db: Session, employee_id: int):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if employee:
        db.delete(employee)
        db.commit()
    return employee


def update_employee(db: Session, employee_id: int, employee_data: schemas.EmployeeCreate):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if db_employee:
        db_employee.full_name = employee_data.full_name
        db_employee.email = employee_data.email
        db_employee.department = employee_data.department
        db_employee.employee_id = employee_data.employee_id
        db.commit()
        db.refresh(db_employee)
    return db_employee


def get_attendance(db: Session, employee_id: int, start_date: date = None, end_date: date = None):
    query = db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id)
    if start_date:
        query = query.filter(models.Attendance.date >= start_date)
    if end_date:
        query = query.filter(models.Attendance.date <= end_date)
    return query.order_by(models.Attendance.date.desc()).all()


def mark_attendance(db: Session, attendance: schemas.AttendanceCreate, employee_db_id: int):
    # Check if attendance already exists for this date
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_db_id,
        models.Attendance.date == attendance.date
    ).first()

    if existing:
        existing.status = attendance.status
        db.commit()
        db.refresh(existing)
        return existing

    db_attendance = models.Attendance(
        employee_id=employee_db_id,
        date=attendance.date,
        status=attendance.status
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


def get_attendance_summary(db: Session, employee_id: int):
    records = db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status == models.AttendanceStatus.PRESENT)
    absent = sum(1 for r in records if r.status == models.AttendanceStatus.ABSENT)
    return {"total_records": total, "total_present": present, "total_absent": absent}


def get_dashboard_summary(db: Session):
    today = date.today()

    total_employees = db.query(models.Employee).count()

    today_attendance = db.query(models.Attendance).filter(models.Attendance.date == today).all()
    present_today = sum(1 for a in today_attendance if a.status == models.AttendanceStatus.PRESENT)
    absent_today = sum(1 for a in today_attendance if a.status == models.AttendanceStatus.ABSENT)

    departments = db.query(models.Employee.department).distinct().all()
    dept_list = [d[0] for d in departments]

    recent_employees = db.query(models.Employee).order_by(models.Employee.id.desc()).limit(5).all()

    recent_attendance = (
        db.query(models.Attendance, models.Employee)
        .join(models.Employee, models.Attendance.employee_id == models.Employee.id)
        .order_by(models.Attendance.id.desc())
        .limit(10)
        .all()
    )

    recent_att_list = []
    for att, emp in recent_attendance:
        recent_att_list.append({
            "full_name": emp.full_name,
            "date": str(att.date),
            "status": att.status.value
        })

    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "departments": dept_list,
        "recent_employees": [
            {
                "employee_id": e.employee_id,
                "full_name": e.full_name,
                "department": e.department,
                "email": e.email
            }
            for e in recent_employees
        ],
        "recent_attendance": recent_att_list
    }
