from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist

from .models import File
from .utils import encrypt_file, decrypt_file


class UploadFileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Upload a file and encrypt it at rest.
        """
        try:
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response(
                    {"error": "No file was provided."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            file_data = uploaded_file.read()
            encrypted_data = encrypt_file(file_data)  # Now passing bytes data

            print("after encryption")

            file_instance = File.objects.create(
                title=uploaded_file.name,
                owner=request.user
            )
            # Save the encrypted data as a file in ContentFile
            file_instance.encrypted_file.save(
                uploaded_file.name, ContentFile(encrypted_data)
            )

            return Response(
                {"message": "File uploaded successfully", "file_id": file_instance.id},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred while uploading the file: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class DownloadFileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        
        try:
            print("Inside download idiot")
            # Fetch the file, ensuring it belongs to the requesting user
            file = File.objects.get(id=file_id, owner=request.user)
        except ObjectDoesNotExist:
            return Response(
                {"error": "File not found or you do not have permission to access it."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred while fetching the file: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        with open(file.encrypted_file.path, 'rb') as f:
                encrypted_data = f.read()
            
            # Returning the content in hexadecimal format
        return Response(
            {"file_content": encrypted_data},
            status=status.HTTP_200_OK
        )


class ListFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve a list of files uploaded by the authenticated user.
        """
        try:
            # Fetch files uploaded by the authenticated user
            files = File.objects.filter(owner=request.user)

            # Prepare the response data
            files_data = [
                {
                    "file_id": file.id,
                    "title": file.title,
                    "uploaded_at": file.uploaded_at,
                }
                for file in files
            ]

            return Response(
                {"files": files_data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred while retrieving the files: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
