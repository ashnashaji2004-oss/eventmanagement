import sys
import logging
from django.apps import AppConfig
from django.db.models.signals import post_migrate

logger = logging.getLogger(__name__)


def auto_seed_after_migrate(sender, **kwargs):
    """
    Automatically initializes the SchoolFest system with official demo accounts,
    houses, settings, and competition data whenever migrations complete.
    """
    if sender.name == 'fest_api':
        # Skip during unit tests to let tests use their own fixtures
        if any(cmd in sys.argv for cmd in ['test', 'check', 'makemigrations']):
            return

        try:
            from fest_api.seed_helpers import ensure_all_demo_accounts, ensure_core_structure
            ensure_core_structure()
            ensure_all_demo_accounts()
            logger.info("SchoolFest demo accounts and core structure verified.")
        except Exception as e:
            logger.warning(f"Core structure initialization: {e}")

        # If events are unseeded, trigger seed_data command
        try:
            from fest_api.models import Event
            if Event.objects.count() == 0:
                from django.core.management import call_command
                logger.info("Seeding SchoolFest initial competition dataset...")
                call_command('seed_data')
        except Exception as e:
            logger.warning(f"Event auto-seeding skipped: {e}")


class FestApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'fest_api'

    def ready(self):
        post_migrate.connect(auto_seed_after_migrate, sender=self)
