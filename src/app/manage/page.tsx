'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield, Key, Send, CheckCircle2, AlertCircle, LogOut,
  FolderPlus, Trash2, Edit3, ExternalLink, Github, Eye,
  Database, Cloud, Users, MessageSquare, ArrowLeft, RefreshCw, Upload,
  Lock, Copy, Check, Search, Filter, Plus, Globe, Laptop,
  Clock, Mail, Menu, X, HardDrive, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import '@/styles/manage.css';

interface Project {
  id?: string;
  _id?: string;
  title: string;
  description: string[];
  progress: number;
  status: string;
  startDate: string;
  githubUrl: string;
  demoUrl: string;
  techStack: string[];
  /** Gallery images; the first entry is used as the card cover. */
  screenshots?: string[];
  firstScreenShot: string;
}

/** Gallery images for a project, falling back to the legacy single cover field. */
const getProjectImages = (proj: Project): string[] => {
  const list = Array.isArray(proj.screenshots) ? proj.screenshots : [];
  const cleaned = list.filter((src) => typeof src === 'string' && src.trim());
  if (cleaned.length > 0) return cleaned;
  return proj.firstScreenShot ? [proj.firstScreenShot] : [];
};

const parseImageLines = (value: string): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

interface Visitor {
  id: string;
  sessionId: string;
  ipAddress: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  device: string;
  duration: number;
  createdAt: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function ManagePage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const authEmail = 'ushanrashmika23@gmail.com'; // Locked administrator email
  const [otpCode, setOtpCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const isSendingCodeRef = useRef(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'projects' | 'visitors' | 'messages' | 'cloudflare'>('projects');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Filtering & Search state
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [visitorSearch, setVisitorSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Project Modal / Edit state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    id: '',
    title: '',
    description: '',
    progress: 100,
    status: 'completed',
    startDate: new Date().toISOString().split('T')[0],
    githubUrl: '',
    demoUrl: '',
    techStack: '',
    screenshots: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Check auth session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleSendCode = async () => {
    // Synchronously block duplicate calls, double clicks, or re-submissions
    if (isSendingCodeRef.current || authLoading || resendCountdown > 0) {
      return;
    }
    isSendingCodeRef.current = true;

    // Immediately transition state and lock resend timer so button cannot be pressed again
    setCodeSent(true);
    setResendCountdown(60);
    setAuthLoading(true);
    setAuthMessage({
      type: 'info',
      text: `Sending verification code to ${authEmail}...`,
    });

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAuthMessage({
          type: 'success',
          text: `Verification code sent to ${authEmail}. Please check your inbox.`,
        });
      } else {
        setAuthMessage({ type: 'error', text: data.message || 'Failed to send verification code. Please check SMTP settings.' });
      }
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err.message || 'Network error occurred while sending code.' });
    } finally {
      setAuthLoading(false);
      setTimeout(() => {
        isSendingCodeRef.current = false;
      }, 2000);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setAuthMessage({ type: 'error', text: 'Please enter the 6-digit code' });
      return;
    }

    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, code: otpCode.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        setAuthMessage({ type: 'error', text: data.message || 'Invalid verification code' });
      }
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err.message || 'Verification failed' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setCodeSent(false);
    setOtpCode('');
  };

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [projRes, visRes, msgRes, statRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/visitors'),
        fetch('/api/contact'),
        fetch('/api/manage/stats'),
      ]);

      const [projData, visData, msgData, statData] = await Promise.all([
        projRes.json(),
        visRes.json(),
        msgRes.json(),
        statRes.json(),
      ]);

      if (projData.data) setProjects(projData.data);
      if (visData.data) setVisitors(visData.data);
      if (msgData.data) setMessages(msgData.data);
      if (statData.data) setStats(statData.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Open modal for new project
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      id: `proj_${Date.now()}`,
      title: '',
      description: '',
      progress: 100,
      status: 'completed',
      startDate: new Date().toISOString().split('T')[0],
      githubUrl: '',
      demoUrl: '',
      techStack: '',
      screenshots: '',
    });
    setShowProjectModal(true);
  };

  // Open modal for editing
  const handleOpenEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjectForm({
      id: proj.id || proj._id || '',
      title: proj.title,
      description: Array.isArray(proj.description) ? proj.description.join('\n') : proj.description,
      progress: proj.progress ?? 100,
      status: proj.status || 'completed',
      startDate: proj.startDate || new Date().toISOString().split('T')[0],
      githubUrl: proj.githubUrl || '',
      demoUrl: proj.demoUrl || '',
      techStack: Array.isArray(proj.techStack) ? proj.techStack.join(', ') : '',
      screenshots: getProjectImages(proj).join('\n'),
    });
    setShowProjectModal(true);
  };

  // Save Project (Add/Edit)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const images = parseImageLines(projectForm.screenshots);

      const payload: Partial<Project> = {
        id: projectForm.id,
        title: projectForm.title,
        description: projectForm.description.split('\n').filter(Boolean),
        progress: Number(projectForm.progress),
        status: projectForm.status,
        startDate: projectForm.startDate,
        githubUrl: projectForm.githubUrl,
        demoUrl: projectForm.demoUrl,
        techStack: projectForm.techStack.split(',').map((s) => s.trim()).filter(Boolean),
        screenshots: images,
        firstScreenShot: images[0] || '',
      };

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowProjectModal(false);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  // Delete project
  const handleDeleteProject = async (id?: string) => {
    if (!id || !confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  // Upload one or more images to Cloudflare R2 and append them to the gallery
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploaded: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/manage/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.data?.url) uploaded.push(data.data.url);
      }

      if (uploaded.length > 0) {
        setProjectForm((prev) => ({
          ...prev,
          screenshots: [...parseImageLines(prev.screenshots), ...uploaded].join('\n'),
        }));
      }
    } catch (err) {
      console.error('Failed to upload screenshot:', err);
    } finally {
      setUploadingImage(false);
      input.value = '';
    }
  };

  // Drop one image from the gallery list
  const handleRemoveImage = (index: number) => {
    setProjectForm((prev) => ({
      ...prev,
      screenshots: parseImageLines(prev.screenshots)
        .filter((_, i) => i !== index)
        .join('\n'),
    }));
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const matchesSearch =
        proj.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        (Array.isArray(proj.techStack) && proj.techStack.some((t) => t.toLowerCase().includes(projectSearch.toLowerCase())));
      const matchesStatus =
        projectStatusFilter === 'all' || proj.status.toLowerCase() === projectStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [projects, projectSearch, projectStatusFilter]);

  // Filtered visitors
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const search = visitorSearch.toLowerCase();
      return (
        (v.ipAddress && v.ipAddress.toLowerCase().includes(search)) ||
        (v.country && v.country.toLowerCase().includes(search)) ||
        (v.city && v.city.toLowerCase().includes(search)) ||
        (v.browser && v.browser.toLowerCase().includes(search)) ||
        (v.os && v.os.toLowerCase().includes(search))
      );
    });
  }, [visitors, visitorSearch]);

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const search = messageSearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search) ||
        m.message.toLowerCase().includes(search)
      );
    });
  }, [messages, messageSearch]);

  // Copy .env template
  const handleCopyEnv = () => {
    const envText = `# Cloudflare D1 SQL Database
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_D1_DATABASE_ID=your_d1_database_uuid
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# Cloudflare R2 Object Storage
CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_r2_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev

# Admin Login OTP Email
MANAGE_ADMIN_EMAIL=ushanrashmika23@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ushanrashmika23@gmail.com
SMTP_PASS=your_gmail_app_password`;

    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="manage-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #3584e4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontFamily: 'monospace' }}>Initializing Management Console...</p>
      </div>
    );
  }

  // Auth Screen (Modern SaaS Login)
  // Auth Screen (Clean Authentic GNOME Admin)
  if (!isAuthenticated) {
    return (
      <div className="manage-auth-container">
        <div className="manage-auth-card">
          {/* Top Window control bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.875rem', borderBottom: '1px solid var(--manage-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e01b24' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f6d32d' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#33d17a' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem', fontFamily: 'monospace' }}>admin-auth.gnome</span>
            </div>
            <Link
              href="/"
              style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none' }}
            >
              <ArrowLeft style={{ width: '14px', height: '14px' }} /> Return to Desktop
            </Link>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', margin: '0.25rem 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '0.625rem', background: 'rgba(53, 132, 228, 0.12)', border: '1px solid rgba(53, 132, 228, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: '#3584e4' }}>
              <Shield style={{ width: '24px', height: '24px' }} />
            </div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>Administrator Sign In</h1>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.375rem', lineHeight: 1.5 }}>
              Verify identity to access portfolio settings and Cloudflare services.
            </p>
          </div>

          {/* Locked Administrator Email Card */}
          <div style={{ padding: '0.75rem 0.875rem', borderRadius: '0.5rem', background: 'var(--manage-surface)', border: '1px solid var(--manage-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '0.375rem', background: 'rgba(53, 132, 228, 0.1)', border: '1px solid rgba(53, 132, 228, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3584e4', flexShrink: 0 }}>
                <Lock style={{ width: '15px', height: '15px' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Authorized Account
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {authEmail}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.625rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.06)', color: '#94a3b8', border: '1px solid var(--manage-border)', fontWeight: 600, flexShrink: 0 }}>
              Locked
            </span>
          </div>

          {/* Status Message / Notification */}
          {authMessage && (
            <div
              style={{
                padding: '0.75rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                background: authMessage.type === 'error' ? 'rgba(224, 27, 36, 0.1)' : authMessage.type === 'success' ? 'rgba(51, 209, 122, 0.1)' : 'rgba(53, 132, 228, 0.1)',
                border: `1px solid ${authMessage.type === 'error' ? 'rgba(224, 27, 36, 0.25)' : authMessage.type === 'success' ? 'rgba(51, 209, 122, 0.25)' : 'rgba(53, 132, 228, 0.25)'}`,
                color: authMessage.type === 'error' ? '#fca5a5' : authMessage.type === 'success' ? '#86efac' : '#93c5fd',
              }}
            >
              {authLoading && authMessage.type === 'info' ? (
                <div style={{ width: '16px', height: '16px', border: '2px solid #3584e4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              ) : authMessage.type === 'error' ? (
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, color: '#f87171' }} />
              ) : (
                <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0, color: '#4ade80' }} />
              )}
              <span style={{ lineHeight: 1.4, flex: 1 }}>{authMessage.text}</span>
            </div>
          )}

          {!codeSent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={authLoading}
                className="manage-btn-primary"
                style={{ width: '100%', padding: '0.8125rem', fontSize: '0.875rem', justifyContent: 'center' }}
              >
                {authLoading ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <Send style={{ width: '15px', height: '15px' }} /> Send Verification Code
                  </>
                )}
              </button>

              <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                A 6-digit access code will be emailed to {authEmail}. Valid for 15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600 }}>Verification Code</label>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={resendCountdown > 0 || authLoading}
                    style={{ background: 'none', border: 'none', color: '#3584e4', fontSize: '0.75rem', cursor: resendCountdown > 0 ? 'default' : 'pointer' }}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Key style={{ width: '16px', height: '16px', position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="manage-input"
                    style={{ paddingLeft: '2.75rem', textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}
                    placeholder="••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading || otpCode.trim().length !== 6}
                className="manage-btn-primary"
                style={{ width: '100%', padding: '0.8125rem', justifyContent: 'center' }}
              >
                {authLoading ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <CheckCircle2 style={{ width: '16px', height: '16px' }} /> Verify & Access Portal
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setCodeSent(false); setAuthMessage(null); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Return to email verification
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ===================================================
  // MODERN SAAS MANAGEMENT DASHBOARD
  // ===================================================
  return (
    <div className="manage-container manage-shell">
      {/* ===================================================
          DESKTOP SIDEBAR
          =================================================== */}
      <aside className="manage-sidebar">
        <div>
          {/* Brand Header */}
          <div className="manage-sidebar-brand">
            <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#3584e4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Shield style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                GNOME Admin
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#33d17a' }} />
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontFamily: 'monospace' }}>Control Center</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="manage-sidebar-nav">
            <div className="manage-sidebar-section-title">Platform</div>

            <button
              onClick={() => setActiveTab('projects')}
              className={`manage-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FolderPlus style={{ width: '16px', height: '16px', color: '#3584e4' }} />
                <span>Projects</span>
              </div>
              <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', fontFamily: 'monospace' }}>
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('visitors')}
              className={`manage-nav-item ${activeTab === 'visitors' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users style={{ width: '16px', height: '16px', color: '#33d17a' }} />
                <span>Visitors & Traffic</span>
              </div>
              <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', fontFamily: 'monospace' }}>
                {visitors.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`manage-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MessageSquare style={{ width: '16px', height: '16px', color: '#f6d32d' }} />
                <span>Contact Inquiries</span>
              </div>
              <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', fontFamily: 'monospace' }}>
                {messages.length}
              </span>
            </button>

            <div className="manage-sidebar-section-title" style={{ marginTop: '1rem' }}>Infrastructure</div>

            <button
              onClick={() => setActiveTab('cloudflare')}
              className={`manage-nav-item ${activeTab === 'cloudflare' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Cloud style={{ width: '16px', height: '16px', color: '#9141ac' }} />
                <span>Cloudflare D1 & R2</span>
              </div>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#33d17a' }} />
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Infrastructure Status & Admin User Card */}
        <div>
          {/* Status badge widget */}
          <div style={{ padding: '0.875rem 1rem', margin: '0 0.875rem 0.875rem', borderRadius: '0.75rem', background: 'rgba(11, 15, 25, 0.8)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Database style={{ width: '12px', height: '12px', color: '#3584e4' }} /> D1 SQL DB
              </span>
              <span style={{ color: '#33d17a', fontWeight: 600 }}>
                {stats?.cfD1Configured ? 'Connected' : 'Local SQLite'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <HardDrive style={{ width: '12px', height: '12px', color: '#9141ac' }} /> R2 Storage
              </span>
              <span style={{ color: '#33d17a', fontWeight: 600 }}>
                {stats?.cfR2Configured ? 'Connected' : 'Local uploads'}
              </span>
            </div>
          </div>

          {/* Admin User Card */}
          <div className="manage-sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', flexShrink: 0 }}>
                UR
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {authEmail}
                </div>
                <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>Administrator</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{ background: 'none', border: 'none', padding: '0.375rem', borderRadius: '0.5rem', color: '#94a3b8', cursor: 'pointer' }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* ===================================================
          MAIN CONTENT WRAPPER
          =================================================== */}
      <div className="manage-main-wrapper">
        {/* Top Header Bar */}
        <header className="manage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'inline-flex', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.25rem' }}
              className="md-hidden"
            >
              {mobileMenuOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
            </button>

            {/* Breadcrumb Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#94a3b8' }}>
                <span>Console</span>
                <span>/</span>
                <span style={{ color: '#ffffff', textTransform: 'capitalize' }}>{activeTab}</span>
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff', textTransform: 'capitalize', letterSpacing: '-0.01em', marginTop: '2px' }}>
                {activeTab === 'projects' && 'Portfolio Projects Management'}
                {activeTab === 'visitors' && 'Visitor Analytics & Sessions'}
                {activeTab === 'messages' && 'Inbound Contact Inquiries'}
                {activeTab === 'cloudflare' && 'Cloudflare D1 & R2 Architecture'}
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={loadDashboardData}
              disabled={loadingData}
              className="manage-btn-secondary"
              title="Refresh all data"
            >
              <RefreshCw style={{ width: '14px', height: '14px', animation: loadingData ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="manage-btn-secondary"
            >
              <Eye style={{ width: '14px', height: '14px', color: '#3584e4' }} />
              <span>View Portfolio</span>
            </Link>

            {activeTab === 'projects' && (
              <button
                onClick={handleOpenAddProject}
                className="manage-btn-primary"
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Add Project</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div style={{ padding: '1rem', background: '#0e1526', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => { setActiveTab('projects'); setMobileMenuOpen(false); }}
              className={`manage-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderPlus style={{ width: '16px', height: '16px' }} /> Projects ({projects.length})
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('visitors'); setMobileMenuOpen(false); }}
              className={`manage-nav-item ${activeTab === 'visitors' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users style={{ width: '16px', height: '16px' }} /> Visitors ({visitors.length})
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }}
              className={`manage-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare style={{ width: '16px', height: '16px' }} /> Messages ({messages.length})
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('cloudflare'); setMobileMenuOpen(false); }}
              className={`manage-nav-item ${activeTab === 'cloudflare' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cloud style={{ width: '16px', height: '16px' }} /> Cloudflare Config
              </div>
            </button>
          </div>
        )}

        {/* Content Area with Generous Spacing */}
        <main className="manage-content">
          {/* ===================================================
              METRIC STATS OVERVIEW CARDS
              =================================================== */}
          <div className="manage-stat-grid">
            {/* Stat 1: Total Projects */}
            <div className="manage-stat-card">
              <div className="manage-stat-header">
                <span className="manage-stat-label">Total Projects</span>
                <div className="manage-stat-icon-wrapper" style={{ background: 'rgba(53, 132, 228, 0.15)', color: '#3584e4', border: '1px solid rgba(53, 132, 228, 0.3)' }}>
                  <FolderPlus style={{ width: '18px', height: '18px' }} />
                </div>
              </div>
              <div className="manage-stat-value">{projects.length}</div>
              <div className="manage-stat-footer">
                <span style={{ color: '#33d17a', fontWeight: 600 }}>
                  {projects.filter((p) => p.status === 'completed').length} completed
                </span>
                <span>•</span>
                <span>{projects.filter((p) => p.status !== 'completed').length} in progress</span>
              </div>
            </div>

            {/* Stat 2: Visitors */}
            <div className="manage-stat-card">
              <div className="manage-stat-header">
                <span className="manage-stat-label">Visitor Sessions</span>
                <div className="manage-stat-icon-wrapper" style={{ background: 'rgba(51, 209, 122, 0.15)', color: '#33d17a', border: '1px solid rgba(51, 209, 122, 0.3)' }}>
                  <Users style={{ width: '18px', height: '18px' }} />
                </div>
              </div>
              <div className="manage-stat-value">{visitors.length}</div>
              <div className="manage-stat-footer">
                <span style={{ color: '#33d17a', fontWeight: 600 }}>Logged to D1</span>
                <span>•</span>
                <span>{new Set(visitors.map((v) => v.ipAddress)).size} unique IPs</span>
              </div>
            </div>

            {/* Stat 3: Messages */}
            <div className="manage-stat-card">
              <div className="manage-stat-header">
                <span className="manage-stat-label">Contact Messages</span>
                <div className="manage-stat-icon-wrapper" style={{ background: 'rgba(246, 211, 45, 0.15)', color: '#f6d32d', border: '1px solid rgba(246, 211, 45, 0.3)' }}>
                  <MessageSquare style={{ width: '18px', height: '18px' }} />
                </div>
              </div>
              <div className="manage-stat-value">{messages.length}</div>
              <div className="manage-stat-footer">
                <span style={{ color: '#f6d32d', fontWeight: 600 }}>Direct Inbox</span>
                <span>•</span>
                <span>Saved to D1</span>
              </div>
            </div>

            {/* Stat 4: Cloudflare Status */}
            <div className="manage-stat-card">
              <div className="manage-stat-header">
                <span className="manage-stat-label">Edge Infrastructure</span>
                <div className="manage-stat-icon-wrapper" style={{ background: 'rgba(145, 65, 172, 0.15)', color: '#9141ac', border: '1px solid rgba(145, 65, 172, 0.3)' }}>
                  <Cloud style={{ width: '18px', height: '18px' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#33d17a' }} />
                <span>{stats?.cfD1Configured ? 'D1 Connected' : 'Local SQLite'}</span>
              </div>
              <div className="manage-stat-footer">
                <span>R2: {stats?.cfR2Configured ? 'Live Bucket' : 'Local Uploads'}</span>
              </div>
            </div>
          </div>

          {/* ===================================================
              TAB 1: PROJECTS MANAGEMENT
              =================================================== */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Controls bar: Search & Status Filters */}
              <div className="manage-controls-bar">
                <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '440px' }}>
                  <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects by title or tech stack..."
                    className="manage-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <Filter style={{ width: '14px', height: '14px' }} />
                    <span>Filter:</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    {['all', 'completed', 'in-progress'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setProjectStatusFilter(st)}
                        style={{
                          padding: '0.4rem 0.875rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: projectStatusFilter === st ? 600 : 500,
                          backgroundColor: projectStatusFilter === st ? '#3584e4' : 'rgba(255,255,255,0.06)',
                          color: projectStatusFilter === st ? '#ffffff' : '#94a3b8',
                          border: 'none',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {st === 'all' ? 'All' : st.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.15)', background: '#131b2e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <FolderPlus style={{ width: '40px', height: '40px', color: '#64748b' }} />
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>No projects match your filter</div>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', maxWidth: '380px', margin: 0, lineHeight: 1.5 }}>
                    {projectSearch
                      ? `No projects found matching "${projectSearch}". Try clearing your search.`
                      : 'Add your first project to synchronize directly with Cloudflare D1.'}
                  </p>
                  <button
                    onClick={handleOpenAddProject}
                    className="manage-btn-primary"
                    style={{ marginTop: '0.75rem' }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} /> Add Project
                  </button>
                </div>
              ) : (
                <div className="manage-projects-grid">
                  {filteredProjects.map((proj) => {
                    const projId = proj.id || proj._id;
                    const isCompleted = proj.status === 'completed';

                    return (
                      <div key={projId} className="manage-project-card">
                        {/* Project Banner Header */}
                        <div className="manage-project-banner">
                          {proj.firstScreenShot ? (
                            <img
                              src={proj.firstScreenShot}
                              alt={proj.title}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#64748b' }}>
                              <FolderPlus style={{ width: '32px', height: '32px', color: '#3584e4', marginBottom: '0.5rem' }} />
                              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>No Screenshot Attached</span>
                            </div>
                          )}

                          {/* Floating status pill */}
                          <div style={{ position: 'absolute', top: '0.875rem', right: '0.875rem' }}>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                padding: '0.25rem 0.625rem',
                                borderRadius: '9999px',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                backdropFilter: 'blur(12px)',
                                backgroundColor: isCompleted ? 'rgba(51, 209, 122, 0.2)' : 'rgba(246, 211, 45, 0.2)',
                                color: isCompleted ? '#86efac' : '#fde047',
                                border: `1px solid ${isCompleted ? 'rgba(51, 209, 122, 0.4)' : 'rgba(246, 211, 45, 0.4)'}`,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isCompleted ? '#33d17a' : '#f6d32d' }} />
                              {proj.status}
                            </span>
                          </div>
                        </div>

                        {/* Project Card Body */}
                        <div className="manage-project-body">
                          <div>
                            <div className="manage-project-title">{proj.title}</div>
                            <div className="manage-project-desc">
                              {Array.isArray(proj.description) ? proj.description[0] : proj.description}
                            </div>
                          </div>

                          <div>
                            {/* Tech Stack Pills */}
                            <div className="manage-project-tags">
                              {(proj.techStack || []).slice(0, 4).map((tech) => (
                                <span
                                  key={tech}
                                  style={{
                                    fontSize: '0.6875rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#cbd5e1',
                                    fontWeight: 500,
                                  }}
                                >
                                  {tech}
                                </span>
                              ))}
                              {(proj.techStack || []).length > 4 && (
                                <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8' }}>
                                  +{(proj.techStack || []).length - 4}
                                </span>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div style={{ marginTop: '1.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '0.375rem', fontWeight: 600 }}>
                                <span>Completion</span>
                                <span>{proj.progress}%</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    borderRadius: '9999px',
                                    background: 'linear-gradient(90deg, #3584e4, #33d17a)',
                                    width: `${proj.progress}%`,
                                    transition: 'width 0.4s ease',
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Card Footer: Links & Action Buttons */}
                          <div className="manage-project-footer">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              {proj.demoUrl && (
                                <a
                                  href={proj.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                                  title="Open Live Demo"
                                >
                                  <ExternalLink style={{ width: '14px', height: '14px' }} />
                                </a>
                              )}
                              {proj.githubUrl && (
                                <a
                                  href={proj.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                                  title="View GitHub Repository"
                                >
                                  <Github style={{ width: '14px', height: '14px' }} />
                                </a>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleOpenEditProject(proj)}
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: '0.5rem',
                                  background: 'rgba(53, 132, 228, 0.15)',
                                  color: '#60a5fa',
                                  border: '1px solid rgba(53, 132, 228, 0.3)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  cursor: 'pointer',
                                }}
                              >
                                <Edit3 style={{ width: '13px', height: '13px' }} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProject(projId)}
                                style={{
                                  padding: '0.4rem',
                                  borderRadius: '0.5rem',
                                  background: 'none',
                                  color: '#94a3b8',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                                title="Delete Project"
                              >
                                <Trash2 style={{ width: '15px', height: '15px' }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================
              TAB 2: VISITORS & TRAFFIC ANALYTICS
              =================================================== */}
          {activeTab === 'visitors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Analytics Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderRadius: '1rem', background: '#131b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Globe style={{ width: '16px', height: '16px', color: '#3584e4' }} /> Total Logged Sessions
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>{visitors.length}</div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', borderRadius: '1rem', background: '#131b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Laptop style={{ width: '16px', height: '16px', color: '#33d17a' }} /> Unique Client IPs
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                    {new Set(visitors.map((v) => v.ipAddress)).size}
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', borderRadius: '1rem', background: '#131b2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Clock style={{ width: '16px', height: '16px', color: '#f6d32d' }} /> Average Engagement
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                    {visitors.length > 0
                      ? Math.round(
                          visitors.reduce((acc, v) => acc + (v.duration || 0), 0) / visitors.length
                        )
                      : 0}
                    s
                  </div>
                </div>
              </div>

              {/* Table search filter */}
              <div className="manage-controls-bar">
                <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '440px' }}>
                  <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={visitorSearch}
                    onChange={(e) => setVisitorSearch(e.target.value)}
                    placeholder="Search by IP, location, browser, or OS..."
                    className="manage-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  Showing {filteredVisitors.length} of {visitors.length} sessions
                </div>
              </div>

              {/* Visitor Table Card */}
              <div className="manage-table-card">
                <div style={{ overflowX: 'auto' }}>
                  <table className="manage-table">
                    <thead>
                      <tr>
                        <th>Session ID</th>
                        <th>IP Address</th>
                        <th>Location</th>
                        <th>Browser & Platform</th>
                        <th>Duration</th>
                        <th>Recorded At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVisitors.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#94a3b8' }}>
                            No visitor sessions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        filteredVisitors.map((v) => (
                          <tr key={v.id || v.sessionId}>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {v.sessionId ? v.sessionId.slice(0, 12) : 'anon'}...
                              </span>
                            </td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#ffffff' }}>
                              {v.ipAddress || '127.0.0.1'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <Globe style={{ width: '14px', height: '14px', color: '#3584e4' }} />
                                <span>
                                  {v.city ? `${v.city}, ` : ''}
                                  {v.country || 'Local Network'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(53, 132, 228, 0.15)', color: '#60a5fa', border: '1px solid rgba(53, 132, 228, 0.3)', fontWeight: 600, fontSize: '0.6875rem' }}>
                                  {v.browser || 'Web Browser'}
                                </span>
                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(145, 65, 172, 0.15)', color: '#c084fc', border: '1px solid rgba(145, 65, 172, 0.3)', fontWeight: 600, fontSize: '0.6875rem' }}>
                                  {v.os || 'OS'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#33d17a' }}>
                                {v.duration || 0}s
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {v.createdAt ? new Date(v.createdAt).toLocaleString() : 'Just now'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              TAB 3: CONTACT INQUIRIES
              =================================================== */}
          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Search filter */}
              <div className="manage-controls-bar">
                <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '440px' }}>
                  <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    placeholder="Search messages by name, email, or content..."
                    className="manage-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {filteredMessages.length} inquiries received
                </div>
              </div>

              {/* Message cards feed */}
              {filteredMessages.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.15)', background: '#131b2e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <MessageSquare style={{ width: '40px', height: '40px', color: '#64748b' }} />
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>No inquiries received</div>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', maxWidth: '380px', margin: 0, lineHeight: 1.5 }}>
                    Messages submitted from the desktop Contact window will appear here and persist to Cloudflare D1.
                  </p>
                </div>
              ) : (
                <div className="manage-messages-list">
                  {filteredMessages.map((m) => (
                    <div key={m.id} className="manage-message-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#93c5fd' }}>
                            {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#ffffff' }}>{m.name}</div>
                            <a
                              href={`mailto:${m.email}`}
                              style={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}
                            >
                              <Mail style={{ width: '12px', height: '12px' }} /> {m.email}
                            </a>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                            {m.createdAt ? new Date(m.createdAt).toLocaleString() : 'Recent'}
                          </span>
                          <a
                            href={`mailto:${m.email}?subject=Reply to inquiry on portfolio`}
                            className="manage-btn-secondary"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', textDecoration: 'none' }}
                          >
                            <Mail style={{ width: '13px', height: '13px', color: '#3584e4' }} /> Reply
                          </a>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="manage-message-body">
                        {m.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================
              TAB 4: CLOUDFLARE D1 & R2 CONFIG
              =================================================== */}
          {activeTab === 'cloudflare' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Architecture Banner */}
              <div className="manage-cf-banner">
                <div style={{ maxWidth: '650px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', background: 'rgba(53, 132, 228, 0.2)', border: '1px solid rgba(53, 132, 228, 0.4)', color: '#60a5fa', fontSize: '0.6875rem', fontWeight: 700 }}>
                      Edge Database Architecture
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>SQLite + S3 Compatible</span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
                    Cloudflare D1 & R2 Backend Services
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                    All portfolio projects, visitor analytics, and contact inquiries are backed by Cloudflare D1 SQL database and Cloudflare R2 object storage.
                  </p>
                </div>

                <button
                  onClick={handleCopyEnv}
                  className="manage-btn-primary"
                  style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem' }}
                >
                  {copiedEnv ? (
                    <>
                      <Check style={{ width: '16px', height: '16px', color: '#86efac' }} /> Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: '16px', height: '16px' }} /> Copy .env Template
                    </>
                  )}
                </button>
              </div>

              {/* Service Details Grid */}
              <div className="manage-services-grid">
                {/* D1 SQL Service Card */}
                <div className="manage-service-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: 'rgba(53, 132, 228, 0.15)', border: '1px solid rgba(53, 132, 228, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3584e4' }}>
                      <Database style={{ width: '22px', height: '22px' }} />
                    </div>
                    <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(51, 209, 122, 0.15)', color: '#86efac', border: '1px solid rgba(51, 209, 122, 0.3)', fontWeight: 600 }}>
                      {stats?.cfD1Configured ? 'D1 Connected' : 'Local SQLite'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Cloudflare D1 SQL</div>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.375rem 0 0', lineHeight: 1.5 }}>
                      Zero-latency edge SQL storage for projects, visitors, and messages.
                    </p>
                  </div>
                  <div style={{ padding: '0.875rem', borderRadius: '0.625rem', background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div>Tables: projects, visitors, messages</div>
                    <div>Engine: Cloudflare D1 (SQLite)</div>
                    <div>Fallback: .d1-local-storage.json</div>
                  </div>
                </div>

                {/* R2 Object Storage Card */}
                <div className="manage-service-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: 'rgba(145, 65, 172, 0.15)', border: '1px solid rgba(145, 65, 172, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9141ac' }}>
                      <Cloud style={{ width: '22px', height: '22px' }} />
                    </div>
                    <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(51, 209, 122, 0.15)', color: '#86efac', border: '1px solid rgba(51, 209, 122, 0.3)', fontWeight: 600 }}>
                      {stats?.cfR2Configured ? 'R2 Connected' : 'Local Storage'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Cloudflare R2 Bucket</div>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.375rem 0 0', lineHeight: 1.5 }}>
                      Zero egress-fee object storage for project screenshots and assets.
                    </p>
                  </div>
                  <div style={{ padding: '0.875rem', borderRadius: '0.625rem', background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div>Protocol: AWS S3 compatible</div>
                    <div>Upload API: /api/manage/upload</div>
                    <div>Fallback: public/uploads/</div>
                  </div>
                </div>

                {/* Auth & Security Card */}
                <div className="manage-service-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: 'rgba(51, 209, 122, 0.15)', border: '1px solid rgba(51, 209, 122, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#33d17a' }}>
                      <Shield style={{ width: '22px', height: '22px' }} />
                    </div>
                    <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(51, 209, 122, 0.15)', color: '#86efac', border: '1px solid rgba(51, 209, 122, 0.3)', fontWeight: 600 }}>
                      Protected
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>One-Time Code Auth</div>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.375rem 0 0', lineHeight: 1.5 }}>
                      Single-use 6-digit access tokens emailed to authorized admin address.
                    </p>
                  </div>
                  <div style={{ padding: '0.875rem', borderRadius: '0.625rem', background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div>Admin: {authEmail}</div>
                    <div>Session: HMAC SHA-256 Cookie</div>
                    <div>SMTP: Nodemailer TLS</div>
                  </div>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="manage-env-box">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff' }}>Environment Configuration (.env)</div>
                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '2px' }}>
                      Configure these variables in your root .env file to link your live Cloudflare credentials.
                    </div>
                  </div>
                  <button
                    onClick={handleCopyEnv}
                    className="manage-btn-secondary"
                  >
                    {copiedEnv ? (
                      <>
                        <Check style={{ width: '14px', height: '14px', color: '#33d17a' }} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy style={{ width: '14px', height: '14px' }} /> Copy Code
                      </>
                    )}
                  </button>
                </div>

                <pre className="manage-env-pre">
{`# Cloudflare D1 SQL Database
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_D1_DATABASE_ID=your_d1_database_uuid
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# Cloudflare R2 Object Storage (R1/R2)
CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_r2_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev

# Admin Login OTP Email
MANAGE_ADMIN_EMAIL=ushanrashmika23@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ushanrashmika23@gmail.com
SMTP_PASS=your_gmail_app_password`}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================
          ADD / EDIT PROJECT MODAL (MODERN SAAS DIALOG)
          =================================================== */}
      {showProjectModal && (
        <div className="manage-modal-overlay">
          <div className="manage-modal-box">
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                  Saves directly to Cloudflare D1 SQL database with instantaneous portfolio sync.
                </p>
              </div>
              <button
                onClick={() => setShowProjectModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.5rem' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Row 1: Title & Status */}
              <div className="manage-form-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>Project Title *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="manage-input"
                    placeholder="e.g. Next.js SaaS Platform"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>Status *</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="manage-input"
                    style={{ background: '#090e1a' }}
                  >
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Description * (one paragraph per line)
                </label>
                <textarea
                  rows={4}
                  required
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="manage-input"
                  style={{ resize: 'none', lineHeight: 1.6 }}
                  placeholder="Detailed summary of the application, architecture, and core features..."
                />
              </div>

              {/* Row 3: Progress Slider */}
              <div style={{ padding: '1rem', borderRadius: '0.75rem', background: '#090e1a', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>
                  <span>Completion Percentage</span>
                  <span style={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: 800 }}>
                    {projectForm.progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={projectForm.progress}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, progress: Number(e.target.value) })
                  }
                  style={{ width: '100%', accentColor: '#3584e4', cursor: 'pointer' }}
                />
              </div>

              {/* Row 4: Links */}
              <div className="manage-form-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>Live Demo URL</label>
                  <input
                    type="url"
                    value={projectForm.demoUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                    className="manage-input"
                    placeholder="https://myapp.vercel.app"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>GitHub Repository URL</label>
                  <input
                    type="url"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    className="manage-input"
                    placeholder="https://github.com/ushanrashmika/..."
                  />
                </div>
              </div>

              {/* Row 5: Tech Stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={projectForm.techStack}
                  onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                  className="manage-input"
                  placeholder="Next.js, Cloudflare D1, TypeScript, Tailwind CSS"
                />
              </div>

              {/* Row 6: Project Images (R2 Upload) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Project Images (Cloudflare R2)
                </label>
                <textarea
                  rows={3}
                  value={projectForm.screenshots}
                  onChange={(e) => setProjectForm({ ...projectForm, screenshots: e.target.value })}
                  className="manage-input"
                  style={{ resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', fontSize: '0.8125rem' }}
                  placeholder={'https://.../cover.png\nhttps://.../dashboard.png'}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    One URL per line — the first image is the card cover.
                  </span>
                  <label className="manage-btn-secondary" style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <Upload style={{ width: '14px', height: '14px', color: '#3584e4' }} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload R2'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                {parseImageLines(projectForm.screenshots).length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    {parseImageLines(projectForm.screenshots).map((src, i) => (
                      <div
                        key={`${src}-${i}`}
                        style={{
                          position: 'relative',
                          height: '84px',
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#000000',
                        }}
                      >
                        <img
                          src={src}
                          alt={`Project image ${i + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {i === 0 && (
                          <span
                            style={{
                              position: 'absolute',
                              left: '0.375rem',
                              bottom: '0.375rem',
                              fontSize: '0.625rem',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '9999px',
                              background: 'rgba(53,132,228,0.9)',
                              color: '#ffffff',
                              fontWeight: 700,
                            }}
                          >
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          title="Remove image"
                          aria-label={`Remove image ${i + 1}`}
                          style={{
                            position: 'absolute',
                            top: '0.25rem',
                            right: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '22px',
                            height: '22px',
                            borderRadius: '9999px',
                            border: 'none',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#ffffff',
                            cursor: 'pointer',
                          }}
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="manage-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="manage-btn-primary"
                >
                  <CheckCircle style={{ width: '16px', height: '16px' }} />
                  <span>Save to Cloudflare D1</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
