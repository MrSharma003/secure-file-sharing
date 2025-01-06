import mimetypes
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from files.models import File
from files.utils import decrypt_file
from .models import FilePermission
from .utils import generate_shareable_link, validate_shareable_link
from django.http import FileResponse, Http404
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

# Single Responsibility: Handling file sharing logic
class FileSharingService:
    def share_file(self, file, target_user, permission_type, expiration=None):
        file_permission, created = FilePermission.objects.get_or_create(
            user=target_user,
            file=file,
            permission=permission_type
        )
        if expiration:
            file_permission.expiration = expiration
            file_permission.save()
        return file_permission

# Single Responsibility: Generating shareable links
class ShareableLinkService:
    def generate_link(self, file_permission):
        return generate_shareable_link(file_permission)

# Single Responsibility: Validating file permissions
class FileValidationService:
    def validate(self, file_permission, token):
        return validate_shareable_link(file_permission, token)

# Single Responsibility: Decrypting files
class FileDecryptionService:
    def decrypt(self, encrypted_data):
        return decrypt_file(encrypted_data)

# Refactored View to handle file sharing
class ShareFileView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, file_sharing_service=None):
        self.file_sharing_service = file_sharing_service or FileSharingService()

    def post(self, request, file_id):
        file = get_object_or_404(File, id=file_id, owner=request.user)
        target_user_id = request.data['user_id']
        permission_type = request.data['permission']
        expiration = request.data.get('expiration')
        target_user = get_object_or_404(settings.AUTH_USER_MODEL, id=target_user_id)

        self.file_sharing_service.share_file(file, target_user, permission_type, expiration)
        return Response({"message": "File shared successfully"})

# Refactored View to generate shareable links
class GenerateShareableLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, link_service=None):
        self.link_service = link_service or ShareableLinkService()

    def get(self, request, file_id):
        file = get_object_or_404(File, id=file_id)
        if file.owner != request.user:
            return Response({"error": "You do not have permission to generate a link for this file."}, status=403)

        file_permission, _ = FilePermission.objects.get_or_create(
            file=file,
            user=request.user,
            permission=FilePermission.VIEW
        )
        link = self.link_service.generate_link(file_permission)
        return Response({"link": link})

# Refactored View to securely download files
class SecureDownloadView(APIView):
    permission_classes = (permissions.AllowAny,)

    def __init__(self, validation_service=None, decryption_service=None):
        self.validation_service = validation_service or FileValidationService()
        self.decryption_service = decryption_service or FileDecryptionService()

    def get(self, request, file_id):
        logger.info("hello I am here")
        token = request.query_params.get('token')
        file_permission = get_object_or_404(FilePermission, file_id=file_id)

        if not self.validation_service.validate(file_permission, token):
            return Response({"error": "Invalid or expired link"}, status=403)

        file = file_permission.file
        decrypted_data = self.decryption_service.decrypt(file.encrypted_file.read().decode('utf-8'))

        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(decrypted_data)
            temp_file_path = temp_file.name

        try:
            return FileResponse(open(temp_file_path, 'rb'), as_attachment=True, filename=file.encrypted_file.name)
        except FileNotFoundError:
            raise Http404("File not found.")
        finally:
            os.remove(temp_file_path)
