import aiosmtplib
from email.message import EmailMessage
import random
import os
from datetime import datetime, timedelta

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USER") # user@gmail.com
SMTP_PASS = os.getenv("SMTP_PASS") # APP PASSWORD

async def send_otp_email(target_email: str, otp: str):
    message = EmailMessage()
    message["From"] = SMTP_USER
    message["To"] = target_email
    message["Subject"] = "SamvidhanAI - Your Verification Code"
    message.set_content(f"Your OTP code is: {otp}. It expires in 5 minutes.")

    await aiosmtplib.send(
        message,
        hostname=SMTP_SERVER,
        port=SMTP_PORT,
        username=SMTP_USER,
        password=SMTP_PASS,
        start_tls=True
    )

def generate_otp():
    return str(random.randint(100000, 999999))
