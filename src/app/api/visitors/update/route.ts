import { NextRequest, NextResponse } from 'next/server';
import { updateVisitorDuration } from '@/lib/cloudflare-d1';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    const text = await req.text();
    if (text) {
      body = JSON.parse(text);
    }
    const { sessionId, duration } = body;
    if (sessionId && typeof duration === 'number') {
      await updateVisitorDuration(sessionId, duration);
    }
    return NextResponse.json({ code: 200, status: 'success' });
  } catch (error: any) {
    return NextResponse.json(
      { code: 500, status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

