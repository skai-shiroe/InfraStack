from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Product, StockMovement, Category, Supplier, Client, Sale, SaleItem
from app.schemas import ProductCreate, ProductUpdate, StockMovementCreate


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    from app.models import Category, Supplier
    product = Product(
        name=data.name,
        description=data.description,
        quantity=data.quantity,
        unit=data.unit,
        price=data.price,
        category_id=data.category_id,
        supplier_id=data.supplier_id,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    # Eager load relationships for response
    await db.refresh(product, attribute_names=['category', 'supplier'])
    return product


async def get_products(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Product]:
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.category),
            selectinload(Product.supplier)
        )
        .offset(skip)
        .limit(limit)
        .order_by(Product.name)
    )
    return list(result.scalars().all())


async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.supplier))
        .where(Product.id == product_id)
    )
    return result.scalar_one_or_none()


async def update_product(db: AsyncSession, product_id: int, data: ProductUpdate) -> Product | None:
    product = await get_product(db, product_id)
    if not product:
        return None
    if data.name is not None:
        product.name = data.name
    if data.description is not None:
        product.description = data.description
    if data.quantity is not None:
        product.quantity = data.quantity
    if data.unit is not None:
        product.unit = data.unit
    if data.price is not None:
        product.price = data.price
    if data.category_id is not None:
        product.category_id = data.category_id
    if data.supplier_id is not None:
        product.supplier_id = data.supplier_id
    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = await get_product(db, product_id)
    if not product:
        return False
    await db.delete(product)
    await db.commit()
    return True


async def create_movement(db: AsyncSession, data: StockMovementCreate) -> tuple[StockMovement, Product]:
    product = await get_product(db, data.product_id)
    if not product:
        raise ValueError("Product not found")

    movement = StockMovement(
        product_id=data.product_id,
        movement_type=data.movement_type,
        quantity=data.quantity,
        reason=data.reason,
    )
    db.add(movement)

    if data.movement_type == "entry":
        product.quantity += data.quantity
    elif data.movement_type == "exit":
        if product.quantity < data.quantity:
            raise ValueError("Insufficient stock")
        product.quantity -= data.quantity

    await db.commit()
    await db.refresh(movement)
    await db.refresh(product)
    return movement, product


async def get_movements(
    db: AsyncSession,
    product_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[StockMovement]:
    query = select(StockMovement).order_by(desc(StockMovement.created_at))
    if product_id is not None:
        query = query.where(StockMovement.product_id == product_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


# Category CRUD
async def create_category(db: AsyncSession, name: str, description: str | None = None) -> Category:
    category = Category(name=name, description=description)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def get_categories(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Category]:
    result = await db.execute(select(Category).offset(skip).limit(limit).order_by(Category.name))
    return list(result.scalars().all())


async def get_category(db: AsyncSession, category_id: int) -> Category | None:
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()


async def update_category(db: AsyncSession, category_id: int, name: str | None = None, description: str | None = None) -> Category | None:
    category = await get_category(db, category_id)
    if not category:
        return None
    if name is not None:
        category.name = name
    if description is not None:
        category.description = description
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category_id: int) -> bool:
    category = await get_category(db, category_id)
    if not category:
        return False
    await db.delete(category)
    await db.commit()
    return True


# Supplier CRUD
async def create_supplier(db: AsyncSession, data: dict) -> Supplier:
    supplier = Supplier(**data)
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier


async def get_suppliers(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Supplier]:
    result = await db.execute(select(Supplier).offset(skip).limit(limit).order_by(Supplier.name))
    return list(result.scalars().all())


async def get_supplier(db: AsyncSession, supplier_id: int) -> Supplier | None:
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    return result.scalar_one_or_none()


async def update_supplier(db: AsyncSession, supplier_id: int, data: dict) -> Supplier | None:
    supplier = await get_supplier(db, supplier_id)
    if not supplier:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(supplier, key, value)
    await db.commit()
    await db.refresh(supplier)
    return supplier


async def delete_supplier(db: AsyncSession, supplier_id: int) -> bool:
    supplier = await get_supplier(db, supplier_id)
    if not supplier:
        return False
    await db.delete(supplier)
    await db.commit()
    return True


# Client CRUD
async def create_client(db: AsyncSession, data: dict) -> Client:
    client = Client(**data)
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


async def get_clients(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Client]:
    result = await db.execute(select(Client).offset(skip).limit(limit).order_by(Client.name))
    return list(result.scalars().all())


async def get_client(db: AsyncSession, client_id: int) -> Client | None:
    result = await db.execute(select(Client).where(Client.id == client_id))
    return result.scalar_one_or_none()


async def update_client(db: AsyncSession, client_id: int, data: dict) -> Client | None:
    client = await get_client(db, client_id)
    if not client:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(client, key, value)
    await db.commit()
    await db.refresh(client)
    return client


async def delete_client(db: AsyncSession, client_id: int) -> bool:
    client = await get_client(db, client_id)
    if not client:
        return False
    await db.delete(client)
    await db.commit()
    return True


# Sale CRUD
async def create_sale(db: AsyncSession, client_id: int | None, items_data: list[dict], payment_method: str | None = None, notes: str | None = None) -> Sale:
    
    total = sum(item["quantity"] * item["unit_price"] for item in items_data)
    
    sale = Sale(
        client_id=client_id,
        total=total,
        payment_method=payment_method,
        notes=notes,
    )
    db.add(sale)
    await db.flush()  # Get sale ID
    
    for item_data in items_data:
        # Update product stock
        product = await get_product(db, item_data["product_id"])
        if not product:
            raise ValueError(f"Product {item_data['product_id']} not found")
        if product.quantity < item_data["quantity"]:
            raise ValueError(f"Insufficient stock for {product.name}")
        
        product.quantity -= item_data["quantity"]
        
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["quantity"] * item_data["unit_price"],
        )
        db.add(sale_item)
    
    await db.commit()
    await db.refresh(sale)
    return sale


async def get_sales(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Sale]:
    result = await db.execute(
        select(Sale)
        .options(selectinload(Sale.items))  # ← AJOUTEZ CETTE LIGNE
        .offset(skip)
        .limit(limit)
        .order_by(desc(Sale.created_at))
    )
    return list(result.scalars().all())


async def get_sale(db: AsyncSession, sale_id: int) -> Sale | None:
    result = await db.execute(select(Sale)
                        .options(selectinload(Sale.items))  # ← AJOUTEZ CETTE LIGNE
                        .where(Sale.id == sale_id))
    return result.scalar_one_or_none()