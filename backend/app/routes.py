from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from datetime import datetime, timezone

from .database import get_db
from .models import Product
from .schemas import PaginatedProductsResponse
from .pagination import decode_cursor, encode_cursor

router = APIRouter()

@router.get("/products", response_model=PaginatedProductsResponse)
def get_products(
    category: str = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    cursor: str = Query(None, description="Base64 encoded cursor"),
    snapshot: str = Query(None, description="ISO timestamp for consistency"),
    db: Session = Depends(get_db)
):
    # 1. Handle Snapshot for Consistency
    if not snapshot:
        # Generate new snapshot time if not provided
        snapshot_dt = datetime.now(timezone.utc)
    else:
        try:
            snapshot_dt = datetime.fromisoformat(snapshot)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid snapshot format. Must be ISO 8601.")

    # 2. Build Base Query bounded by Snapshot
    query = db.query(Product).filter(Product.updated_at <= snapshot_dt)

    if category:
        query = query.filter(Product.category == category)

    # 3. Handle Keyset Cursor Pagination
    if cursor:
        try:
            cursor_data = decode_cursor(cursor)
            cursor_updated_at = cursor_data["updated_at"]
            cursor_id = cursor_data["id"]
            
            # Since ordering is updated_at DESC, id DESC:
            query = query.filter(
                or_(
                    Product.updated_at < cursor_updated_at,
                    and_(Product.updated_at == cursor_updated_at, Product.id < cursor_id)
                )
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cursor format")

    # 4. Order and Limit
    # Request limit + 1 to know if there's a next page without an extra COUNT() query
    query = query.order_by(desc(Product.updated_at), desc(Product.id)).limit(limit + 1)
    
    results = query.all()
    
    # 5. Prepare Response
    has_more = len(results) > limit
    products_to_return = results[:limit]
    
    next_cursor = None
    if has_more and products_to_return:
        last_item = products_to_return[-1]
        next_cursor = encode_cursor(last_item.updated_at, last_item.id)

    return PaginatedProductsResponse(
        products=products_to_return,
        next_cursor=next_cursor,
        snapshot=snapshot_dt.isoformat(),
        has_more=has_more
    )
