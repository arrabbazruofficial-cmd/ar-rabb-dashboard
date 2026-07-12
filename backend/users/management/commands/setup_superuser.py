import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Automatically create a superuser based on environment variables'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not email or not password:
            print("==================================================")
            print("⚠️  SUPERUSER SETUP SKIPPED")
            print("⚠️  Missing DJANGO_SUPERUSER_EMAIL or DJANGO_SUPERUSER_PASSWORD")
            print("==================================================")
            return

        if User.objects.filter(email=email).exists():
            print("==================================================")
            print(f"✅  SUPERUSER SETUP: Account '{email}' already exists.")
            print("==================================================")
        else:
            User.objects.create_superuser(
                email=email,
                password=password,
                role='SUPER_ADMIN'
            )
            print("==================================================")
            print(f"🚀  SUPERUSER SETUP SUCCESSFUL!")
            print(f"🚀  Created super admin account for: {email}")
            print("==================================================")
