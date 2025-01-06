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
from django.utils.timezone import now
from django.http import FileResponse, Http404
import json
import logging
import tempfile
import os


logger = logging.getLogger(__name__)

class ShareFileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        """
        Share a file with specific users and permissions.
        """
        file = File.objects.get(id=file_id, owner=request.user)
        target_user_id = request.data['user_id']
        permission_type = request.data['permission']
        expiration = request.data.get('expiration')

        target_user = get_object_or_404(settings.AUTH_USER_MODEL, id=target_user_id)
        file_permission, created = FilePermission.objects.get_or_create(
            user=target_user,
            file=file,
            permission=permission_type
        )

        if expiration:
            file_permission.expiration = expiration
            file_permission.save()

        return Response({"message": "File shared successfully"})

class GenerateShareableLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        """
        Generate a secure link for sharing a file.
        """
        try:
            # Fetch the file object for the requested file_id
            file = File.objects.get(id=file_id)
        except File.DoesNotExist:
            return Response({"error": "File not found."}, status=404)

        # Ensure the request.user is the owner of the file
        if file.owner != request.user:
            return Response({"error": "You do not have permission to generate a link for this file."}, status=403)

        # Check if a FilePermission entry exists for the owner; if not, create one
        file_permission, created = FilePermission.objects.get_or_create(
            file=file,
            user=request.user,
            permission=FilePermission.VIEW  # Default permission is set to VIEW
        )

        # Generate a secure shareable link for the file
        link = generate_shareable_link(file_permission)
        print(link)

        return Response({"link": link})


class SecureDownloadView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, file_id):
        """
        Validate and download a file using a secure link.
        """
        logger.info("hello I am here")
        token = request.query_params.get('token')
        file_permission = get_object_or_404(FilePermission, file_id=file_id)

        # Validate the link
        if not validate_shareable_link(file_permission, token):
            return Response({"error": "Invalid or expired link"}, status=403)

        file = file_permission.file
        file_data = file.encrypted_file.read()
        
        # Decrypt the file data
        decrypted_data = decrypt_file(file_data.decode('utf-8'))

        # Use tempfile to create a temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(decrypted_data)
            temp_file_path = temp_file.name

        try:
            # Serve the file as a response
            return FileResponse(open(temp_file_path, 'rb'), as_attachment=True, filename=file.encrypted_file.name)
        except FileNotFoundError:
            raise Http404("File not found.")
        finally:
            # Clean up the temporary file
            os.remove(temp_file_path)
    
# class SecureFileDownloadView(APIView):

#     permission_classes = (permissions.AllowAny, )

#     def get(self, request, file_id):
#         token = request.GET.get('token')
#         if not token:
#             return Response({"error": "Token is required"}, status=400)

#         try:
#             # Fetch file and permission details
#             file_permission = FilePermission.objects.get(
#                 file_id=file_id,
#                 token=token,
#                 expiration__gte=now()  # Ensure the token hasn't expired
#             )
#         except FilePermission.DoesNotExist:
#             return Response({"error": "Invalid or expired token"}, status=403)

#         # Serve the file
#         file = file_permission.file
#         file_path = file.encrypted_file.path
#         content_type, _ = mimetypes.guess_type(file_path)  # Guess the MIME type of the file

#         try:
#             with open(file_path, 'rb') as file_data:
#                 response = Response(file_data.read(), content_type=content_type or 'application/octet-stream')
#                 response['Content-Disposition'] = f'attachment; filename="{file.encrypted_file.name}"'
#                 return response
#         except Exception as e:
#             return Response({"error": f"Unable to serve the file: {str(e)}"}, status=500)
