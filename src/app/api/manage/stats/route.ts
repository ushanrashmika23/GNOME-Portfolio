import { NextRequest, NextResponse } from 'next/server';
import { getProjects, getVisitors, getMessages } from '@/lib/cloudflare-d1';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('manage_session')?.value;
    if (!token || !verifySessionToken(token).valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [projects, visitors, messages] = await Promise.all([
      getProjects(),
      getVisitors(),
      getMessages(),
    ]);

    const totalVisitors = visitors.length;
    const totalDuration = visitors.reduce((sum, v) => sum + (v.duration || 0), 0);
    const avgDuration = totalVisitors > 0 ? Math.round(totalDuration / totalVisitors) : 0;

    const cfD1Configured = Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_D1_DATABASE_ID &&
      process.env.CLOUDFLARE_API_TOKEN
    );

    const cfR2Configured = Boolean(
      (process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID) &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET_NAME
    );

    return NextResponse.json({
      code: 200,
      status: 'success',
      data: {
        projectsCount: projects.length,
        totalVisitors,
        avgDuration,
        messagesCount: messages.length,
        cfD1Configured,
        cfR2Configured,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ code: 500, error: error.message }, { status: 500 });
  }
}

