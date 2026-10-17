import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('manage_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const { email, valid } = verifySessionToken(token);
  if (!valid) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, email });
}

