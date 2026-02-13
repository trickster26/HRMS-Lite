from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import crud, database

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(database.get_db)):
    summary = crud.get_dashboard_summary(db)
    return {"data": summary}
