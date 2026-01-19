import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import os

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

def send_otp_email(target_email: str, otp: str):
    print(f"📧 Attempting to send OTP to {target_email} via SMTP...")
    
    if not SMTP_USER or not SMTP_PASS:
        print("❌ SMTP credentials missing in .env")
        return

    try:
        # Create message
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = target_email
        msg["Subject"] = "SamvidhanAI - Your Verification Code"
        
        body = f"Your OTP code is: {otp}. It expires in 3 minutes."
        msg.attach(MIMEText(body, "plain"))

        # Connect and send
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ OTP sent successfully to {target_email}")
    except Exception as e:
        print(f"❌ SMTP ERROR: {e}")

def generate_otp():
    return str(random.randint(100000, 999999))
