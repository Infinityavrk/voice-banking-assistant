import random
import string
import time
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OTPService:
    def __init__(self):
        # In-memory OTP storage: {email: {'otp': '123456', 'expires': timestamp}}
        self.otp_store = {}
        self.otp_expiry_minutes = 5
        
    def generate_otp(self):
        """Generate a random 6-digit OTP."""
        return ''.join(random.choices(string.digits, k=6))
    
    def send_otp(self, email, send_email=True):
        """Generate and send OTP to email."""
        otp = self.generate_otp()
        expires_at = datetime.now() + timedelta(minutes=self.otp_expiry_minutes)
        
        self.otp_store[email] = {
            'otp': otp,
            'expires': expires_at
        }
        
        # Log to console (always)
        logger.info(f"=== OTP for {email} ===")
        logger.info(f"OTP: {otp}")
        logger.info(f"Valid for {self.otp_expiry_minutes} minutes")
        logger.info("=" * 40)
        
        # Try to send email if enabled
        if send_email:
            try:
                import os
                resend_key = os.environ.get('RESEND_API_KEY')
                
                if resend_key:
                    # Use Resend API
                    import resend
                    resend.api_key = resend_key
                    
                    params = {
                        "from": "Voice Banking <onboarding@resend.dev>",
                        "to": [email],  # Must be a list!
                        "subject": "Your Voice Banking OTP",
                        "html": f"""
                        <h2>Voice Banking Security Code</h2>
                        <p>Your one-time password (OTP) is:</p>
                        <h1 style="font-size: 32px; letter-spacing: 8px; color: #4CAF50;">{otp}</h1>
                        <p>This code will expire in {self.otp_expiry_minutes} minutes.</p>
                        <p><small>If you didn't request this code, please ignore this email.</small></p>
                        """
                    }
                    
                    result = resend.Emails.send(params)
                    logger.info(f"✅ Email sent to {email} via Resend (ID: {result.get('id', 'N/A')})")
                else:
                    logger.warning("⚠️  RESEND_API_KEY not set, OTP only logged to console")
                    
            except ImportError:
                logger.warning("⚠️  Resend package not installed. Run: pip install resend")
            except Exception as e:
                logger.error(f"❌ Failed to send email: {e}")
        
        return {'success': True, 'message': f'OTP sent to {email}', 'otp_demo': otp}
    
    def verify_otp(self, email, otp):
        """Verify the OTP for a given email."""
        if email not in self.otp_store:
            return {'success': False, 'message': 'No OTP found for this email'}
        
        stored_data = self.otp_store[email]
        
        # Check if expired
        if datetime.now() > stored_data['expires']:
            del self.otp_store[email]
            return {'success': False, 'message': 'OTP has expired'}
        
        # Check if OTP matches
        if stored_data['otp'] != otp:
            return {'success': False, 'message': 'Invalid OTP'}
        
        # OTP is valid, remove it (one-time use)
        del self.otp_store[email]
        return {'success': True, 'message': 'OTP verified successfully'}
    
    def cleanup_expired(self):
        """Remove expired OTPs from store."""
        now = datetime.now()
        expired_emails = [email for email, data in self.otp_store.items() if now > data['expires']]
        for email in expired_emails:
            del self.otp_store[email]
