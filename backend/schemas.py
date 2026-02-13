from pydantic import BaseModel, EmailStr
from datetime import date
from enum import Enum
from typing import List, Optional

class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    department: str

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    attendance_records: List[Attendance] = []

    class Config:
        from_attributes = True
