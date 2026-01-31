#!/usr/bin/env python3
"""
Database initialization script for IVF Audit Trail System
"""

from database import SessionLocal, create_tables, engine
from models import User, Base
from auth import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """Initialize database with default users"""
    logger.info("Creating database tables...")
    create_tables()
    
    db = SessionLocal()
    try:
        # Check if tables exist by trying to query
        try:
            db.execute("SELECT 1 FROM users LIMIT 1")
            tables_exist = True
        except:
            tables_exist = False
            
        if not tables_exist:
            logger.info("Tables not found, creating them...")
            Base.metadata.create_all(bind=engine)
        
        # Check if users already exist
        try:
            existing_users = db.query(User).count()
        except:
            existing_users = 0  # Table doesn't exist yet
        
        if existing_users > 0:
            logger.info("Users exist, updating them to match expected usernames...")
            # Update existing users
            admin = db.query(User).filter(User.role == "Admin").first()
            if admin and admin.username != "admin":
                admin.username = "admin"
                admin.hashed_password = get_password_hash("admin123")
                logger.info("Updated admin user")
            
            embryologist = db.query(User).filter(User.role == "Embryologist").first()
            if embryologist and embryologist.username != "embryologist":
                embryologist.username = "embryologist"
                embryologist.hashed_password = get_password_hash("embryo123")
                logger.info("Updated embryologist user")
                
            auditor = db.query(User).filter(User.role == "Auditor").first()
            if auditor and auditor.username != "auditor":
                auditor.username = "auditor"
                auditor.hashed_password = get_password_hash("audit123")
                logger.info("Updated auditor user")
            
            db.commit()
            logger.info("Database users updated successfully!")
            return
        
        # Create default users
        default_users = [
            {
                "username": "admin",
                "password": "admin123",  # Change in production!
                "role": "Admin"
            },
            {
                "username": "embryologist",
                "password": "embryo123",
                "role": "Embryologist"
            },
            {
                "username": "auditor",
                "password": "audit123",
                "role": "Auditor"
            }
        ]
        
        for user_data in default_users:
            hashed_password = get_password_hash(user_data["password"])
            user = User(
                username=user_data["username"],
                hashed_password=hashed_password,
                role=user_data["role"]
            )
            db.add(user)
            db.commit()  # Commit each user individually
            logger.info(f"Created user: {user_data['username']} ({user_data['role']})")
        logger.info("Database initialization completed successfully!")
        logger.warning("DEFAULT PASSWORDS: admin123, embryo123, audit123 - CHANGE THESE IN PRODUCTION!")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()