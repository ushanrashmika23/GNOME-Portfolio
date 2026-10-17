import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/cloudflare-r2';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check session
    const token = req.cookies.get('manage_session')?.value;
    if (!token || !verifySessionToken(token).valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToR2(buffer, file.name, file.type);

    return NextResponse.json({
      code: 200,
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { code: 500, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

