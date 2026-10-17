import { NextRequest, NextResponse } from 'next/server';
import { recordVisitor, getVisitors } from '@/lib/cloudflare-d1';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const visitor = await recordVisitor(data);
    return NextResponse.json({
      code: 200,
      status: 'success',
      data: visitor,
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
    const visitors = await getVisitors();
    return NextResponse.json({
      code: 200,
      status: 'success',
      data: visitors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { code: 500, status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

