import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, source, timestamp } = body;

    // Validate required fields
    if (!name || !email) {
      console.error('Pro subscription error: Missing required fields', { name: !!name, email: !!email });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Pro subscription error: Invalid email format', { email });
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get Zapier webhook URL from environment
    const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    
    if (!zapierWebhookUrl) {
      console.error('Pro subscription error: Zapier webhook URL not configured');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    // Log the subscription attempt
    console.log('Pro subscription attempt:', {
      name,
      email,
      source,
      timestamp,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Send to Zapier webhook
    const zapierResponse = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        source: source || 'rSearch Pro Offer Modal',
        timestamp: timestamp || new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }),
    });

    if (!zapierResponse.ok) {
      const errorText = await zapierResponse.text();
      console.error('Pro subscription error: Zapier webhook failed', {
        status: zapierResponse.status,
        statusText: zapierResponse.statusText,
        error: errorText,
        name,
        email
      });

      // Log specific error types
      if (zapierResponse.status === 404) {
        console.error('Pro subscription error: Zapier webhook not found (404)');
      } else if (zapierResponse.status >= 500) {
        console.error('Pro subscription error: Zapier server error (5xx)');
      } else if (zapierResponse.status === 401 || zapierResponse.status === 403) {
        console.error('Pro subscription error: Zapier authentication error (401/403)');
      } else {
        console.error('Pro subscription error: Zapier client error (4xx)');
      }

      return NextResponse.json(
        { error: 'Webhook delivery failed' },
        { status: 502 }
      );
    }

    // Success - log the successful subscription
    console.log('Pro subscription success:', {
      name,
      email,
      zapierStatus: zapierResponse.status,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { success: true, message: 'Subscription successful' },
      { status: 200 }
    );

  } catch (error) {
    // Log unexpected errors
    console.error('Pro subscription error: Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}