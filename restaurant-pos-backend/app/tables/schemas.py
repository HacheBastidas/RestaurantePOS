from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class TableBase(BaseModel):
    name: str
    capacity: int = Field(..., gt=0)
    description: Optional[str] = None

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = Field(None, gt=0)
    is_occupied: Optional[bool] = None
    description: Optional[str] = None

class Table(TableBase):
    id: int
    is_occupied: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True