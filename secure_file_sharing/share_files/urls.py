from django.urls import path
from .views import ShareFileView, GenerateShareableLinkView, SecureDownloadView

urlpatterns = [
    path('file/<int:file_id>/', ShareFileView.as_view()),
    path('generate_secure_link/<int:file_id>/', GenerateShareableLinkView.as_view()), 
    path('secure-download/<int:file_id>/', SecureDownloadView.as_view(), name='secure-file-download'),
    
]
