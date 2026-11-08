from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_admin
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.order import DashboardStats, OrderResponse

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Fetch administrative analytics for sales and inventory monitoring."""
    # Total revenue from paid/shipped/delivered orders
    valid_statuses = [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]
    revenue_result = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.status.in_(valid_statuses))
        .scalar()
    )
    total_revenue = Decimal(str(revenue_result or "0.00"))

    total_orders = db.query(Order).count()
    total_products = db.query(Product).filter(Product.is_active == True).count()
    low_stock_products = db.query(Product).filter(Product.is_active == True, Product.stock <= 5).count()

    recent_orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(6)
        .all()
    )

    return DashboardStats(
        total_revenue=total_revenue,
        total_orders=total_orders,
        total_products=total_products,
        low_stock_products=low_stock_products,
        recent_orders=recent_orders
    )
