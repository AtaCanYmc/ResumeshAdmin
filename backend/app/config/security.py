from app.config.settings import settings

SECRET_KEY = settings.SUPABASE_JWT_SECRET
ALGORITHM = "HS256"
