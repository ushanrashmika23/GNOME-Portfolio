-- ===================================================
-- Cloudflare D1 Database Schema for GNOME Portfolio
-- Run: npx wrangler d1 execute <database-name> --file=schema.sql
-- ===================================================

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL, -- JSON string array
  progress INTEGER DEFAULT 100,
  status TEXT DEFAULT 'completed',
  start_date TEXT,
  github_url TEXT,
  demo_url TEXT,
  tech_stack TEXT, -- JSON string array
  first_screenshot TEXT, -- cover image, kept in sync with screenshots[0]
  screenshots TEXT, -- JSON string array of gallery images
  display_order INTEGER DEFAULT 0,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Visitors Analytics Table
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  duration INTEGER DEFAULT 0,
  raw_data TEXT, -- Full tracking JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contact Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Auth Codes (OTP) Table
CREATE TABLE IF NOT EXISTS auth_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Projects
INSERT OR IGNORE INTO projects (id, title, description, progress, status, start_date, github_url, demo_url, tech_stack, first_screenshot, screenshots)
VALUES
  (
    'proj_1',
    'Developer Journal',
    '["A modern personal journal and blog platform for developers to share technical knowledge, tutorials, and project logs."]',
    95,
    'completed',
    '2024-01-15',
    'https://github.com/ushanrashmika23',
    'https://developer-journal.vercel.app/',
    '["Next.js", "TypeScript", "TailwindCSS", "Node.js"]',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80"]'
  ),
  (
    'proj_2',
    'GNOME Desktop Portfolio',
    '["Interactive web-based desktop environment simulating the GNOME Linux desktop with draggable windows, customizable widgets, and terminal."]',
    100,
    'completed',
    '2024-03-01',
    'https://github.com/ushanrashmika23/GNOME-Portfolio',
    'https://portfolio.ushanrashmika.me',
    '["React", "Next.js", "TypeScript", "TailwindCSS", "Radix UI"]',
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1556742049-0a67e557224e?w=600&auto=format&fit=crop&q=80"]'
  ),
  (
    'proj_3',
    'Cloudflare Microservices Hub',
    '["Scalable serverless API platform deployed on Cloudflare Workers with D1 SQL database and R2 object storage for lightning-fast edge performance."]',
    90,
    'completed',
    '2024-05-10',
    'https://github.com/ushanrashmika23',
    'https://api.ushanrashmika.me',
    '["Cloudflare Workers", "D1 Database", "R2 Storage", "TypeScript"]',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1556742049-0a67e557224e?w=600&auto=format&fit=crop&q=80"]'
  ),
  (
    'proj_4',
    'E-Commerce Engine',
    '["High-throughput digital marketplace and checkout pipeline with real-time stock sync, payment gateway webhooks, and analytics."]',
    85,
    'in-progress',
    '2024-07-20',
    'https://github.com/ushanrashmika23',
    'https://store.ushanrashmika.me',
    '["Next.js", "PostgreSQL", "Stripe", "Prisma", "TailwindCSS"]',
    'https://images.unsplash.com/photo-1556742049-0a67e557224e?w=600&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1556742049-0a67e557224e?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80"]'
  );

-- ===================================================
-- Migration: display_order and is_visible columns
-- ===================================================
-- For databases created before display_order and is_visible existed:
--
--   ALTER TABLE projects ADD COLUMN display_order INTEGER DEFAULT 0;
--   ALTER TABLE projects ADD COLUMN is_visible INTEGER DEFAULT 1;
--
-- ===================================================
-- Databases created before the `screenshots` column existed need this run once.
-- SQLite has no "ADD COLUMN IF NOT EXISTS", so running it twice reports
-- "duplicate column name: screenshots" — that error is safe to ignore.
--
--   ALTER TABLE projects ADD COLUMN screenshots TEXT;
--
-- The app falls back to `first_screenshot` when `screenshots` is missing or
-- empty, so existing projects keep working without any backfill.

