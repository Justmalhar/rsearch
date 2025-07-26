# rSearch Pro Offer Modal Setup

This document explains how to set up the Zapier webhook for the rSearch Pro offer modal.

## Overview

The Pro offer modal is a popup that appears when users first visit rSearch, offering them 3 months of free Pro access. Users can enter their name and email, which gets sent to a Zapier webhook for processing.

## Features

- **Automatic Display**: Shows 2 seconds after page load for new users
- **Local Storage Management**: Remembers if user has subscribed or dismissed the offer
- **Form Validation**: Validates name and email before submission
- **Zapier Integration**: Sends user data to Zapier webhook
- **Toast Notifications**: Shows success/error messages
- **Responsive Design**: Works on mobile and desktop
- **rSearch Branding**: Uses orange/red gradient theme matching the app

## Setup Instructions

### 1. Create Zapier Webhook

1. Go to [Zapier.com](https://zapier.com) and create a new Zap
2. Choose "Webhooks by Zapier" as the trigger
3. Select "Catch Hook" as the event
4. Copy the webhook URL provided by Zapier

### 2. Configure Environment Variable

1. Create or edit the `.env.local` file in your project root
2. Add your Zapier webhook URL:

```env
NEXT_PUBLIC_ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-zapier-webhook-url-here
```

3. Replace `your-zapier-webhook-url-here` with your actual Zapier webhook URL

### 3. Configure Zapier Actions

In your Zapier workflow, you can add actions to:

- **Send Welcome Email**: Send a welcome email to new Pro subscribers
- **Add to CRM**: Add leads to your CRM system (e.g., HubSpot, Salesforce)
- **Add to Email List**: Subscribe users to your newsletter
- **Create Spreadsheet Entry**: Log new subscribers in Google Sheets
- **Send Slack Notification**: Get notified of new Pro signups

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Clear your browser's localStorage for rSearch
3. Visit the site and wait 2 seconds for the modal to appear
4. Fill out the form and submit
5. Check your Zapier dashboard to see if the webhook was triggered

## Data Structure

The webhook sends the following JSON data:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "source": "rSearch Pro Offer Modal",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Local Storage Keys

The modal uses these localStorage keys:

- `rSearch_pro_subscriber`: Set to "true" when user successfully subscribes
- The modal will show again on subsequent visits if the user hasn't subscribed (clicking "Maybe later" only dismisses temporarily)

## Customization

### Styling

The modal uses Tailwind CSS classes and can be customized by modifying the `ProOfferModal` component in `components/ui/pro-offer-modal.tsx`.

### Features List

You can modify the features list by editing the `features` array in the component:

```typescript
const features = [
  "Unlimited search queries",
  "Unlimited image generation", 
  "Unlimited deep research queries",
  "Priority support",
  "Advanced AI models",
  "No rate limits"
];
```

### Timing

To change when the modal appears, modify the timeout in `app/page.tsx`:

```typescript
const timer = setTimeout(() => {
  setShowProModal(true);
}, 2000); // Change this value (in milliseconds)
```

## Troubleshooting

### Modal Not Appearing

1. Check if localStorage has `rSearch_pro_subscriber` set to "true"
2. Clear localStorage and refresh the page
3. Check browser console for any errors

### Webhook Not Working

1. Verify the `NEXT_PUBLIC_ZAPIER_WEBHOOK_URL` environment variable is set correctly
2. Check that the Zapier webhook is active and properly configured
3. Look for network errors in the browser's developer tools
4. Verify the webhook URL is accessible and returns a 200 status code

### Build Errors

1. Run `npm run build` to check for TypeScript/ESLint errors
2. Make sure all dependencies are installed: `npm install`
3. Check that the modal component is properly imported in `app/page.tsx`

## Security Considerations

- The webhook URL is exposed in the client-side code (NEXT_PUBLIC_ prefix)
- Consider implementing rate limiting on your Zapier webhook
- Validate email addresses on the server side as well
- Consider adding CAPTCHA for additional spam protection

## Future Enhancements

- Add analytics tracking for modal interactions
- Implement A/B testing for different offer variations
- Add more sophisticated form validation
- Integrate with payment processing for paid upgrades
- Add social sharing options