import uuid
import hashlib

from .models import User, OneTimePassword
from .serializers import (
    UserSerializer, LoginSerializer, GoogleAuthSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    VerifyEmailOTPSerializer
)
from .utils import send_otp, hash_otp

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import AnonRateThrottle


class OTPRateThrottle(AnonRateThrottle):
    rate = '5/min'
    scope = 'otp'


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
    throttle_classes = [OTPRateThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        otp_hash = hash_otp(otp)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'detail': 'Invalid email or OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        verification_otp = OneTimePassword.objects.filter(
            user=user, otp=otp_hash, type='REGISTRATION'
        ).order_by('-created_at').first()

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
    """Search for users by email — requires authentication to prevent enumeration."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.query_params.get('q', None)

        if not search_query or '@' not in search_query:
            return User.objects.none()

        return queryset.filter(email__icontains=search_query)


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
        first_name = serializer.validated_data.get('first_name', '')
        last_name = serializer.validated_data.get('last_name', '')
        picture = serializer.validated_data.get('picture', '')

        user = User.objects.filter(email=email).first()

        if user:
            if not user.is_active:
                user.is_active = True
                user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            # Registration via Google — generate a unique username
            base = email.split('@')[0]
            username = base
            while User.objects.filter(username=username).exists():
                username = f"{base}_{str(uuid.uuid4())[:4]}"

            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_active=True
            )

            if picture:
                import urllib.request
                from django.core.files.base import ContentFile
                try:
                    response = urllib.request.urlopen(picture)
                    user.avatar.save(f"{username}_avatar.jpg", ContentFile(response.read()), save=True)
                except Exception:
                    pass

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)


class PasswordResetRequestAPIView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    throttle_classes = [OTPRateThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email=email).first()
        if user:
            if send_otp(user, type='RESET'):
                pass  # success — intentionally fall through to generic response

        # Always return the same message to prevent email enumeration
        return Response(
            {'detail': 'If an account exists with this email, you will receive an OTP shortly.'},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmAPIView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    throttle_classes = [OTPRateThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        otp_hash = hash_otp(otp)
        new_password = serializer.validated_data['new_password']

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'detail': 'Invalid email or OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        reset_otp = OneTimePassword.objects.filter(
            user=user, otp=otp_hash, type='RESET'
        ).order_by('-created_at').first()

        if not reset_otp:
            return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if not reset_otp.is_valid():
            return Response({'detail': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        OneTimePassword.objects.filter(user=user, type='RESET').delete()

        return Response({'detail': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)