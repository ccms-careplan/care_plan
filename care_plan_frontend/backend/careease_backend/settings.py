# from pathlib import Path
# import os
# from dotenv import load_dotenv

# load_dotenv()

# BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret")
# DEBUG = True
# ALLOWED_HOSTS = ["127.0.0.1", "localhost", "0.0.0.0"]

# INSTALLED_APPS = [
#     "django.contrib.admin",
#     "django.contrib.auth",
#     "django.contrib.contenttypes",
#     "django.contrib.sessions",
#     "django.contrib.messages",
#     "django.contrib.staticfiles",

#     "rest_framework",
#     "corsheaders",

#     "assessments",
# ]

# MIDDLEWARE = [
#     "corsheaders.middleware.CorsMiddleware",
#     "django.middleware.security.SecurityMiddleware",
#     "django.contrib.sessions.middleware.SessionMiddleware",
#     "django.middleware.common.CommonMiddleware",
#     "django.middleware.csrf.CsrfViewMiddleware",
#     "django.contrib.auth.middleware.AuthenticationMiddleware",
#     "django.contrib.messages.middleware.MessageMiddleware",
#     "django.middleware.clickjacking.XFrameOptionsMiddleware",
# ]

# ROOT_URLCONF = "careease_backend.urls"

# TEMPLATES = [
#     {
#         "BACKEND": "django.template.backends.django.DjangoTemplates",
#         "DIRS": [],
#         "APP_DIRS": True,
#         "OPTIONS": {
#             "context_processors": [
#                 "django.template.context_processors.debug",
#                 "django.template.context_processors.request",
#                 "django.contrib.auth.context_processors.auth",
#                 "django.contrib.messages.context_processors.messages",
#             ],
#         },
#     }
# ]

# WSGI_APPLICATION = "careease_backend.wsgi.application"

# # Use SQLite to avoid your MariaDB 10.4 issue
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }

# AUTH_PASSWORD_VALIDATORS = []

# LANGUAGE_CODE = "en-us"
# TIME_ZONE = "UTC"
# USE_I18N = True
# USE_TZ = True

# STATIC_URL = "/static/"
# MEDIA_URL = "/media/"
# MEDIA_ROOT = BASE_DIR / "media"

# DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS_ALLOW_ALL_ORIGINS = True

# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
# OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
# OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small")

# TESSERACT_CMD = os.getenv("TESSERACT_CMD", "")




# careease_backend/settings.py
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# -----------------------------------------------------------------------------
# Core settings
# -----------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret")
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost", "0.0.0.0"]

# -----------------------------------------------------------------------------
# LLM / provider settings
# -----------------------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small")


TESSERACT_CMD = os.getenv("TESSERACT_CMD", "")
CARE_PLAN_TEMPLATE_PATH = os.getenv("CARE_PLAN_TEMPLATE_PATH", str(BASE_DIR / "care_plan_template.json"))



# -----------------------------------------------------------------------------
# Applications
# -----------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",
    "assessments",
]

# -----------------------------------------------------------------------------
# Middleware
# -----------------------------------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -----------------------------------------------------------------------------
# URLs / WSGI
# -----------------------------------------------------------------------------
ROOT_URLCONF = "careease_backend.urls"
WSGI_APPLICATION = "careease_backend.wsgi.application"

# -----------------------------------------------------------------------------
# Templates
# -----------------------------------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# -----------------------------------------------------------------------------
# Password validation (disabled for prototype)
# -----------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = []

# -----------------------------------------------------------------------------
# Internationalization
# -----------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# -----------------------------------------------------------------------------
# Static & Media
# -----------------------------------------------------------------------------
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# -----------------------------------------------------------------------------
# Misc
# -----------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
CORS_ALLOW_ALL_ORIGINS = True
