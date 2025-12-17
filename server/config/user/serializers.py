from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from django.contrib.auth import authenticate
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'display_name', 'password', 'avatar', 'is_active', 'is_superuser', 'is_staff']

    def get_display_name(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.username

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk if user else None).filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        return User.objects.create_user(email=email, password=password, **validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")

        user = authenticate(username=email, password=password)
        if user is None:
            user = authenticate(email=email, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid credentials.")

        data['user'] = user
        return data

    def to_representation(self, instance):
        user = instance.get('user')
        refresh = RefreshToken.for_user(user)

        return {
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'display_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'avatar': user.avatar.url if user.avatar else None,
                'is_active': user.is_active,
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()
    print(f"GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")

    def validate(self, attrs):
        try:
            idinfo = id_token.verify_oauth2_token(
                attrs['token'],
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
        except Exception:
            raise serializers.ValidationError("Invalid Google token")

        email = idinfo['email']
        name = idinfo.get('name', '')

        user, _ = User.objects.get_or_create(
            email=email,
            defaults={"username": email.split('@')[0], "first_name": name}
        )

        attrs['user'] = user
        return attrs