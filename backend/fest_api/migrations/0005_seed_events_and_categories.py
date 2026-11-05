from django.db import migrations
from django.core.management import call_command

def run_seed_data(apps, schema_editor):
    try:
        call_command('seed_data')
    except Exception as e:
        print(f"Auto-seed during migration note: {e}")

class Migration(migrations.Migration):

    dependencies = [
        ('fest_api', '0004_alter_eventcategory_options_and_more'),
    ]

    operations = [
        migrations.RunPython(run_seed_data, reverse_code=migrations.RunPython.noop),
    ]

