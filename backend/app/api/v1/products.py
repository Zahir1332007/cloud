from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, desc, asc
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_admin
from app.models.product import Product, Category
from app.models.user import User
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
)

router = APIRouter()


@router.get("", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None, description="Category slug or ID"),
    search: Optional[str] = Query(None, description="Search term in name or description"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    in_stock_only: bool = Query(False),
    sort: Optional[str] = Query("newest", pattern="^(newest|price_asc|price_desc|rating)$"),
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=100)
):
    """List products with filtering, search, sorting and pagination."""
    query = db.query(Product).filter(Product.is_active == True)

    # Category filter
    if category:
        if category.isdigit():
            query = query.filter(Product.category_id == int(category))
        else:
            query = query.join(Product.category).filter(Category.slug == category)

    # Search filter
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(or_(Product.name.ilike(pattern), Product.description.ilike(pattern)))

    # Price range
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Stock
    if in_stock_only:
        query = query.filter(Product.stock > 0)

    # Sorting
    if sort == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort == "rating":
        query = query.order_by(desc(Product.rating))
    else:
        query = query.order_by(desc(Product.created_at))

    total = query.count()
    pages = ceil(total / size) if total > 0 else 1
    offset = (page - 1) * size
    items = query.offset(offset).limit(size).all()

    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@router.get("/{id_or_slug}", response_model=ProductResponse)
def get_product(id_or_slug: str, db: Session = Depends(get_db)):
    """Fetch product by numerical ID or slug."""
    if id_or_slug.isdigit():
        product = db.query(Product).filter(Product.id == int(id_or_slug)).first()
    else:
        product = db.query(Product).filter(Product.slug == id_or_slug).first()

    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new product (Admin only)."""
    # Verify category exists
    cat = db.query(Category).filter(Category.id == payload.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="La categoría especificada no existe")

    # Verify unique slug
    existing = db.query(Product).filter(Product.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un producto con este slug")

    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update an existing product (Admin only)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    if "category_id" in update_data:
        cat = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Categoría especificada no existe")

    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete a product (Admin only)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(product)
    db.commit()
    return None

