from .base import *

DEBUG = True

DATABASES = {
    'default': env.db('DATABASE_URL', default=f'sqlite:///{BASE_DIR / "db.sqlite3"}')
}

# In development, we can be more relaxed with CORS
CORS_ALLOW_ALL_ORIGINS = True
