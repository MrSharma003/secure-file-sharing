from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.timezone import now
from .utils import generate_mfa_code
from django.conf import settings

class UserAccountManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError("User musy have an email address")
        
        email = self.normalize_email(email)

        user = self.model(
            email = email,
            name = name
        )

        user.set_password(password)
        user.save(using = self.db)

        return user
    
    def create_author(self, email, name, password=None):
        user = self.create_user(email, name, password)

        user.is_author = True
        user.save(using = self.db)

        return user
    
    def create_superuser(self, email, name, password=None):
        user = self.create_user(email, name, password)

        user.is_superuser = True
        user.is_staff = True
        user.save(using = self.db)

        return user


class UserAccount(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, max_length=100)
    name = models.CharField(max_length=100)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    is_author = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email
    

class OTPModel(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self):
        self.otp = generate_mfa_code()
        self.created_at = now()
        self.save()
    
    def validate_otp(self) -> bool:
        return now() < self.created_at + timedelta(minutes = 5)
        