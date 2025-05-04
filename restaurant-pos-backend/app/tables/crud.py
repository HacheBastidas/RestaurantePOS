from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import models, schemas

def get_table(db: Session, table_id: int):
    return db.query(models.Table).filter(models.Table.id == table_id).first()

def get_table_by_name(db: Session, name: str):
    return db.query(models.Table).filter(models.Table.name == name).first()

def get_tables(db: Session, skip: int = 0, limit: int = 100, is_occupied: bool = None):
    query = db.query(models.Table)
    if is_occupied is not None:
        query = query.filter(models.Table.is_occupied == is_occupied)
    return query.offset(skip).limit(limit).all()

def create_table(db: Session, table: schemas.TableCreate):
    db_table = get_table_by_name(db, name=table.name)
    if db_table:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una mesa con ese nombre"
        )
    
    db_table = models.Table(**table.dict())
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table

def update_table(db: Session, table_id: int, table: schemas.TableUpdate):
    db_table = get_table(db, table_id=table_id)
    if not db_table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )
    
    table_data = table.dict(exclude_unset=True)
    
    for key, value in table_data.items():
        setattr(db_table, key, value)
    
    db.commit()
    db.refresh(db_table)
    return db_table

def delete_table(db: Session, table_id: int):
    db_table = get_table(db, table_id=table_id)
    if not db_table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )
    
    db.delete(db_table)
    db.commit()
    return {"ok": True}

def occupy_table(db: Session, table_id: int, is_occupied: bool = True):
    db_table = get_table(db, table_id=table_id)
    if not db_table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada"
        )
    
    db_table.is_occupied = is_occupied
    db.commit()
    db.refresh(db_table)
    return db_table