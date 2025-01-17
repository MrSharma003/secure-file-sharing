from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('admin', admin.site.urls),

    path('api/token', TokenObtainPairView.as_view()),
    path('api/token/refresh', TokenRefreshView.as_view()),
    path('api/token/verify', TokenVerifyView.as_view()),
    path('auth/users/', include('users.urls')),
    path('auth/files/', include('files.urls')),
    path('auth/share_files/', include('share_files.urls')),
]