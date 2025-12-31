from django.core.mail import send_mail
from .models import OneTimePassword
import random

def send_otp(user, type='RESET'):
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    OneTimePassword.objects.create(user=user, otp=otp, type=type)
    
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
