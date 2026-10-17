import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpCode, createSessionToken, ADMIN_EMAIL } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawCode = body.code !== undefined ? String(body.code).trim() : '';
    const targetEmail = (body.email || ADMIN_EMAIL).trim().toLowerCase();

    console.log(`[API VERIFY] Verifying code request for ${targetEmail}`);

    if (!rawCode || rawCode.length !== 6) {
      return NextResponse.json(
        { code: 400, success: false, message: 'Please enter the 6-digit verification code.' },
        { status: 400 }
      );
    }

    const isValid = verifyOtpCode(targetEmail, rawCode);
    if (!isValid) {
      return NextResponse.json(
        { code: 401, success: false, message: 'Invalid or expired code. Please check your code or request a new one.' },
        { status: 401 }
      );
    }

    const sessionToken = createSessionToken(targetEmail);
    const response = NextResponse.json({
      code: 200,
      success: true,
      message: 'Authentication successful',
      email: targetEmail,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'manage_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Error verifying OTP in route handler:', error);
    return NextResponse.json(
      { code: 500, success: false, message: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
