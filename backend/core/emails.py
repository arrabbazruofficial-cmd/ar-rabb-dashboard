import logging
from django.core.mail import send_mail
from django.conf import settings
from typing import List

logger = logging.getLogger(__name__)

def send_notification_email(subject: str, message: str, recipient_list: List[str]):
    if not settings.EMAIL_HOST_PASSWORD:
        logger.warning('EMAIL_HOST_PASSWORD not set. Email not sent.')
        return False
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=False)
        return True
    except Exception as e:
        logger.error(f'Failed to send email: {e}')
        return False

def send_otp_email(email: str, code: str):
    subject = "Verify your Al-Rabb Tours Account"
    message = f"Your verification code is: {code}\n\nThis code will expire in 15 minutes."
    send_notification_email(subject, message, [email])

def notify_user_status_change(email: str, request_id: str, new_status: str):
    subject = f"Update on your Request #{request_id}"
    message = f"The status of your request has been updated to: {new_status}."
    send_notification_email(subject, message, [email])

def notify_admins_new_request(request_type: str, request_id: str):
    subject = f"New {request_type} Request Submitted"
    message = f"A new {request_type} request (#{request_id}) has been submitted and requires review."
    # For now, we'll email a default admin email or find super admins.
    from django.contrib.auth import get_user_model
    User = get_user_model()
    admin_emails = list(User.objects.filter(role__in=['SUPER_ADMIN', 'ADMIN']).values_list('email', flat=True))
    if admin_emails:
        send_notification_email(subject, message, admin_emails)

def notify_admins_new_user(email: str, role: str):
    subject = f"New {role} Registration"
    message = f"A new {role} ({email}) has registered on the platform."
    from django.contrib.auth import get_user_model
    User = get_user_model()
    admin_emails = list(User.objects.filter(role__in=['SUPER_ADMIN', 'ADMIN']).values_list('email', flat=True))
    if admin_emails:
        send_notification_email(subject, message, admin_emails)
