#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


def main():
    """Run administrative tasks."""
    # Ensure backend directory and project virtualenv site-packages are in sys.path
    backend_dir = Path(__file__).resolve().parent
    workspace_dir = backend_dir.parent
    venv_site_packages = workspace_dir / 'backend_venv' / 'Lib' / 'site-packages'

    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))

    if venv_site_packages.is_dir() and str(venv_site_packages) not in sys.path:
        sys.path.append(str(venv_site_packages))

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
