from .models import User, OneTimePassword
from .serializers import (
    UserSerializer, LoginSerializer, GoogleAuthSerializer, 
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer, 
    VerifyEmailOTPSerializer
)
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
import random
from .utils import send_otp

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(is_active=False)
        
        if send_otp(user, type='REGISTRATION'):
            return Response({'detail': 'OTP sent to email. Please verify.'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'detail': 'User created but failed to send OTP.'}, status=status.HTTP_201_CREATED)


class VerifyEmailOTPAPIView(generics.GenericAPIView):
    serializer_class = VerifyEmailOTPSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'detail': 'Invalid email or OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            
        verification_otp = OneTimePassword.objects.filter(user=user, otp=otp, type='REGISTRATION').order_by('-created_at').first()
        
        if not verification_otp:
            return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not verification_otp.is_valid():
            return Response({'detail': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.is_active = True
        user.save()
        
        OneTimePassword.objects.filter(user=user, type='REGISTRATION').delete()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'detail': 'Account verified successfully.',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class LoginAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = User.objects.filter(email=email).first()
        if user and user.check_password(password) and not user.is_active:
             send_otp(user, type='REGISTRATION')
             return Response({'action': 'OTP_REQUIRED', 'email': email}, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SearchUsersAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.query_params.get('q', None)
        
        if not search_query or '@' not in search_query:
            return User.objects.none()
        
        queryset = queryset.filter(email__icontains=search_query)
        return queryset


class CurrentUserAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class GoogleAuthAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = GoogleAuthSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        name = serializer.validated_data['name']
        
        user = User.objects.filter(email=email).first()
        
        if user:
            # Login existing user
            if not user.is_active:
                # If inactive, assume they need verification (or were banned, but let's assume verification for this flow)
                # Ideally check if they are banned vs awaiting verification, but for simplicity here:
                send_otp(user, type='REGISTRATION')
                return Response({'action': 'OTP_REQUIRED', 'email': email}, status=status.HTTP_200_OK)

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            # Registration
            username = email.split('@')[0]
            # Handle username uniqueness if needed, but keeping it simple or relying on model/serializer logic if we used it
            # But here we create manually
            import uuid
            while User.objects.filter(username=username).exists():
                 username = f"{email.split('@')[0]}_{str(uuid.uuid4())[:4]}"

            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=name,
                is_active=False
            )
            
            send_otp(user, type='REGISTRATION')
            return Response({'action': 'OTP_REQUIRED', 'email': email}, status=status.HTTP_201_CREATED)


class PasswordResetRequestAPIView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        user = User.objects.filter(email=email).first()
        if user:
            if send_otp(user, type='RESET'):
                 return Response({'detail': 'OTP sent to your email.'}, status=status.HTTP_200_OK)
            else:
                 return Response({'detail': 'Failed to send OTP.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'If an account exists with this email, you will receive an OTP shortly.'}, status=status.HTTP_200_OK)


class PasswordResetConfirmAPIView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'detail': 'Invalid email or OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        reset_otp = OneTimePassword.objects.filter(user=user, otp=otp, type='RESET').order_by('-created_at').first()
        
        if not reset_otp:
            return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not reset_otp.is_valid():
             return Response({'detail': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        
        OneTimePassword.objects.filter(user=user, type='RESET').delete()
        
        return Response({'detail': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)