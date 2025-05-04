from fastapi import Depends, HTTPException, status
from ..users.models import User, UserRole
from .jwt import verify_token

def get_current_user(user: User = Depends(verify_token)):
    return user

def get_current_active_user(user: User = Depends(get_current_user)):
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    return user

def get_waiter_user(user: User = Depends(get_current_active_user)):
    if user.role != UserRole.WAITER and user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes"
        )
    return user

def get_kitchen_user(user: User = Depends(get_current_active_user)):
    if user.role != UserRole.KITCHEN and user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes"
        )
    return user

def get_cashier_user(user: User = Depends(get_current_active_user)):
    if user.role != UserRole.CASHIER and user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes"
        )
    return user

def get_admin_user(user: User = Depends(get_current_active_user)):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes"
        )
    return user