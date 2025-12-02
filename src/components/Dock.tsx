import { User, Folder, Terminal, Wrench, Mail, GraduationCap } from 'lucide-react';

interface DockProps {
  theme: 'dark' | 'light';
  windows: Array<{ id: string; component: string; minimized: boolean }>;
  onToggleWindow: (id: string) => void;
  isLoaded?: boolean;
}

const dockItems = [
  { id: 'welcome', icon: User, label: 'About Me', color: '#3584e4' },
  { id: 'projects', icon: Folder, label: 'Projects', color: '#33d17a' },
  { id: 'terminal', icon: Terminal, label: 'Terminal', color: '#f6d32d' },
  { id: 'skills', icon: Wrench, label: 'Skills', color: '#e01b24' },
  { id: 'education', icon: GraduationCap, label: 'Education & Experience', color: '#9141ac' },
  { id: 'contact', icon: Mail, label: 'Contact', color: '#ff7800' },
];

export default function Dock({ theme, windows, onToggleWindow, isLoaded = true }: DockProps) {
  return (
    <div className={`fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-[9998] transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <div className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl ${
        theme === 'dark'
          ? 'bg-black/60 border-white/20'
          : 'bg-white/60 border-gray-300'
      } backdrop-blur-xl border shadow-2xl flex items-center gap-1 sm:gap-2`}>
        {dockItems.map((item) => {
          const Icon = item.icon;
          const window = windows.find(w => w.id === item.id);
          const isActive = window && !window.minimized;
          
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onToggleWindow(item.id)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                  theme === 'dark'
                    ? 'hover:bg-white/10'
                    : 'hover:bg-black/10'
                }`}
                style={{ backgroundColor: item.color }}
                aria-label={item.label}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </button>
              
              {/* Active indicator */}
              {isActive && (
                <div 
                  className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              
              {/* Tooltip */}
              <div className={`absolute mb-4 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-['JetBrains_Mono'] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                theme === 'dark'
                  ? 'bg-black/80 text-white'
                  : 'bg-gray-900/80 text-white'
              }`}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}