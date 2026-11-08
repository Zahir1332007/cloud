import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_optional_current_user, get_current_admin
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter()


def generate_order_number() -> str:
    """Generates unique friendly order reference like ORD-20261108-A9F2."""
    now_str = datetime.utcnow().strftime("%Y%m%d")
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"ORD-{now_str}-{unique_suffix}"


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Checkout simulation.
    Performs an atomic transaction:
    - Validates product existence and available stock
    - Decrements stock
    - Calculates totals
    - Saves order and order line items
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="La orden no contiene productos.")

    try:
        total_amount = Decimal("0.00")
        order_items_to_create = []

        # Lock rows or check stock atomically
        is_sqlite = "sqlite" in str(db.bind.url) if db.bind else False
        for item in payload.items:
            product_query = db.query(Product).filter(Product.id == item.product_id)
            if not is_sqlite:
                product_query = product_query.with_for_update()
            product = product_query.first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Producto #{item.product_id} no encontrado")
            if not product.is_active:
                raise HTTPException(status_code=400, detail=f"El producto '{product.name}' ya no está disponible.")
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{product.name}'. Solicitado: {item.quantity}, Disponible: {product.stock}"
                )

            # Deduct stock
            product.stock -= item.quantity
            item_subtotal = Decimal(str(product.price)) * Decimal(str(item.quantity))
            total_amount += item_subtotal

            order_items_to_create.append(
                OrderItem(
                    product_id=product.id,
                    product_name=product.name,
                    quantity=item.quantity,
                    unit_price=product.price,
                    subtotal=item_subtotal
                )
            )

        # Create Order record
        new_order = Order(
            order_number=generate_order_number(),
            user_id=current_user.id if current_user else None,
            customer_name=payload.customer_name,
            customer_email=payload.customer_email.lower(),
            shipping_address=payload.shipping_address,
            phone=payload.phone,
            total_amount=total_amount,
            status=OrderStatus.PAID,  # For simulation purposes, simulated checkout is confirmed/paid immediately
            payment_method=payload.payment_method,
            items=order_items_to_create
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la orden: {str(e)}"
        )


@router.get("", response_model=List[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status_filter: Optional[OrderStatus] = Query(None)
):
    """
    List orders. Customers see their own orders; Admins can see all orders.
    """
    query = db.query(Order)
    if current_user.role != UserRole.ADMIN:
        query = query.filter(Order.user_id == current_user.id)

    if status_filter:
        query = query.filter(Order.status == status_filter)

    return query.order_by(Order.created_at.desc()).all()


@router.get("/track/{order_number}", response_model=OrderResponse)
def track_order_by_number(order_number: str, db: Session = Depends(get_db)):
    """Public tracking endpoint by Order Number."""
    order = db.query(Order).filter(Order.order_number == order_number.strip().upper()).first()
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return order


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single order details (Customer can only view own order; Admin can view any)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    if current_user.role != UserRole.ADMIN and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes autorización para ver esta orden")

    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update order status (Admin only)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order

