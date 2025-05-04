from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, Field, validator
from ..products.schemas import ProductSimple
from ..tables.schemas import Table
from .models import OrderType, OrderStatus

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    notes: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)
    notes: Optional[str] = None

class OrderItemResponse(OrderItemBase):
    id: int
    price: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    product: ProductSimple

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    order_type: OrderType

    # Para pedidos de mesa
    table_id: Optional[int] = None

    # Para pedidos a domicilio
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None

    @validator('table_id')
    def validate_table_id(cls, v, values):
        if values.get('order_type') == OrderType.TABLE and v is None:
            raise ValueError('Para pedidos de mesa, se requiere el table_id')
        return v

    @validator('customer_name', 'customer_phone', 'customer_address')
    def validate_delivery_fields(cls, v, values, **kwargs):
        field = kwargs.get('field')
        if values.get('order_type') == OrderType.DELIVERY and v is None:
            raise ValueError(f'Para pedidos a domicilio, se requiere {field}')
        return v

class OrderItemsCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    table_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    order_number: str
    status: OrderStatus
    subtotal: float
    tax: float
    total: float
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse]
    table: Optional[Table] = None

    class Config:
        orm_mode = True

class OrderSummary(BaseModel):
    id: int
    order_number: str
    order_type: OrderType
    status: OrderStatus
    total: float
    created_at: datetime
    table_id: Optional[int] = None
    customer_name: Optional[str] = None

    class Config:
        orm_mode = True