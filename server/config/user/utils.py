from django.core.mail import send_mail
from .models import OneTimePassword
import secrets
import hashlib


def hash_otp(otp: str) -> str:
    """Return a SHA-256 hex digest of the given OTP string."""
    return hashlib.sha256(otp.encode()).hexdigest()


def send_otp(user, type='RESET'):
    # Generate a cryptographically secure 6-digit OTP
    otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    otp_hash = hash_otp(otp)

    # Invalidate any previously issued OTPs of the same type for this user
    OneTimePassword.objects.filter(user=user, type=type).delete()
    OneTimePassword.objects.create(user=user, otp=otp_hash, type=type)

    subject = 'Password Reset OTP' if type == 'RESET' else 'Account Verification OTP'
    body = f'Your One-Time Password (OTP) is: {otp}\nThis code is valid for 10 minutes.'

    try:
        send_mail(
            subject,
            body,
            'noreply@taskflow.com',
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email sending error: {str(e)}")
        return False
