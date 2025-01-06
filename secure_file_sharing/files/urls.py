from django.urls import path
from .views import ListFilesView, UploadFileView, DownloadFileView


urlpatterns = [
    path('upload', UploadFileView.as_view()),
    path('download/<int:file_id>/', DownloadFileView.as_view()), 
    path('list', ListFilesView.as_view()),
]