import secrets
from django.utils.timezone import now, timedelta

def generate_shareable_link(file_permission, expiration_minutes=120):
    token = secrets.token_urlsafe(16)
    file_permission.expiration = now() + timedelta(minutes=expiration_minutes)
    file_permission.token = token
    file_permission.save()
    return f"/secure-download/{file_permission.file.id}/?token={token}"

def validate_shareable_link(file_permission, token):
    # For demonstration, we only check expiration (in production, store tokens securely).
    return not file_permission.is_expired()
