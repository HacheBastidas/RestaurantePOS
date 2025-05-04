import sys
import os
import asyncio
from sqlalchemy.orm import Session

# Añadir el directorio principal del proyecto al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal, engine, Base
from app.users.models import User, UserRole
from app.products.models import Category, Product
from app.tables.models import Table
from app.auth.utils import get_password_hash

def init_db():
    db = SessionLocal()
    try:
        # Crear usuarios de ejemplo
        admin = User(
            username="admin",
            email="admin@example.com",
            password=get_password_hash("admin123"),
            full_name="Administrador",
            role=UserRole.ADMIN
        )
        waiter = User(
            username="mesero",
            email="mesero@example.com",
            password=get_password_hash("mesero123"),
            full_name="Mesero Ejemplo",
            role=UserRole.WAITER
        )
        kitchen = User(
            username="cocina",
            email="cocina@example.com",
            password=get_password_hash("cocina123"),
            full_name="Cocina Ejemplo",
            role=UserRole.KITCHEN
        )
        cashier = User(
            username="cajero",
            email="cajero@example.com",
            password=get_password_hash("cajero123"),
            full_name="Cajero Ejemplo",
            role=UserRole.CASHIER
        )
        
        db.add_all([admin, waiter, kitchen, cashier])
        db.commit()
        
        # Crear categorías de ejemplo
        category1 = Category(name="Entradas", description="Platos para comenzar")
        category2 = Category(name="Platos fuertes", description="Platos principales")
        category3 = Category(name="Postres", description="Postres y dulces")
        category4 = Category(name="Bebidas", description="Bebidas y refrescos")
        
        db.add_all([category1, category2, category3, category4])
        db.commit()
        
        # Crear productos de ejemplo
        products = [
            Product(name="Nachos", description="Nachos con queso y guacamole", price=8.99, category_id=category1.id),
            Product(name="Alitas de pollo", description="Alitas de pollo con salsa BBQ", price=10.99, category_id=category1.id),
            Product(name="Hamburguesa", description="Hamburguesa con queso y papas fritas", price=12.99, category_id=category2.id),
            Product(name="Pizza", description="Pizza de pepperoni", price=14.99, category_id=category2.id),
            Product(name="Pasta", description="Pasta con salsa de tomate", price=11.99, category_id=category2.id),
            Product(name="Helado", description="Helado de vainilla con chocolate", price=5.99, category_id=category3.id),
            Product(name="Brownie", description="Brownie con helado", price=6.99, category_id=category3.id),
            Product(name="Refresco", description="Refresco de cola", price=2.99, category_id=category4.id),
            Product(name="Agua", description="Agua mineral", price=1.99, category_id=category4.id),
            Product(name="Café", description="Café americano", price=2.99, category_id=category4.id),
        ]
        
        db.add_all(products)
        db.commit()
        
        # Crear mesas de ejemplo
        tables = [
            Table(name="Mesa 1", capacity=4, description="Cerca de la entrada"),
            Table(name="Mesa 2", capacity=4, description="Cerca de la ventana"),
            Table(name="Mesa 3", capacity=6, description="En el centro"),
            Table(name="Mesa 4", capacity=2, description="Para parejas"),
            Table(name="Mesa 5", capacity=8, description="Para grupos grandes"),
        ]
        
        db.add_all(tables)
        db.commit()
        
        print("Base de datos inicializada con datos de ejemplo")
    
    except Exception as e:
        print(f"Error al inicializar la base de datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()