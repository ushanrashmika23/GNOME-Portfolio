import { NextRequest, NextResponse } from 'next/server';
import { generateOtpCode, ADMIN_EMAIL } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';

// Prevent rapid duplicate sends on the server (debouncing within 8 seconds)
declare global {
  var __LAST_OTP_SENT_TIME: number | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || ADMIN_EMAIL).trim().toLowerCase();

    // Verify requested email is the authorized admin email
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { code: 403, success: false, message: 'Unauthorized email address. Only the site owner can request access.' },
        { status: 403 }
      );
    }

    const now = Date.now();
    if (globalThis.__LAST_OTP_SENT_TIME && now - globalThis.__LAST_OTP_SENT_TIME < 8000) {
      console.log(`[AUTH] Duplicate send-code request suppressed (${now - globalThis.__LAST_OTP_SENT_TIME}ms since previous send)`);
      return NextResponse.json({
        code: 200,
        success: true,
        message: `Verification code already dispatched to ${email}. Please check your inbox.`,
      });
    }
    globalThis.__LAST_OTP_SENT_TIME = now;

    const code = generateOtpCode(email);
    const emailResult = await sendOtpEmail({ to: email, code });

    if (!emailResult.success) {
      return NextResponse.json(
        { code: 500, success: false, message: emailResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: 200,
      success: true,
      message: emailResult.message,
    });
  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json(
      { code: 500, success: false, message: error.message || 'Failed to send one-time code' },
      { status: 500 }
    );
  }
}

