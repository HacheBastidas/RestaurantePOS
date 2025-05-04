from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..db import get_db
from ..auth.dependencies import get_admin_user, get_current_active_user, get_waiter_user
from ..users.models import User
from . import crud, schemas, models

router = APIRouter()

@router.post("/", response_model=schemas.Table, status_code=status.HTTP_201_CREATED)
def create_table(
    table: schemas.TableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    return crud.create_table(db=db, table=table)

@router.get("/", response_model=List[schemas.Table])
def read_tables(
    skip: int = 0,
    limit: int = 100,
    is_occupied: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    tables = crud.get_tables(db, skip=skip, limit=limit, is_occupied=is_occupied)
    return tables

@router.get("/{table_id}", response_model=schemas.Table)
def read_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_table = crud.get_table(db, table_id=table_id)
    if db_table is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )
    return db_table

@router.put("/{table_id}", response_model=schemas.Table)
def update_table(
    table_id: int,
    table: schemas.TableUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    return crud.update_table(db=db, table_id=table_id, table=table)

@router.delete("/{table_id}")
def delete_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    return crud.delete_table(db=db, table_id=table_id)

@router.put("/{table_id}/occupy", response_model=schemas.Table)
def set_table_occupy_status(
    table_id: int,
    is_occupied: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_waiter_user)
):
    return crud.occupy_table(db=db, table_id=table_id, is_occupied=is_occupied)