from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..db import get_db
from ..auth.dependencies import get_current_active_user, get_waiter_user, get_kitchen_user, get_cashier_user
from ..users.models import User
from . import crud, schemas, models

router = APIRouter()

@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_waiter_user)
):
    return crud.create_order(db=db, order=order, user_id=current_user.id)

@router.get("/", response_model=List[schemas.OrderSummary])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.OrderStatus] = None,
    order_type: Optional[models.OrderType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    orders = crud.get_orders(db, skip=skip, limit=limit, status=status, order_type=order_type)
    return orders

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def read_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada"
        )
    return db_order

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    status: models.OrderStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Validar permisos según el estado a actualizar
    if status in [models.OrderStatus.PREPARING, models.OrderStatus.READY]:
        # Solo cocina y admin pueden cambiar a estos estados
        if current_user.role not in [models.UserRole.KITCHEN, models.UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para cambiar a este estado"
            )
    elif status == models.OrderStatus.PAID:
        # Solo cajero y admin pueden marcar como pagado
        if current_user.role not in [models.UserRole.CASHIER, models.UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para marcar como pagado"
            )
    elif status == models.OrderStatus.DELIVERED:
        # Solo mesero y admin pueden marcar como entregado
        if current_user.role not in [models.UserRole.WAITER, models.UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para marcar como entregado"
            )
    
    return crud.update_order_status(db=db, order_id=order_id, status=status)

@router.put("/{order_id}", response_model=schemas.OrderResponse)
def update_order(
    order_id: int,
    order: schemas.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_waiter_user)
):
    return crud.update_order(db=db, order_id=order_id, order=order)

@router.post("/{order_id}/items", response_model=schemas.OrderResponse)
def add_items_to_order(
    order_id: int,
    items: schemas.OrderItemsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_waiter_user)
):
    return crud.add_items_to_order(db=db, order_id=order_id, items=items)

@router.delete("/{order_id}/items/{item_id}", response_model=schemas.OrderResponse)
def remove_item_from_order(
    order_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_waiter_user)
):
    return crud.remove_item_from_order(db=db, order_id=order_id, item_id=item_id)

@router.put("/{order_id}/items/{item_id}", response_model=schemas.OrderResponse)
def update_order_item(
    order_id: int,
    item_id: int,
    item: schemas.OrderItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_waiter_user)
):
    return crud.update_order_item(db=db, order_id=order_id, item_id=item_id, item=item)

@router.get("/kitchen", response_model=List[schemas.OrderResponse])
def read_kitchen_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_kitchen_user)
):
    # Órdenes para mostrar en cocina (pendientes y en preparación)
    kitchen_statuses = [models.OrderStatus.PENDING, models.OrderStatus.PREPARING]
    orders = db.query(models.Order).filter(models.Order.status.in_(kitchen_statuses)).order_by(models.Order.created_at.asc()).all()
    return orders

@router.get("/cashier/pending", response_model=List[schemas.OrderResponse])
def read_cashier_pending_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_cashier_user)
):
    # Órdenes listas para pagar (listas para entrega o entregadas pero no pagadas)
    cashier_statuses = [models.OrderStatus.READY, models.OrderStatus.DELIVERED]
    orders = db.query(models.Order).filter(
        models.Order.status.in_(cashier_statuses)
    ).order_by(models.Order.created_at.asc()).all()
    return orders