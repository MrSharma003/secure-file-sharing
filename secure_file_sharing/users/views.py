from django.contrib.auth import get_user_model
User = get_user_model()
from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .utils import generate_mfa_code, send_mfa_email
from django.contrib.auth import authenticate
from .models import OTPModel
from rest_framework_simplejwt.tokens import RefreshToken

import logging

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        try:
            data = request.data

            name = data['name']
            email = data['email']
            email = email.lower()
            password = data['password']
            re_password = data['re_password']
            is_author = data['is_author']

            if is_author == 'True':
                is_author = True
            else:
                is_author = False

            if password == re_password:
                if len(password) >= 8:
                    if not User.objects.filter(email=email).exists():
                        if not is_author:
                            User.objects.create_user(name=name, email=email, password=password)

                            return Response(
                                {'success': 'User created successfully'},
                                status=status.HTTP_201_CREATED
                            )
                        else:
                            User.objects.create_author(name=name, email=email, password=password)

                            return Response(
                                {'success': 'Author account created successfully'},
                                status=status.HTTP_201_CREATED
                            )
                    else:
                        return Response(
                            {'error': 'User with this email already exists'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    return Response(
                        {'error': 'Password must be at least 8 characters in length'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                return Response(
                    {'error': 'Passwords do not match'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Error during registration: {str(e)}")
            return Response(
                {'error': f'Something went wrong when registering an account {e}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class InitialLogin(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')

            # check user
            try:
                user = authenticate(request, username=email, password=password)
            except Exception as e:
                return Response({
                    'error': f'user not found: {str(e)}'
                })

            if user is not None:
                try:
                    otp_instance, _ = OTPModel.objects.get_or_create(user=user)
                except Exception as e:
                    return Response(
                        {'error': f'some error {str(e)}'}
                    )

                otp_instance.generate_otp()
                
                send_mfa_email(user, otp_instance.otp)

                # Return success response
                return Response(
                    {'message': 'OTP has been sent to your email.'},
                    status=status.HTTP_200_OK
                )
                
        except Exception as e:
            return Response(
                {'error': f'Credentials are not valid: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

class OTPVerificationView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        try:
            print("inside otp verification")
            otp = request.data.get("otp")
            email = request.data.get("email")

            if otp is not None:
                user = User.objects.get(email = email)
                otp_instance = OTPModel.objects.get(user = user, otp = otp)

                if otp_instance.validate_otp():
                    refresh = RefreshToken.for_user(user)
                    otp_instance.delete()
                    return Response({
                        'access_token': str(refresh.access_token),
                        'refresh': str(refresh)
                    },status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_401_UNAUTHORIZED)

        except Exception as e:
            return Response(
                {"error" : f"Something went wrong {e}"},
                status=status.HTTP_404_NOT_FOUND
            )

class RetrieveUserView(APIView):
    def get(self, request, format=None):
        try:
            user = request.user
            user = UserSerializer(user)

            return Response(
                {'user': user.data},
                status=status.HTTP_200_OK
            )
        except:
            return Response(
                {'error': 'Something went wrong when retrieving user details'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        