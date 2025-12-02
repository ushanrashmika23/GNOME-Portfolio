import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isTouchDevice } from './components/ui/utils';
import TopBar from './components/TopBar';
import Dock from './components/Dock';
import Window from './components/Window';
import WelcomeWindow from './components/WelcomeWindow';
import ProjectsWindow from './components/ProjectsWindow';
import TerminalWindow from './components/TerminalWindow';
import SkillsWindow from './components/SkillsWindow';
import ContactWindow from './components/ContactWindow';
import EducationExperienceWindow from './components/EducationExperienceWindow';
import DesktopIcon from './components/DesktopIcon';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [desktopIconPosition, setDesktopIconPosition] = useState({ x: 50, y: 100 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [windows, setWindows] = useState(() => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    // Calculate center X position for new windows (assume 500px width)
    const centerX = (screenWidth - 500) / 2;

    return [
      {
        id: 'welcome',
        component: 'welcome',
        x: screenWidth - 550,
        y: screenHeight - 700,
        zIndex: 1,
        minimized: false
      },
      {
        id: 'terminal',
        component: 'terminal',
        x: (screenWidth - 950) / 2,
        y: (screenHeight - 600) / 2 - 20,
        zIndex: 2,
        minimized: false
      },
      { id: 'projects', component: 'projects', x: centerX, y: 0, zIndex: 3, minimized: true },
      { id: 'skills', component: 'skills', x: centerX, y: 60, zIndex: 4, minimized: true },
      { id: 'education', component: 'education', x: centerX, y: 120, zIndex: 5, minimized: true },
      { id: 'contact', component: 'contact', x: centerX, y: 180, zIndex: 6, minimized: true },
    ];
  });

  // Determine which backend to use based on device capabilities
  const dndBackend = isTouchDevice() ? TouchBackend : HTML5Backend;
  const backendOptions = isTouchDevice() ? {
    enableMouseEvents: true, // Allow mouse events on touch devices too
    enableHoverOutsideTarget: false,
    enableKeyboardEvents: false,
  } : {};

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const focusWindow = (id: string) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex));
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
  };

  const closeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: true } : w));
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: true } : w));
  };

  const restoreWindow = (id: string) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex));
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: false, zIndex: maxZ + 1 } : w));
  };

  const toggleWindow = (id: string) => {
    const window = windows.find(w => w.id === id);
    if (window?.minimized) {
      restoreWindow(id);
    } else {
      minimizeWindow(id);
    }
  };

  const openContactWindow = () => {
    restoreWindow('contact');
  };

  const closeAllWindows = () => {
    setWindows(windows.map(w => ({ ...w, minimized: true })));
  };

  const moveDesktopIcon = (x: number, y: number) => {
    setDesktopIconPosition({ x, y });
  };

  // Landing animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100); // Small delay for smooth transition

    return () => clearTimeout(timer);
  }, []);

  const renderWindowContent = (component: string) => {
    switch (component) {
      case 'welcome':
        return <WelcomeWindow theme={theme} />;
      case 'projects':
        return <ProjectsWindow theme={theme} />;
      case 'terminal':
        return <TerminalWindow theme={theme} />;
      case 'skills':
        return <SkillsWindow theme={theme} />;
      case 'education':
        return <EducationExperienceWindow theme={theme} />;
      case 'contact':
        return <ContactWindow theme={theme} />;
      default:
        return null;
    }
  };

  const getWindowTitle = (component: string) => {
    switch (component) {
      case 'welcome':
        return 'About Me';
      case 'projects':
        return 'Projects';
      case 'terminal':
        return 'Terminal';
      case 'skills':
        return 'Skills';
      case 'education':
        return 'Education & Experience';
      case 'contact':
        return 'Contact';
      default:
        return '';
    }
  };

  return (
    <DndProvider backend={dndBackend} options={backendOptions}>
      <div className={`${theme} h-screen w-full overflow-hidden fixed inset-0 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`h-full w-full ${theme === 'dark' ? 'bg-dark-wallpaper' : 'bg-light-wallpaper'} bg-cover bg-center relative overflow-hidden transition-all duration-700 ${isLoaded ? 'scale-100' : 'scale-105 blur-sm'}`}>
          <TopBar
            theme={theme}
            onThemeToggle={toggleTheme}
            windows={windows}
            onRestoreWindow={restoreWindow}
            onOpenContact={openContactWindow}
            onCloseAllWindows={closeAllWindows}
            isLoaded={isLoaded}
          />

          <div className={`relative w-full h-[calc(100vh-40px)] mt-[40px] overflow-hidden transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Desktop Icons */}
            <DesktopIcon
              theme={theme}
              x={desktopIconPosition.x}
              y={desktopIconPosition.y}
              onMove={moveDesktopIcon}
              isLoaded={isLoaded}
            />

            {windows.filter(w => !w.minimized).map((window, index) => (
              <Window
                key={window.id}
                id={window.id}
                title={getWindowTitle(window.component)}
                component={window.component}
                initialX={window.x}
                initialY={window.y}
                zIndex={window.zIndex}
                theme={theme}
                onMove={moveWindow}
                onFocus={focusWindow}
                onClose={closeWindow}
                onMinimize={minimizeWindow}
                animationDelay={index * 150 + 400}
                isLoaded={isLoaded}
              >
                {renderWindowContent(window.component)}
              </Window>
            ))}
          </div>

          <Dock
            theme={theme}
            windows={windows}
            onToggleWindow={toggleWindow}
            isLoaded={isLoaded}
          />
        </div>
      </div>
    </DndProvider>
  );
}