import environ, os
from pathlib import Path

env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env()  # reads .env

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = env('DEBUG')

SECRET_KEY = env('SECRET_KEY')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

DATABASES = {
    'default': env.db_url('DATABASE_URL', default='postgres://careplan:careplan@db:5432/careplan')
}

# Static & Media
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage' if env.bool('USE_S3', False) else 'django.core.files.storage.FileSystemStorage'
if env.bool('USE_S3', False):
    AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default=None)
    AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"

# Celery
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://redis:6379/0')
CELERY_RESULT_BACKEND = CELERY_BROKER_URL

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Other
CORS_ALLOW_ALL_ORIGINS = True  # dev only
