from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.models.order import OrderStatus, PaymentMethod


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_email: EmailStr
    shipping_address: str = Field(..., min_length=5)
    phone: Optional[str] = None
    payment_method: PaymentMethod = PaymentMethod.CREDIT_CARD
    items: List[OrderItemCreate] = Field(..., min_items=1)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int] = None
    customer_name: str
    customer_email: str
    shipping_address: str
    phone: Optional[str] = None
    total_amount: Decimal
    status: OrderStatus
    payment_method: PaymentMethod
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_revenue: Decimal
    total_orders: int
    total_products: int
    low_stock_products: int
    recent_orders: List[OrderResponse]

