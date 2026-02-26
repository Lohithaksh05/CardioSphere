"""
Async MongoDB connection using Motor.
Provides a singleton database instance for the application.
"""

import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import get_settings

settings = get_settings()

# Motor client — connection pool is managed automatically
client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_db():
    """Initialize MongoDB connection on startup."""
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL, tlsCAFile=certifi.where())
    db = client[settings.DATABASE_NAME]

    # Create indexes for performance
    await db.users.create_index("clerk_id", unique=True)
    await db.predictions.create_index("user_id")
    await db.predictions.create_index("created_at")
    await db.medications.create_index("user_id")
    await db.posts.create_index("created_at")
    await db.posts.create_index("user_id")
    await db.workout_plans.create_index("user_id")
    await db.workout_plans.create_index("created_at")
    await db.diet_plans.create_index("user_id")
    await db.diet_plans.create_index("created_at")

    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_db():
    """Close MongoDB connection on shutdown."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """Dependency injection helper for routes."""
    return db
