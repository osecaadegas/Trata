# Email Automation System

## Overview

The Trata real estate platform includes a comprehensive email automation system with:

1. **Inquiry System** - Property contact forms with automatic confirmation emails
2. **Property Alerts** - Smart notifications when new listings match user preferences  
3. **GDPR Compliance** - Full consent tracking and unsubscribe functionality

## Architecture

```
Frontend (React)          →    Vercel API Functions    →    Email Providers
├── InquiryForm.jsx            ├── /api/inquiry.js          ├── Resend (transactional)
├── PropertyAlertSubscription  ├── /api/subscribe-alerts    └── Brevo (marketing/bulk)
└── UnsubscribePage.jsx        ├── /api/unsubscribe
                               └── /api/send-property-alerts
```

## Setup Instructions

### 1. Database Setup

Run the SQL migration in Supabase SQL Editor:

```sql
-- Run this file:
supabase/migrations/008_email_automation_system.sql
```

This creates:
- `property_alert_preferences` - User alert subscriptions
- `inquiries` - Contact form submissions
- `email_logs` - Email tracking and debugging
- `rate_limits` - Rate limiting for forms

### 2. Resend Setup (Transactional Emails)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (Settings → Domains)
3. Create an API key (Settings → API Keys)
4. Add to Vercel environment variables:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxx
   FROM_EMAIL=noreply@yourdomain.com
   ```

### 3. Brevo Setup (Marketing Emails)

1. Sign up at [brevo.com](https://www.brevo.com)
2. Go to Settings → SMTP & API → API Keys
3. Create a new API key
4. Create a contact list for alert subscribers
5. Add to Vercel environment variables:
   ```
   BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxx
   BREVO_ALERTS_LIST_ID=1
   ```

### 4. Vercel Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `RESEND_API_KEY` | Resend API key | Yes |
| `BREVO_API_KEY` | Brevo API key | Yes |
| `BREVO_ALERTS_LIST_ID` | Brevo list ID for alerts | No |
| `ADMIN_EMAIL` | Admin notification email | Yes |
| `FROM_EMAIL` | Sender email address | Yes |
| `FROM_NAME` | Sender name | Yes |
| `SITE_URL` | Your website URL | Yes |
| `WEBHOOK_SECRET` | Secret for API webhooks | Yes |

### 5. Domain Verification

For production, verify your sending domain:

**Resend:**
1. Go to Settings → Domains → Add Domain
2. Add the DNS records shown
3. Wait for verification

**Brevo:**
1. Go to Settings → Senders & IPs → Domains
2. Add your domain
3. Add the DNS records shown

## Usage

### Inquiry Form

```jsx
import InquiryForm from '@/components/InquiryForm';

// In your property detail page:
<InquiryForm
  property={propertyData}
  isOpen={showInquiryForm}
  onClose={() => setShowInquiryForm(false)}
/>
```

### Property Alert Subscription

```jsx
import PropertyAlertSubscription, { PropertyAlertBanner } from '@/components/PropertyAlertSubscription';

// Modal version:
<PropertyAlertSubscription
  isOpen={showAlertModal}
  onClose={() => setShowAlertModal(false)}
/>

// Banner version (for embedding in pages):
<PropertyAlertBanner className="mt-8" />
```

### Unsubscribe Page

Add to your React Router:

```jsx
import UnsubscribePage from '@/components/UnsubscribePage';

// In your routes:
<Route path="/unsubscribe" element={<UnsubscribePage />} />
```

## API Endpoints

### POST /api/inquiry

Submit a property inquiry.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "+351912345678",
  "message": "Gostaria de agendar uma visita",
  "propertyId": "uuid",
  "propertyTitle": "Apartamento T2 Centro",
  "inquiryType": "visit",
  "preferredContact": "phone",
  "preferredTime": "afternoon",
  "marketingConsent": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pedido enviado com sucesso!",
  "inquiryId": "uuid"
}
```

### POST /api/subscribe-alerts

Subscribe to property alerts.

**Request:**
```json
{
  "email": "joao@email.com",
  "name": "João Silva",
  "locations": ["Braga, Centro", "Braga, Gualtar"],
  "propertyTypes": ["apartment", "house"],
  "minPrice": 100000,
  "maxPrice": 300000,
  "frequency": "instant",
  "marketingConsent": true
}
```

### GET /api/unsubscribe?token=xxx

Unsubscribe from emails. Returns an HTML page.

### POST /api/send-property-alerts

Trigger property alerts (called by webhook/cron).

**Request:**
```json
{
  "propertyId": "uuid"
}
```

Or to process all pending alerts:
```json
{
  "processPending": true
}
```

## Automatic Property Alerts

When a new property is added with status "available", a database trigger:

1. Creates a pending email log entry
2. A scheduled job (or webhook) calls `/api/send-property-alerts`
3. The API finds matching subscriptions and sends alerts

### Setting up Automatic Alerts

**Option 1: Supabase Edge Function + Cron**

Create a Supabase Edge Function that calls the send-property-alerts endpoint on a schedule.

**Option 2: Vercel Cron**

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/send-property-alerts",
    "schedule": "*/15 * * * *"
  }]
}
```

**Option 3: Supabase Webhook**

Use Supabase's webhook feature to call the endpoint when a property is inserted.

## GDPR Compliance

The system tracks:

- `marketing_consent` - Whether user consented to marketing
- `consent_timestamp` - When consent was given
- `consent_ip` - IP address at consent time
- `consent_text_version` - Version of consent text shown

Every marketing email includes an unsubscribe link that:
1. Uses a secure UUID token
2. Immediately revokes consent
3. Removes contact from Brevo lists
4. Shows a confirmation page

## Rate Limiting

Built-in rate limiting protects against abuse:

- **Inquiries**: 5 per hour per email/IP
- **Alert subscriptions**: 3 per hour per email

## Email Templates

Templates are in `/api/_templates/`:

- `inquiry.js` - Inquiry confirmation and admin notification
- `alerts.js` - Alert subscription confirmation and property alerts

Templates use inline CSS for email client compatibility.

## Troubleshooting

### Emails not sending

1. Check Vercel function logs
2. Verify API keys are correct
3. Check domain verification status
4. Review `email_logs` table for errors

### Rate limit errors

Check `rate_limits` table and clear if needed:
```sql
DELETE FROM rate_limits WHERE identifier = 'user@email.com';
```

### Alerts not matching

Check the `find_matching_alert_subscriptions` function:
```sql
SELECT * FROM find_matching_alert_subscriptions('property-uuid');
```
