# Simple Gmail email setup

The app now sends through **Gmail SMTP**, with no email OAuth redirects or refresh tokens.

1. Enable Google **2-Step Verification**, then create an [App Password](https://myaccount.google.com/apppasswords).
2. Put that App Password in the ignored `.env.local`:

   ```env
   SMTP_EMAIL=your-sender@gmail.com
   SMTP_APP_PASSWORD=your-16-character-app-password
   ```

3. Restart the app, then click **Resend verification code**. New signup, ticket and employee emails are processed automatically after the request.

Run `npm run email:check` to confirm settings. Do not paste the App Password into chat. No Google Cloud changes are needed for email delivery. Optional `npm run email:watch` also processes retries and delayed chat reminders during development. Production needs the authenticated scheduler described in [email setup](email-setup.md).
