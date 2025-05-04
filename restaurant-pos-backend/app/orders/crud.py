from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import random
import string
from datetime import datetime
from . import models, schemas
from ..products.crud import get_product
from ..tables.crud import get_table, occupy_table

def generate_order_number():
    # Genera un número de orden único basado en la fecha + números aleatorios
    now = datetime.now()
    date_str = now.strftime("%Y%m%d")
    random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ORD-{date_str}-{random_chars}"

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_order_by_number(db: Session, order_number: str):
    return db.query(models.Order).filter(models.Order.order_number == order_number).first()

def get_orders(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    status: models.OrderStatus = None,
    order_type: models.OrderType = None
):
    query = db.query(models.Order)
    
    if status:
        query = query.filter(models.Order.status == status)
    
    if order_type:
        query = query.filter(models.Order.order_type == order_type)
    
    return query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()

def create_order(db: Session, order: schemas.OrderCreate, user_id: int):
    # Verificar si es un pedido de mesa y la mesa existe
    if order.order_type == models.OrderType.TABLE:
        table = get_table(db, table_id=order.table_id)
        if not table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mesa no encontrada"
            )
        # Marcar la mesa como ocupada
        occupy_table(db, table_id=order.table_id, is_occupied=True)
    
    # Calcular totales
    subtotal = 0
    items_data = []
    
    for item in order.items:
        product = get_product(db, product_id=item.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {item.product_id} no encontrado"
            )
        
        item_price = product.price * item.quantity
        subtotal += item_price
        
        items_data.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": product.price,
            "notes": item.notes
        })
    
    # Calcular impuestos y total (ejemplo: 10% de impuestos)
    tax_rate = 0.10
    tax = subtotal * tax_rate
    total = subtotal + tax
    
    # Crear la orden
    db_order = models.Order(
        order_number=generate_order_number(),
        order_type=order.order_type,
        table_id=order.table_id if order.order_type == models.OrderType.TABLE else None,
        customer_name=order.customer_name if order.order_type == models.OrderType.DELIVERY else None,
        customer_phone=order.customer_phone if order.order_type == models.OrderType.DELIVERY else None,
        customer_address=order.customer_address if order.order_type == models.OrderType.DELIVERY else None,
        subtotal=subtotal,
        tax=tax,
        total=total,
        created_by=user_id
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Agregar items a la orden
    for item_data in items_data:
        db_item = models.OrderItem(
            order_id=db_order.id,
            **item_data
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order_status(db: Session, order_id: int, status: models.OrderStatus):
    db_order = get_order(db, order_id=order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada"
        )
    
    # Si estamos marcando como pagado o entregado y es una orden de mesa, liberamos la mesa
    if (status == models.OrderStatus.PAID or status == models.OrderStatus.DELIVERED) and db_order.order_type == models.OrderType.TABLE:
        occupy_table(db, table_id=db_order.table_id, is_occupied=False)
    
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order(db: Session, order_id: int, order: schemas.OrderUpdate):
    db_order = get_order(db, order_id=order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada"
        )
    
    order_data = order.dict(exclude_unset=True)
    
    # Si estamos actualizando el estado y es para pagar o entregar una orden de mesa, liberamos la mesa
    if "status" in order_data:
        status = order_data["status"]
        if (status == models.OrderStatus.PAID or status == models.OrderStatus.DELIVERED) and db_order.order_type == models.OrderType.TABLE:
            occupy_table(db, table_id=db_order.table_id, is_occupied=False)
    
    for key, value in order_data.items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def add_items_to_order(db: Session, order_id: int, items: schemas.OrderItemsCreate):
    db_order = get_order(db, order_id=order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada"
        )
    
    # Si la orden ya está pagada o entregada, no se pueden agregar más items
    if db_order.status in [models.OrderStatus.PAID, models.OrderStatus.DELIVERED, models.OrderStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pueden agregar items a una orden en estado {db_order.status}"
        )
    
    # Calcular totales adicionales
    additional_subtotal = 0
    items_data = []
    
    for item in items.items:
        product = get_product(db, product_id=item.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {item.product_id} no encontrado"
            )
        
        item_price = product.price * item.quantity
        additional_subtotal += item_price
        
        db_item = models.OrderItem(
            order_id=order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price,
            notes=item.notes
        )
        db.add(db_item)
    
    # Recalcular totales
    tax_rate = 0.10
    db_order.subtotal += additional_subtotal
    db_order.tax = db_order.subtotal * tax_rate
    db_order.total = db_order.subtotal + db_order.tax
    
    db.commit()
    db.refresh(db_order)
    return db_order

def remove_item_from_order(db: Session, order_id: int, item_id: int):
    db_order = get_order(db, order_id=order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada"
        )
    
    # Si la orden ya está pagada o entregada, no se pueden eliminar items
    if db_order.status in [models.OrderStatus.PAID, models.OrderStatus.DELIVERED, models.OrderStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pueden eliminar items de una orden en estado {db_order.status}"
        )
    
    db_item = db.query(models.OrderItem).filter(
        models.OrderItem.id == item_id,
        models.OrderItem.order_id == order_id
    ).first()
    
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado en la orden"
        )
    
    # Recalcular totales
    item_total = db_item.price * db_item.quantity
    db_order.subtotal -= item_total
    tax_rate = 0.10
    db_order.tax = db_order.subtotal * tax_rate
    db_order.total = db_order.subtotal + db_order.tax
    
    db.delete(db_item)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order_item(db: Session, order_id: int, item_id: int, item: schemas.OrderItemUpdate):
    db_order = get_order(db, order_id=order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada"
        )
    
    # Si la orden ya está pagada o entregada, no se pueden actualizar items
    if db_order.status in [models.OrderStatus.PAID, models.OrderStatus.DELIVERED, models.OrderStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pueden actualizar items de una orden en estado {db_order.status}"
        )
    
    db_item = db.query(models.OrderItem).filter(
        models.OrderItem.id == item_id,
        models.OrderItem.order_id == order_id
    ).first()
    
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado en la orden"
        )
    
    # Guardar valores anteriores para recalcular
    old_quantity = db_item.quantity
    old_total = db_item.price * old_quantity
    
    # Actualizar el item
    item_data = item.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    
    # Recalcular totales
    new_total = db_item.price * db_item.quantity
    total_difference = new_total - old_total
    
    db_order.subtotal += total_difference
    tax_rate = 0.10
    db_order.tax = db_order.subtotal * tax_rate
    db_order.total = db_order.subtotal + db_order.tax
    
    db.commit()
    db.refresh(db_item)
    db.refresh(db_order)
    return db_order