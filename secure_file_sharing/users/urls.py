from django.urls import path
from .views import RegisterView, RetrieveUserView, InitialLogin, OTPVerificationView


urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', InitialLogin.as_view()),
    path('api/verify_otp', OTPVerificationView.as_view()),
    
    # get request
    path('me', RetrieveUserView.as_view()), 
    
]