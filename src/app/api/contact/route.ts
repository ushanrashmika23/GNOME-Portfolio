import { NextRequest, NextResponse } from 'next/server';
import { saveMessage, getMessages } from '@/lib/cloudflare-d1';
import { sendContactEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ code: 400, message: 'Missing required fields' }, { status: 400 });
    }

    const saved = await saveMessage({ name, email, message });

    // Send email notification to site owner via SMTP
    try {
      await sendContactEmail({ name, email, message });
    } catch (emailErr: any) {
      console.error('Failed to send contact notification email:', emailErr.message || emailErr);
    }

    return NextResponse.json({
      code: 200,
      status: 'success',
      data: saved,
      message: 'Inquiry received and notification sent.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { code: 500, status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messages = await getMessages();
    return NextResponse.json({
      code: 200,
      status: 'success',
      data: messages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { code: 500, status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

