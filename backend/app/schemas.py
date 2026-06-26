from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ProductBase(BaseModel):
    name: str
    category: str
    price: float

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # updated from orm_mode for pydantic v2

class Cursor(BaseModel):
    updated_at: str
    id: int

class PaginatedProductsResponse(BaseModel):
    products: List[ProductResponse]
    next_cursor: Optional[str]
    snapshot: str
    has_more: bool
