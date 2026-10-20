import os

class Config:
    DATABASE_URL = os.environ.get("DATABASE_URL")
    JWT_SECRET = os.environ.get("JWT_SECRET")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 2