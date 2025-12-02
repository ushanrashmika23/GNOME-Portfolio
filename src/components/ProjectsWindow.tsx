import { Folder, ExternalLink, Github } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProjectsWindowProps {
  theme: 'dark' | 'light';
}

interface Project {
  _id: string;
  title: string;
  description: string[];
  progress: number;
  status: string;
  startDate: string;
  githubUrl: string;
  demoUrl: string;
  techStack: string[];
  firstScreenShot: string;
}

interface ApiResponse {
  code: number;
  status: string;
  data: Project[];
}

const projectColors = ['#3584e4', '#33d17a', '#f6d32d', '#e01b24', '#9141ac', '#ff7800'];

export default function ProjectsWindow({ theme }: ProjectsWindowProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://dev-journal-backend-huozsgy77.vercel.app/projects/metaList');
        const data: ApiResponse = await response.json();
        
        if (data.code === 200 && data.status === 'success') {
          setProjects(data.data);
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

  const getProjectColor = (index: number) => {
    return projectColors[index % projectColors.length];
  };

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
  return (
    <div className="w-full max-w-[700px] sm:w-[700px] p-4 sm:p-8">
      <h2 className={`text-lg sm:text-xl mb-4 sm:mb-6 font-['JetBrains_Mono'] ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        My Projects
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {projects.map((project, index) => (
          <div
            key={project._id}
            className={`group relative p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
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

            <p className={`text-xs mb-3 font-['JetBrains_Mono'] ${
              theme === 'dark' ? 'text-white/60' : 'text-gray-600'
            }`}>
              {project.description[0]}
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

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded ${
                  theme === 'dark'
                    ? 'bg-[#3584e4] hover:bg-[#2f73c5]'
                    : 'bg-[#3584e4] hover:bg-[#2f73c5]'
                } transition-colors`}
                aria-label="View project"
              >
                <ExternalLink className="w-3 h-3 text-white" />
              </a>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-gray-300 hover:bg-gray-400'
                } transition-colors`}
                aria-label="View code"
              >
                <Github className={`w-3 h-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 p-4 rounded-lg text-center ${
        theme === 'dark' ? 'bg-[#3584e4]/10' : 'bg-[#3584e4]/10'
      }`}>
        <p className={`text-xs font-['JetBrains_Mono'] ${
          theme === 'dark' ? 'text-[#3584e4]' : 'text-[#2f73c5]'
        }`}>
          🚀 {projects.length} projects loaded.
        </p>
      </div>
    </div>
  );
}