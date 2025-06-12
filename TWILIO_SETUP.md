# Twilio SMS Setup Guide

## Step 1: Create Twilio Account
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

## Step 2: Get Your Credentials
1. Go to [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Copy these values

## Step 3: Get a Phone Number
1. In Twilio Console, go to **Phone Numbers** > **Manage** > **Buy a number**
2. Choose a number that supports SMS
3. Purchase the number (free trial includes credits)

## Step 4: Configure Environment Variables
Create a `.env.local` file in your project root:

\`\`\`env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
\`\`\`

## Step 5: Verify International SMS
1. Check if your Twilio account can send SMS to Sri Lanka (+94)
2. You may need to:
   - Verify your account (provide ID)
   - Add credits to your account
   - Enable international SMS in settings

## Step 6: Test the Setup
1. Start your Next.js application
2. Try sending an OTP to a Sri Lankan number
3. Check Twilio Console logs for delivery status

## Troubleshooting

### Common Issues:
1. **"Authentication failed"** - Check your Account SID and Auth Token
2. **"Invalid phone number"** - Ensure the number format is correct (+94XXXXXXXXX)
3. **"Cannot send to this number"** - Verify the number is a valid mobile number
4. **"Insufficient funds"** - Add credits to your Twilio account

### Development Mode:
If Twilio is not configured, the app will show the OTP code in the response for testing purposes.
