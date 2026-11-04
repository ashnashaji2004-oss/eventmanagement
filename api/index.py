import os
import sys

# Ensure backend directory and virtualenv site-packages are in Python search path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, 'backend')
venv_site = os.path.join(root_dir, 'backend_venv', 'Lib', 'site-packages')

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if os.path.isdir(venv_site) and venv_site not in sys.path:
    sys.path.append(venv_site)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application

# Vercel Serverless WSGI entrypoint
app = get_wsgi_application()
application = app
