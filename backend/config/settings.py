import os
import sys
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Ensure project virtualenv site-packages is in sys.path if running under global python
venv_site_packages = BASE_DIR.parent / 'backend_venv' / 'Lib' / 'site-packages'
if venv_site_packages.is_dir() and str(venv_site_packages) not in sys.path:
    sys.path.append(str(venv_site_packages))

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-schoolfest-super-secret-key-2026-prod-stage')

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

allowed_hosts_env = os.getenv('ALLOWED_HOSTS')
if allowed_hosts_env:
    ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_env.split(',') if h.strip()]
else:
    ALLOWED_HOSTS = ['*']

render_hostname = os.getenv('RENDER_EXTERNAL_HOSTNAME')
if render_hostname and render_hostname not in ALLOWED_HOSTS and '*' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_hostname)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

AUTH_USER_MODEL = 'fest_api.User'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # SchoolFest app
    'fest_api',
]
try:
    import whitenoise  # type: ignore # noqa: F401
    HAS_WHITENOISE = True
except ImportError:
    HAS_WHITENOISE = False

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
]
if HAS_WHITENOISE:
    MIDDLEWARE.append('whitenoise.middleware.WhiteNoiseMiddleware')

MIDDLEWARE += [
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database Configuration:
# Supports DATABASE_URL (Neon, Supabase, Render Postgres) with fallback to SQLite
database_url = os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL')
USE_SQLITE = os.getenv('USE_SQLITE', 'False' if database_url else 'True').lower() in ('true', '1', 'yes')

if not USE_SQLITE and database_url:
    try:
        import dj_database_url  # type: ignore
        DATABASES = {
            'default': dj_database_url.config(
                default=database_url,
                conn_max_age=600,
                conn_health_checks=True,
                ssl_require=True if any(k in database_url for k in ['neon.tech', 'supabase', 'sslmode=require']) else False
            )
        }
    except ImportError:
        from urllib.parse import urlparse, unquote, parse_qs
        url = urlparse(database_url)
        qs = parse_qs(url.query)
        sslmode = qs.get('sslmode', ['require' if url.hostname not in ('localhost', '127.0.0.1') else None])[0]

        db_config = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': url.path[1:],
            'USER': unquote(url.username) if url.username else '',
            'PASSWORD': unquote(url.password) if url.password else '',
            'HOST': url.hostname,
            'PORT': url.port or '5432',
        }
        if sslmode:
            db_config['OPTIONS'] = {'sslmode': sslmode}
        DATABASES = {'default': db_config}
elif not USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'schoolfest'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    sqlite_path = BASE_DIR / 'db.sqlite3'
    # In Vercel serverless functions, the root filesystem is read-only.
    if os.getenv('VERCEL') == '1':
        import shutil
        tmp_db = Path('/tmp') / 'db.sqlite3'
        if not tmp_db.exists():
            if sqlite_path.exists():
                shutil.copy2(sqlite_path, tmp_db)
            elif (BASE_DIR.parent / 'db.sqlite3').exists():
                shutil.copy2(BASE_DIR.parent / 'db.sqlite3', tmp_db)
        sqlite_path = tmp_db

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': sqlite_path,
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 6}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_ROOT.mkdir(parents=True, exist_ok=True)

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage" if (HAS_WHITENOISE and not DEBUG) else "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# SimpleJWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL', 'True').lower() in ('true', '1', 'yes')
CORS_ALLOW_CREDENTIALS = True
cors_origins_env = os.getenv('CORS_ALLOWED_ORIGINS')
if cors_origins_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]

# CSRF Trusted Origins for Render & Vercel
csrf_trusted_env = os.getenv('CSRF_TRUSTED_ORIGINS')
if csrf_trusted_env:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_trusted_env.split(',') if origin.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        'https://*.onrender.com',
        'https://*.vercel.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000'
    ]
    if render_hostname:
        CSRF_TRUSTED_ORIGINS.append(f'https://{render_hostname}')
