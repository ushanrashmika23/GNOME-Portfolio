import { NextRequest, NextResponse } from 'next/server';
import {
  getProjects,
  saveProject,
  deleteProject,
  reorderProjects,
  updateProjectVisibility,
} from '@/lib/cloudflare-d1';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get('all') === 'true';
    const projects = await getProjects();

    const data = includeAll ? projects : projects.filter((p) => p.isVisible !== false);

    return NextResponse.json({
      code: 200,
      status: 'success',
      data,
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { code: 500, status: 'error', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Reorder projects batch action
    if (body.action === 'reorder' && Array.isArray(body.orders)) {
      await reorderProjects(body.orders);
      return NextResponse.json({
        code: 200,
        status: 'success',
        message: 'Projects reordered successfully',
      });
    }

    // Toggle visibility action
    if (body.action === 'toggle-visibility' && body.id !== undefined) {
      await updateProjectVisibility(body.id, Boolean(body.isVisible));
      return NextResponse.json({
        code: 200,
        status: 'success',
        message: 'Project visibility updated',
      });
    }

    const saved = await saveProject(body);
    return NextResponse.json({
      code: 200,
      status: 'success',
      data: saved,
    });
  } catch (error: any) {
    console.error('Error saving project:', error);
    return NextResponse.json(
      { code: 500, status: 'error', message: error.message || 'Failed to save project' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ code: 400, message: 'Missing project ID' }, { status: 400 });
    }
    await deleteProject(id);
    return NextResponse.json({ code: 200, status: 'success', message: 'Project deleted' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { code: 500, status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

