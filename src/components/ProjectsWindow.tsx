'use client';

import { Folder, ExternalLink, Github, ArrowLeft, ArrowUpRight, Calendar, Layers, CheckCircle2, Clock, CircleDot, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface ProjectsWindowProps {
  theme: 'dark' | 'light';
}

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
  /** Gallery images; the first entry is also the card cover. */
  screenshots?: string[];
  firstScreenShot: string;
  displayOrder?: number;
  isVisible?: boolean;
}

interface ApiResponse {
  code: number;
  status: string;
  data: Project[];
}

const projectColors = ['#3584e4', '#33d17a', '#f6d32d', '#e01b24', '#9141ac', '#ff7800'];

// Shared class helpers so the detail view uses the same theme vocabulary as the rest of the app
const panelClass = (theme: 'dark' | 'light') =>
  `rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`;

const titleClass = (theme: 'dark' | 'light') =>
  `font-['JetBrains_Mono'] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;

const mutedClass = (theme: 'dark' | 'light') =>
  `font-['JetBrains_Mono'] ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`;

const getProjectColor = (index: number) => projectColors[index % projectColors.length];

const getStatusMeta = (status: string) => {
  const normalized = (status || '').toLowerCase().replace(/[\s_]+/g, '-');

  switch (normalized) {
    case 'completed':
    case 'done':
      return { label: 'Completed', color: '#33d17a', icon: CheckCircle2 };
    case 'in-progress':
    case 'ongoing':
    case 'active':
      return { label: 'In Progress', color: '#f6d32d', icon: Clock };
    case 'archived':
      return { label: 'Archived', color: '#9a9996', icon: CircleDot };
    default:
      return { label: status || 'Unknown', color: '#3584e4', icon: CircleDot };
  }
};

const formatDate = (value: string) => {
  if (!value) return 'Not specified';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getParagraphs = (description: Project['description']) => {
  if (Array.isArray(description)) return description.filter(Boolean);
  return description ? [description] : [];
};

/** Gallery images for a project, falling back to the legacy single cover field. */
const getProjectImages = (project: Project): string[] => {
  const list = Array.isArray(project.screenshots) ? project.screenshots : [];
  const cleaned = list.filter((src) => typeof src === 'string' && src.trim());
  if (cleaned.length > 0) return cleaned;
  return project.firstScreenShot ? [project.firstScreenShot] : [];
};

export default function ProjectsWindow({ theme }: ProjectsWindowProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ project: Project; index: number } | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<'prev' | 'next' | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeImages = selected ? getProjectImages(selected.project) : [];
  const currentImage = activeImages[imageIndex] || '';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROJECTS);
        const data: ApiResponse = await response.json();

        if (data.code === 200 && data.status === 'success') {
          const visible = (data.data || [])
            .filter((p) => p.isVisible !== false)
            .sort((a, b) => {
              const orderA = typeof a.displayOrder === 'number' && a.displayOrder > 0 ? a.displayOrder : 999999;
              const orderB = typeof b.displayOrder === 'number' && b.displayOrder > 0 ? b.displayOrder : 999999;
              if (orderA !== orderB) return orderA - orderB;
              return 0;
            });
          setProjects(visible);
        } else {
          setError('Failed to fetch projects');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const openProject = (project: Project, index: number) => {
    setImageFailed(false);
    setImageIndex(0);
    setSelected({ project, index });
  };

  const closeProject = () => setSelected(null);

  const showImage = (target: number) => {
    if (activeImages.length < 2) return;
    setImageFailed(false);
    setImageIndex((target + activeImages.length) % activeImages.length);
  };

  const showPrevImage = () => showImage(imageIndex - 1);

  const showNextImage = () => showImage(imageIndex + 1);

  // Reset the window's scroll position whenever the view is swapped
  useEffect(() => {
    const scroller = rootRef.current?.closest('.overflow-auto') as HTMLElement | null;
    if (scroller) scroller.scrollTop = 0;
  }, [selected]);

  useEffect(() => {
    if (!selected) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeProject();
        return;
      }

      if (activeImages.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        if (event.key === 'ArrowLeft') showPrevImage();
        else showNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, activeImages.length, imageIndex]);

  if (loading) {
    return (
      <div className="w-full max-w-[700px] sm:w-[700px] p-4 sm:p-8">
        <h2 className={`text-lg sm:text-xl mb-4 sm:mb-6 font-['JetBrains_Mono'] ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          My Projects
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`w-12 h-12 rounded-lg mb-3 animate-pulse ${
                theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'
              }`}></div>
              <div className={`h-4 rounded mb-2 animate-pulse ${
                theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'
              }`}></div>
              <div className={`h-3 rounded mb-3 animate-pulse ${
                theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'
              }`}></div>
              <div className="flex gap-1">
                <div className={`h-5 w-12 rounded animate-pulse ${
                  theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'
                }`}></div>
                <div className={`h-5 w-12 rounded animate-pulse ${
                  theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'
                }`}></div>
                <div className={`h-5 w-8 rounded animate-pulse ${
                  theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[700px] sm:w-[700px] p-4 sm:p-8">
        <h2 className={`text-lg sm:text-xl mb-4 sm:mb-6 font-['JetBrains_Mono'] ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          My Projects
        </h2>
        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-red-900/30 border border-red-700 text-red-400' : 'bg-red-100 border border-red-300 text-red-700'
        }`}>
          <p className="font-['JetBrains_Mono'] text-sm">❌ {error}</p>
        </div>
      </div>
    );
  }

  // ---------------- Project detail view ----------------
  if (selected) {
    const { project, index } = selected;
    const accent = getProjectColor(index);
    const status = getStatusMeta(project.status);
    const StatusIcon = status.icon;
    const paragraphs = getParagraphs(project.description);
    const techStack = Array.isArray(project.techStack) ? project.techStack : [];
    const progress = Math.max(0, Math.min(100, Number(project.progress) || 0));

    return (
      <div ref={rootRef} className="w-full max-w-[700px] sm:w-[700px] p-4 sm:p-8">
        {/* Back navigation */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            type="button"
            onClick={closeProject}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-['JetBrains_Mono'] transition-colors ${
              theme === 'dark'
                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-400'
            }`}
            aria-label="Back to projects list"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Projects
          </button>

          <span className={`text-[10px] font-['JetBrains_Mono'] ${
            theme === 'dark' ? 'text-white/60' : 'text-gray-500'
          }`}>
            {index + 1} / {projects.length}
          </span>
        </div>

        {/* Preview image */}
        <div
          className={`relative w-full rounded-xl overflow-hidden border ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          }`}
          style={{ paddingTop: '42%', backgroundColor: accent }}
        >
          {currentImage && !imageFailed ? (
            <img
              key={currentImage}
              src={currentImage}
              alt={`${project.title} screenshot ${imageIndex + 1}`}
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover' }}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
            >
              <Folder className="w-12 h-12 text-white" />
            </div>
          )}

          <span
            className="absolute flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-['JetBrains_Mono'] text-white"
            style={{ top: 12, right: 12, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          >
            <StatusIcon className="w-3 h-3" style={{ color: status.color }} />
            {status.label}
          </span>

          {activeImages.length > 1 && (
            <>
              {/* Previous / next image */}
              <button
                type="button"
                onClick={showPrevImage}
                aria-label="Previous image"
                className="absolute flex items-center justify-center rounded-full text-white"
                style={{
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 32,
                  height: 32,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: hoveredNav === 'prev' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.45)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={() => setHoveredNav('prev')}
                onMouseLeave={() => setHoveredNav(null)}
                onFocus={() => setHoveredNav('prev')}
                onBlur={() => setHoveredNav(null)}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={showNextImage}
                aria-label="Next image"
                className="absolute flex items-center justify-center rounded-full text-white"
                style={{
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 32,
                  height: 32,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: hoveredNav === 'next' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.45)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={() => setHoveredNav('next')}
                onMouseLeave={() => setHoveredNav(null)}
                onFocus={() => setHoveredNav('next')}
                onBlur={() => setHoveredNav(null)}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Position counter */}
              <span
                className="absolute px-2 py-1 rounded-full text-[10px] font-['JetBrains_Mono'] text-white"
                style={{ bottom: 12, right: 12, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
              >
                {imageIndex + 1} / {activeImages.length}
              </span>

              {/* Thumbnail dots */}
              <div className="absolute flex items-center gap-1" style={{ bottom: 16, left: 12 }}>
                {activeImages.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => showImage(i)}
                    aria-label={`Go to image ${i + 1}`}
                    style={{
                      width: i === imageIndex ? 16 : 6,
                      height: 6,
                      padding: 0,
                      border: 'none',
                      borderRadius: 9999,
                      cursor: 'pointer',
                      backgroundColor: i === imageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <div className="flex items-start gap-3" style={{ marginTop: 16 }}>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: accent }}
          >
            <Folder className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className={`text-lg ${titleClass(theme)}`}>{project.title}</h3>
            <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 6 }}>
              <span className={`flex items-center gap-1.5 text-[10px] ${mutedClass(theme)}`}>
                <Calendar className="w-3 h-3" />
                Started {formatDate(project.startDate)}
              </span>
              <span className={`flex items-center gap-1.5 text-[10px] ${mutedClass(theme)}`}>
                <Layers className="w-3 h-3" />
                {techStack.length} technologies
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className={`p-4 ${panelClass(theme)}`} style={{ marginTop: 16 }}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${titleClass(theme)}`}>Progress</span>
            <span className="text-xs font-['JetBrains_Mono']" style={{ color: accent }}>
              {progress}%
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: accent }}
            />
          </div>
        </div>

        {/* About */}
        <section style={{ marginTop: 16 }}>
          <h4
            className={`text-[10px] ${mutedClass(theme)}`}
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            About this project
          </h4>
          <div className="space-y-3" style={{ marginTop: 8 }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, i) => (
                <p key={i} className={`text-xs ${mutedClass(theme)}`} style={{ lineHeight: 1.7 }}>
                  {paragraph}
                </p>
              ))
            ) : (
              <p className={`text-xs ${mutedClass(theme)}`} style={{ lineHeight: 1.7 }}>
                No description provided.
              </p>
            )}
          </div>
        </section>

        {/* Tech stack */}
        <section style={{ marginTop: 16 }}>
          <h4
            className={`text-[10px] ${mutedClass(theme)}`}
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Tech stack
          </h4>
          <div className="flex flex-wrap gap-2" style={{ marginTop: 8 }}>
            {techStack.length > 0 ? (
              techStack.map((tech) => (
                <span
                  key={tech}
                  className={`text-[10px] px-2 py-1 rounded font-['JetBrains_Mono'] ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white/70'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tech}
                </span>
              ))
            ) : (
              <span className={`text-[10px] font-['JetBrains_Mono'] ${mutedClass(theme)}`}>
                Not specified
              </span>
            )}
          </div>
        </section>

        {/* Links */}
        <div
          className="flex flex-wrap gap-2"
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-['JetBrains_Mono'] bg-[#3584e4] hover:bg-[#2f73c5] text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-['JetBrains_Mono'] transition-colors ${
                theme === 'dark'
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-400'
              }`}
            >
              <Github className="w-3 h-3" />
              Source Code
            </a>
          )}
        </div>
      </div>
    );
  }

  // ---------------- Projects grid ----------------
  return (
    <div ref={rootRef} className="w-full max-w-[700px] sm:w-[700px] p-4 sm:p-8">
      <h2 className={`text-lg sm:text-xl mb-4 sm:mb-6 font-['JetBrains_Mono'] ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        My Projects
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {projects.map((project, index) => (
          <div
            key={project.id || project._id || index}
            onClick={() => openProject(project, index)}
            className={`group relative flex flex-col p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            }`}
          >
            <div
              className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center"
              style={{ backgroundColor: getProjectColor(index) }}
            >
              <Folder className="w-6 h-6 text-white" />
            </div>

            <h3 className={`font-['JetBrains_Mono'] text-sm mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {project.title}
            </h3>

            <p
              className={`text-xs mb-3 font-['JetBrains_Mono'] line-clamp-6 ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-600'
              }`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}
            >
              {getParagraphs(project.description).join(' ') || 'No description provided.'}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {project.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className={`text-[10px] px-2 py-1 rounded font-['JetBrains_Mono'] ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white/70'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 3 && (
                <span
                  className={`text-[10px] px-2 py-1 rounded font-['JetBrains_Mono'] ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white/70'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  +{project.techStack.length - 3}
                </span>
              )}
            </div>

            {/* Details action + quick links, pinned to the bottom of every card */}
            <div className="flex items-center justify-between gap-2" style={{ marginTop: 'auto' }}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openProject(project, index);
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-['JetBrains_Mono'] transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white/80 hover:bg-white/20'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-400'
                }`}
                aria-label={`View details for ${project.title}`}
              >
                <ArrowUpRight className="w-3 h-3" />
                Details
              </button>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="p-1.5 rounded bg-[#3584e4] hover:bg-[#2f73c5] transition-colors"
                    aria-label={`Open live demo for ${project.title}`}
                  >
                    <ExternalLink className="w-3 h-3 text-white" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className={`p-1.5 rounded transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 hover:bg-white/20'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`View source code for ${project.title}`}
                  >
                    <Github className={`w-3 h-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-[#3584e4]/10' : 'bg-[#3584e4]/10'
      }`} style={{ textAlign: 'center' }}>
        <p className={`text-xs font-['JetBrains_Mono'] ${
          theme === 'dark' ? 'text-[#3584e4]' : 'text-[#2f73c5]'
        }`}>
          🚀 {projects.length} projects loaded. Click any card for full details.
        </p>
      </div>
    </div>
  );
}
