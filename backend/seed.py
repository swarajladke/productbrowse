import os
import random
from datetime import datetime, timedelta, timezone
from faker import Faker
from app.database import SessionLocal, engine, Base
from app.models import Product

# Ensure tables are created
Base.metadata.create_all(bind=engine)

fake = Faker()

CATEGORIES = [
    "Electronics", "Books", "Clothing", "Sports", "Furniture",
    "Toys", "Beauty", "Automotive", "Home", "Groceries"
]

TOTAL_RECORDS = 200000
BATCH_SIZE = 5000

def seed_db():
    session = SessionLocal()
    
    print("Deleting existing records...")
    session.query(Product).delete()
    session.commit()
    
    print(f"Seeding {TOTAL_RECORDS} products in batches of {BATCH_SIZE}...")
    
    records_inserted = 0
    now = datetime.now(timezone.utc)
    
    while records_inserted < TOTAL_RECORDS:
        batch = []
        for _ in range(BATCH_SIZE):
            if records_inserted + len(batch) >= TOTAL_RECORDS:
                break
                
            random_days_ago = random.randint(0, 365)
            random_seconds_ago = random.randint(0, 86400)
            fake_time = now - timedelta(days=random_days_ago, seconds=random_seconds_ago)
            
            product = Product(
                name=fake.company() + " " + fake.word().capitalize(),
                category=random.choice(CATEGORIES),
                price=round(random.uniform(5.0, 1500.0), 2),
                created_at=fake_time,
                updated_at=fake_time
            )
            batch.append(product)
            
        session.bulk_save_objects(batch)
        session.commit()
        records_inserted += len(batch)
        print(f"Inserted {records_inserted} / {TOTAL_RECORDS}")

    session.close()
    print("Done!")

if __name__ == "__main__":
    seed_db()
