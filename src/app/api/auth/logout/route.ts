import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set({
    name: 'manage_session',
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}

