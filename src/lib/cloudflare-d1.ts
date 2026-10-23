import fs from 'fs';
import path from 'path';

export interface ProjectRecord {
  id: string;
  title: string;
  description: string[];
  progress: number;
  status: string;
  startDate: string;
  githubUrl: string;
  demoUrl: string;
  techStack: string[];
  /** Gallery images for the detail view. The first entry doubles as the card cover. */
  screenshots: string[];
  /** Kept in sync with screenshots[0] so existing consumers (admin list, cards) keep working. */
  firstScreenShot: string;
  displayOrder?: number;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisitorRecord {
  id: string;
  sessionId: string;
  ipAddress: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  device: string;
  duration: number;
  landingPage?: string;
  pageViews?: any[];
  rawData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

// Initial seed projects
export const DEFAULT_PROJECTS: ProjectRecord[] = [
  {
    id: 'proj_1',
    title: 'Developer Journal',
    description: ['A modern personal journal and blog platform for developers to share technical knowledge, tutorials, and project logs.'],
    progress: 95,
    status: 'completed',
    startDate: '2024-01-15',
    githubUrl: 'https://github.com/ushanrashmika23',
    demoUrl: 'https://developer-journal.vercel.app/',
    techStack: ['Next.js', 'TypeScript', 'TailwindCSS', 'Node.js'],
    screenshots: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    ],
    firstScreenShot: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: 'proj_2',
    title: 'GNOME Desktop Portfolio',
    description: ['Interactive web-based desktop environment simulating the GNOME Linux desktop with draggable windows, customizable widgets, and terminal.'],
    progress: 100,
    status: 'completed',
    startDate: '2024-03-01',
    githubUrl: 'https://github.com/ushanrashmika23/GNOME-Portfolio',
    demoUrl: 'https://portfolio.ushanrashmika.me',
    techStack: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Radix UI'],
    screenshots: [
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556742049-0a67e557224e?w=600&auto=format&fit=crop&q=80',
    ],
    firstScreenShot: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
    displayOrder: 2,
    isVisible: true,
  },
  {
    id: 'proj_3',
    title: 'Cloudflare Microservices Hub',
    description: ['Scalable serverless API platform deployed on Cloudflare Workers with D1 SQL database and R2 object storage for lightning-fast edge performance.'],
    progress: 90,
    status: 'completed',
    startDate: '2024-05-10',
    githubUrl: 'https://github.com/ushanrashmika23',
    demoUrl: 'https://api.ushanrashmika.me',
    techStack: ['Cloudflare Workers', 'D1 Database', 'R2 Storage', 'TypeScript'],
    screenshots: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556742049-0a67e557224e?w=600&auto=format&fit=crop&q=80',
    ],
    firstScreenShot: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    displayOrder: 3,
    isVisible: true,
  },
  {
    id: 'proj_4',
    title: 'E-Commerce Engine',
    description: ['High-throughput digital marketplace and checkout pipeline with real-time stock sync, payment gateway webhooks, and analytics.'],
    progress: 85,
    status: 'in-progress',
    startDate: '2024-07-20',
    githubUrl: 'https://github.com/ushanrashmika23',
    demoUrl: 'https://store.ushanrashmika.me',
    techStack: ['Next.js', 'PostgreSQL', 'Stripe', 'Prisma', 'TailwindCSS'],
    screenshots: [
      'https://images.unsplash.com/photo-1556742049-0a67e557224e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
    ],
    firstScreenShot: 'https://images.unsplash.com/photo-1556742049-0a67e557224e?w=600&auto=format&fit=crop&q=80',
    displayOrder: 4,
    isVisible: true,
  }
];

// Local JSON fallback store file path
const LOCAL_STORE_PATH = path.join(process.cwd(), '.d1-local-storage.json');

function readLocalStore() {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const data = fs.readFileSync(LOCAL_STORE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local fallback store:', err);
  }
  const initial = {
    projects: DEFAULT_PROJECTS,
    visitors: [] as VisitorRecord[],
    messages: [] as MessageRecord[],
    authCodes: [] as any[],
  };
  try {
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(initial, null, 2));
  } catch (e) {}
  return initial;
}

function writeLocalStore(data: any) {
  try {
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local fallback store:', err);
  }
}

/** Thrown when D1 answers but rejects the statement (e.g. a missing column). */
class D1QueryError extends Error {}

/**
 * Execute a query on Cloudflare D1 REST API.
 * Falls back to local JSON storage if Cloudflare credentials are not provided.
 *
 * Pass `throwOnApiError` when the caller needs to know that D1 rejected the
 * statement instead of silently falling back to the local store.
 */
export async function queryD1(
  sql: string,
  params: any[] = [],
  options: { throwOnApiError?: boolean } = {}
): Promise<any[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql,
          params,
        }),
      });

      const data = await response.json();
      if (data.success && data.result && data.result[0]) {
        return data.result[0].results || [];
      }

      const message =
        (data.errors || [])
          .map((err: any) => err?.message)
          .filter(Boolean)
          .join('; ') || 'D1 rejected the query';

      if (options.throwOnApiError) throw new D1QueryError(message);

      console.warn('Cloudflare D1 query returned error:', data.errors);
    } catch (error) {
      // Connection problems still fall back to the local store; rejected
      // statements are surfaced to callers that asked for them.
      if (error instanceof D1QueryError) throw error;
      console.error('Error connecting to Cloudflare D1:', error);
    }
  }

  // Local fallback simulation
  return executeLocalFallback(sql, params);
}

/**
 * Coerce a stored screenshot value (JSON array, plain string, or array) into a
 * clean list of image URLs, falling back to the legacy single cover column.
 */
function normalizeScreenshots(value: unknown, fallback?: string): string[] {
  let raw: unknown[] = [];

  if (typeof value === 'string') {
    const parsed = safeJsonParse(value, []);
    raw = Array.isArray(parsed) ? parsed : [value];
  } else if (Array.isArray(value)) {
    raw = value;
  }

  const cleaned = raw.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  );

  if (cleaned.length > 0) return cleaned;
  return fallback ? [fallback] : [];
}

function executeLocalFallback(sql: string, params: any[] = []): any[] {
  const store = readLocalStore();
  const trimmed = sql.trim().toUpperCase();

  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM PROJECTS')) {
    return store.projects;
  }

  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM VISITORS')) {
    return store.visitors;
  }

  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM MESSAGES')) {
    return store.messages;
  }

  return [];
}

// Auto-migration to ensure columns exist in D1
let columnsEnsured = false;
export async function ensureProjectColumns(): Promise<void> {
  if (columnsEnsured) return;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !databaseId || !apiToken) return;

  columnsEnsured = true;
  try {
    await queryD1('ALTER TABLE projects ADD COLUMN display_order INTEGER DEFAULT 0');
  } catch {}
  try {
    await queryD1('ALTER TABLE projects ADD COLUMN is_visible INTEGER DEFAULT 1');
  } catch {}
  try {
    await queryD1('ALTER TABLE projects ADD COLUMN screenshots TEXT');
  } catch {}
}

// High-level Project queries
export async function getProjects(): Promise<ProjectRecord[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    ensureProjectColumns().catch(() => {});
    try {
      const results = await queryD1('SELECT * FROM projects');
      if (results && results.length > 0) {
        const mapped = results.map((row) => ({
          id: row.id,
          _id: row.id,
          title: row.title,
          description: typeof row.description === 'string' ? safeJsonParse(row.description, [row.description]) : row.description,
          progress: Number(row.progress) || 100,
          status: row.status || 'completed',
          startDate: row.start_date || '',
          githubUrl: row.github_url || '',
          demoUrl: row.demo_url || '',
          techStack: typeof row.tech_stack === 'string' ? safeJsonParse(row.tech_stack, []) : (row.tech_stack || []),
          screenshots: normalizeScreenshots(row.screenshots, row.first_screenshot || ''),
          firstScreenShot: row.first_screenshot || '',
          displayOrder: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
          isVisible: row.is_visible !== undefined && row.is_visible !== null ? (Number(row.is_visible) === 1 || row.is_visible === true) : true,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })) as ProjectRecord[];

        mapped.sort((a, b) => {
          const orderA = typeof a.displayOrder === 'number' && a.displayOrder > 0 ? a.displayOrder : 999999;
          const orderB = typeof b.displayOrder === 'number' && b.displayOrder > 0 ? b.displayOrder : 999999;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        return mapped;
      }
    } catch (e) {
      console.error('Failed to get projects from D1:', e);
    }
  }

  // Normalise the local fallback the same way as the D1 rows
  const store = readLocalStore();
  const list = (store.projects || []).map((project: any, idx: number) => ({
    ...project,
    screenshots: normalizeScreenshots(project.screenshots, project.firstScreenShot || ''),
    displayOrder: typeof project.displayOrder === 'number' && project.displayOrder > 0 ? project.displayOrder : idx + 1,
    isVisible: project.isVisible !== false,
  }));

  list.sort((a: any, b: any) => {
    const orderA = typeof a.displayOrder === 'number' && a.displayOrder > 0 ? a.displayOrder : 999999;
    const orderB = typeof b.displayOrder === 'number' && b.displayOrder > 0 ? b.displayOrder : 999999;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return list;
}

export async function saveProject(project: Partial<ProjectRecord>): Promise<ProjectRecord> {
  const id = project.id || `proj_${Date.now()}`;
  const now = new Date().toISOString();
  const screenshots = normalizeScreenshots(project.screenshots, project.firstScreenShot);
  const displayOrder = typeof project.displayOrder === 'number' ? project.displayOrder : 0;
  const isVisible = project.isVisible !== false;

  const newProject: ProjectRecord = {
    id,
    title: project.title || 'Untitled Project',
    description: Array.isArray(project.description) ? project.description : [project.description || ''],
    progress: Number(project.progress) || 100,
    status: project.status || 'completed',
    startDate: project.startDate || now.split('T')[0],
    githubUrl: project.githubUrl || '',
    demoUrl: project.demoUrl || '',
    techStack: project.techStack || [],
    screenshots,
    firstScreenShot: screenshots[0] || '',
    displayOrder,
    isVisible,
    createdAt: project.createdAt || now,
    updatedAt: now,
  };

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    await ensureProjectColumns().catch(() => {});

    const values = [
      newProject.id,
      newProject.title,
      JSON.stringify(newProject.description),
      newProject.progress,
      newProject.status,
      newProject.startDate,
      newProject.githubUrl,
      newProject.demoUrl,
      JSON.stringify(newProject.techStack),
      newProject.firstScreenShot,
    ];

    try {
      await queryD1(
        `INSERT INTO projects (id, title, description, progress, status, start_date, github_url, demo_url, tech_stack, first_screenshot, screenshots, display_order, is_visible, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title=excluded.title,
           description=excluded.description,
           progress=excluded.progress,
           status=excluded.status,
           start_date=excluded.start_date,
           github_url=excluded.github_url,
           demo_url=excluded.demo_url,
           tech_stack=excluded.tech_stack,
           first_screenshot=excluded.first_screenshot,
           screenshots=excluded.screenshots,
           display_order=excluded.display_order,
           is_visible=excluded.is_visible,
           updated_at=excluded.updated_at`,
        [...values, JSON.stringify(screenshots), displayOrder, isVisible ? 1 : 0, now],
        { throwOnApiError: true }
      );
    } catch (e) {
      console.warn('D1 rejected project save with all columns, falling back to older schemas:', e);
      try {
        await queryD1(
          `INSERT INTO projects (id, title, description, progress, status, start_date, github_url, demo_url, tech_stack, first_screenshot, screenshots, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             title=excluded.title,
             description=excluded.description,
             progress=excluded.progress,
             status=excluded.status,
             start_date=excluded.start_date,
             github_url=excluded.github_url,
             demo_url=excluded.demo_url,
             tech_stack=excluded.tech_stack,
             first_screenshot=excluded.first_screenshot,
             screenshots=excluded.screenshots,
             updated_at=excluded.updated_at`,
          [...values, JSON.stringify(screenshots), now],
          { throwOnApiError: true }
        );
      } catch (legacyScreenshotsError) {
        try {
          await queryD1(
            `INSERT INTO projects (id, title, description, progress, status, start_date, github_url, demo_url, tech_stack, first_screenshot, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               title=excluded.title,
               description=excluded.description,
               progress=excluded.progress,
               status=excluded.status,
               start_date=excluded.start_date,
               github_url=excluded.github_url,
               demo_url=excluded.demo_url,
               tech_stack=excluded.tech_stack,
               first_screenshot=excluded.first_screenshot,
               updated_at=excluded.updated_at`,
            [...values, now],
            { throwOnApiError: true }
          );
        } catch (legacyError) {
          console.error('Failed to save project to D1:', legacyError);
        }
      }
    }
  }

  // Also update local store
  const store = readLocalStore();
  const existingIdx = store.projects.findIndex((p: any) => p.id === id);
  if (existingIdx >= 0) {
    store.projects[existingIdx] = { ...store.projects[existingIdx], ...newProject };
  } else {
    store.projects.unshift(newProject);
  }
  writeLocalStore(store);

  return newProject;
}

export async function reorderProjects(orders: { id: string; displayOrder: number }[]): Promise<boolean> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    await ensureProjectColumns().catch(() => {});
    for (const item of orders) {
      try {
        await queryD1('UPDATE projects SET display_order = ?, updated_at = ? WHERE id = ?', [
          item.displayOrder,
          new Date().toISOString(),
          item.id,
        ]);
      } catch (e) {
        console.warn('Failed to update display_order in D1 for project', item.id, e);
      }
    }
  }

  const store = readLocalStore();
  orders.forEach(({ id, displayOrder }) => {
    const proj = store.projects.find((p: any) => p.id === id || p._id === id);
    if (proj) {
      proj.displayOrder = displayOrder;
    }
  });
  store.projects.sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  writeLocalStore(store);
  return true;
}

export async function updateProjectVisibility(id: string, isVisible: boolean): Promise<boolean> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    await ensureProjectColumns().catch(() => {});
    try {
      await queryD1('UPDATE projects SET is_visible = ?, updated_at = ? WHERE id = ?', [
        isVisible ? 1 : 0,
        new Date().toISOString(),
        id,
      ]);
    } catch (e) {
      console.warn('Failed to update is_visible in D1 for project', id, e);
    }
  }

  const store = readLocalStore();
  const proj = store.projects.find((p: any) => p.id === id || p._id === id);
  if (proj) {
    proj.isVisible = isVisible;
  }
  writeLocalStore(store);
  return true;
}

export async function deleteProject(id: string): Promise<boolean> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    try {
      await queryD1('DELETE FROM projects WHERE id = ?', [id]);
    } catch (e) {
      console.error('Failed to delete project from D1:', e);
    }
  }

  const store = readLocalStore();
  store.projects = store.projects.filter((p: any) => p.id !== id && (p as any)._id !== id);
  writeLocalStore(store);
  return true;
}

// Visitor Tracking Queries
export async function recordVisitor(data: any) {
  const sessionId = data.sessionId || `sess_${Date.now()}`;
  const now = new Date().toISOString();
  const visitor: VisitorRecord = {
    id: `vis_${Date.now()}`,
    sessionId,
    ipAddress: data.ipAddress || 'Unknown',
    country: data.location?.country || 'Unknown',
    city: data.location?.city || 'Unknown',
    browser: `${data.browser?.name || 'Unknown'} ${data.browser?.version || ''}`.trim(),
    os: `${data.os?.name || 'Unknown'} ${data.os?.version || ''}`.trim(),
    device: `${data.device?.type || 'desktop'} (${data.device?.model || ''})`.trim(),
    duration: 0,
    landingPage: data.landingPage || '/',
    pageViews: data.pageViews || [],
    rawData: data,
    createdAt: now,
    updatedAt: now,
  };

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    try {
      await queryD1(
        `INSERT INTO visitors (id, session_id, ip_address, country, city, browser, os, device, duration, raw_data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(session_id) DO UPDATE SET updated_at = excluded.updated_at`,
        [
          visitor.id,
          visitor.sessionId,
          visitor.ipAddress,
          visitor.country,
          visitor.city,
          visitor.browser,
          visitor.os,
          visitor.device,
          visitor.duration,
          JSON.stringify(data),
          now,
          now,
        ]
      );
    } catch (e) {
      console.error('Failed to insert visitor to D1:', e);
    }
  }

  const store = readLocalStore();
  const existing = store.visitors.find((v: any) => v.sessionId === sessionId);
  if (existing) {
    existing.updatedAt = now;
  } else {
    store.visitors.unshift(visitor);
  }
  writeLocalStore(store);
  return visitor;
}

export async function updateVisitorDuration(sessionId: string, duration: number) {
  const now = new Date().toISOString();
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    try {
      await queryD1('UPDATE visitors SET duration = ?, updated_at = ? WHERE session_id = ?', [duration, now, sessionId]);
    } catch (e) {
      console.error('Failed to update visitor duration in D1:', e);
    }
  }

  const store = readLocalStore();
  const visitor = store.visitors.find((v: any) => v.sessionId === sessionId);
  if (visitor) {
    visitor.duration = duration;
    visitor.updatedAt = now;
    writeLocalStore(store);
  }
}

export async function getVisitors(): Promise<VisitorRecord[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    try {
      const results = await queryD1('SELECT * FROM visitors ORDER BY created_at DESC LIMIT 100');
      if (results && results.length > 0) {
        return results.map((r: any) => ({
          id: r.id,
          sessionId: r.session_id,
          ipAddress: r.ip_address,
          country: r.country,
          city: r.city,
          browser: r.browser,
          os: r.os,
          device: r.device,
          duration: Number(r.duration) || 0,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }
    } catch (e) {
      console.error('Failed to fetch visitors from D1:', e);
    }
  }

  const store = readLocalStore();
  return store.visitors || [];
}

// Contact messages
export async function saveMessage(data: { name: string; email: string; message: string }): Promise<MessageRecord> {
  const now = new Date().toISOString();
  const message: MessageRecord = {
    id: `msg_${Date.now()}`,
    name: data.name,
    email: data.email,
    message: data.message,
    createdAt: now,
  };

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    try {
      await queryD1('INSERT INTO messages (id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?)', [
        message.id,
        message.name,
        message.email,
        message.message,
        now,
      ]);
    } catch (e) {
      console.error('Failed to save message to D1:', e);
    }
  }

  const store = readLocalStore();
  store.messages.unshift(message);
  writeLocalStore(store);
  return message;
}

export async function getMessages(): Promise<MessageRecord[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (accountId && databaseId && apiToken) {
    try {
      const results = await queryD1('SELECT * FROM messages ORDER BY created_at DESC LIMIT 100');
      if (results && results.length > 0) {
        return results.map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          message: m.message,
          createdAt: m.created_at,
        }));
      }
    } catch (e) {
      console.error('Failed to get messages from D1:', e);
    }
  }

  const store = readLocalStore();
  return store.messages || [];
}

function safeJsonParse(val: string, fallback: any) {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

