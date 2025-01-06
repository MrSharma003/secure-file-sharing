import random
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import send_mail
from django.conf import settings


def generate_mfa_code() -> str: 
    return str(random.randint(100000,999999))

def send_mfa_email(user, code):
    try: 
        send_mail(
            'MFA Code for Login',
            f'Code for login is: {code}',
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
    except ImproperlyConfigured as e:
        print(f"Configuration error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
        