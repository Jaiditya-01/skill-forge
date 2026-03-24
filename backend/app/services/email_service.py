import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings


def send_reminder_email(to_email: str, user_name: str):
    """Send a motivational tech-themed reminder email."""
    settings = get_settings()

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EMAIL SKIP] SMTP not configured. Would send to {to_email}")
        return

    subject = "🚀 SkillForge — Your Code Misses You!"

    body = f"""Hey {user_name}! 👋

It's been a few days since you last coded on SkillForge. Your streak is at risk!

Remember:
  🔥 Every line of code is a step toward mastery
  💡 Even 15 minutes of practice compounds over time
  🏆 Your peers are leveling up — don't fall behind!

Quick ideas to get back on track:
  • Solve 1 easy problem on LeetCode
  • Push a small commit to GitHub
  • Complete a task on your SkillForge dashboard

"The best time to start was yesterday. The second best time is now."

Keep forging your skills! ⚒️
— The SkillForge Team
"""

    msg = MIMEMultipart()
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        print(f"[EMAIL SENT] Reminder sent to {to_email}")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {e}")
