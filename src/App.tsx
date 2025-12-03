import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isTouchDevice } from './components/ui/utils';
import { buildApiUrl, API_ENDPOINTS } from './config/api';
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
import BootLoader from './components/BootLoader';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [desktopIconPosition, setDesktopIconPosition] = useState({ x: 50, y: 100 });
  const [isBooting, setIsBooting] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [visitStartTime] = useState(() => Date.now());
  const [pageViews, setPageViews] = useState<Array<{
    url: string;
    title: string;
    timestamp: string;
    duration: number;
  }>>([]);

  // User tracking effect
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const userAgent = navigator.userAgent;
        const language = navigator.language || 'en-US';
        const screenRes = `${screen.width}x${screen.height}`;
        
        // Get comprehensive device/browser info
        const getDetailedBrowser = () => {
          const ua = userAgent.toLowerCase();
          
          // Chrome and Chrome-based browsers
          if (ua.includes('edg/')) {
            const version = userAgent.match(/edg\/(\d+\.\d+\.\d+)/i)?.[1] || 'Unknown';
            return { name: 'Microsoft Edge', version };
          }
          if (ua.includes('opr/') || ua.includes('opera/')) {
            const version = userAgent.match(/(?:opr\/|opera\/)(\d+\.\d+\.\d+)/i)?.[1] || 'Unknown';
            return { name: 'Opera', version };
          }
          if (ua.includes('brave/')) {
            const version = userAgent.match(/brave\/(\d+\.\d+\.\d+)/i)?.[1] || 'Unknown';
            return { name: 'Brave', version };
          }
          if (ua.includes('chrome/')) {
            const version = userAgent.match(/chrome\/(\d+\.\d+\.\d+)/i)?.[1] || 'Unknown';
            return { name: 'Google Chrome', version };
          }
          
          // Firefox
          if (ua.includes('firefox/')) {
            const version = userAgent.match(/firefox\/(\d+\.\d+)/i)?.[1] || 'Unknown';
            return { name: 'Mozilla Firefox', version };
          }
          
          // Safari
          if (ua.includes('safari/') && !ua.includes('chrome/')) {
            const version = userAgent.match(/version\/(\d+\.\d+)/i)?.[1] || 'Unknown';
            return { name: 'Safari', version };
          }
          
          // Internet Explorer
          if (ua.includes('trident/') || ua.includes('msie')) {
            const version = userAgent.match(/(?:msie |rv:)(\d+\.\d+)/i)?.[1] || 'Unknown';
            return { name: 'Internet Explorer', version };
          }
          
          return { name: 'Unknown Browser', version: 'Unknown' };
        };
        
        // Get detailed OS info
        const getDetailedOS = () => {
          const ua = userAgent;
          
          // Windows
          if (ua.includes('Windows NT 10.0')) {
            if (ua.includes('Windows NT 10.0; Win64; x64')) return { name: 'Windows', version: '10/11 (64-bit)' };
            return { name: 'Windows', version: '10/11' };
          }
          if (ua.includes('Windows NT 6.3')) return { name: 'Windows', version: '8.1' };
          if (ua.includes('Windows NT 6.2')) return { name: 'Windows', version: '8' };
          if (ua.includes('Windows NT 6.1')) return { name: 'Windows', version: '7' };
          if (ua.includes('Windows NT')) return { name: 'Windows', version: 'Legacy' };
          
          // macOS
          if (ua.includes('Mac OS X')) {
            const version = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
            return { name: 'macOS', version };
          }
          
          // Linux
          if (ua.includes('Linux')) {
            if (ua.includes('Ubuntu')) return { name: 'Ubuntu Linux', version: 'Unknown' };
            if (ua.includes('Fedora')) return { name: 'Fedora Linux', version: 'Unknown' };
            if (ua.includes('SUSE')) return { name: 'SUSE Linux', version: 'Unknown' };
            return { name: 'Linux', version: 'Unknown Distribution' };
          }
          
          // Mobile OS
          if (ua.includes('iPhone OS') || ua.includes('iOS')) {
            const version = ua.match(/(?:iPhone )?OS (\d+[._]\d+[._]?\d*)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
            return { name: 'iOS', version };
          }
          if (ua.includes('Android')) {
            const version = ua.match(/Android (\d+\.?\d*\.?\d*)/)?.[1] || 'Unknown';
            return { name: 'Android', version };
          }
          
          return { name: 'Unknown OS', version: 'Unknown' };
        };

        // Get detailed device info
        const getDetailedDevice = () => {
          const ua = userAgent;
          const width = screen.width;
          const height = screen.height;
          
          // Mobile devices
          if (/iPhone/i.test(ua)) {
            if (width >= 414) return { type: 'mobile', model: 'iPhone Pro/Plus', screenResolution: `${width}x${height}` };
            return { type: 'mobile', model: 'iPhone', screenResolution: `${width}x${height}` };
          }
          if (/iPad/i.test(ua)) {
            return { type: 'tablet', model: 'iPad', screenResolution: `${width}x${height}` };
          }
          if (/Android/i.test(ua)) {
            if (width >= 768) return { type: 'tablet', model: 'Android Tablet', screenResolution: `${width}x${height}` };
            return { type: 'mobile', model: 'Android Phone', screenResolution: `${width}x${height}` };
          }
          
          // Desktop - detect by resolution
          if (width >= 1920) return { type: 'desktop', model: 'High-res Desktop', screenResolution: `${width}x${height}` };
          if (width >= 1366) return { type: 'desktop', model: 'Standard Desktop', screenResolution: `${width}x${height}` };
          if (width >= 1024) return { type: 'laptop', model: 'Laptop', screenResolution: `${width}x${height}` };
          
          return { type: 'unknown', model: 'Unknown Device', screenResolution: `${width}x${height}` };
        };

        const browser = getDetailedBrowser();
        const os = getDetailedOS();
        const device = getDetailedDevice();
        
        // Get more accurate IP and location data with fallbacks
        let locationData = {
          country: 'Unknown',
          city: 'Unknown',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          coordinates: { lat: 0, lng: 0 }
        };
        let ipAddress = 'Unknown';

        // Try multiple IP services for better accuracy
        const ipServices = [
          'https://ipapi.co/json/',
          'https://api.ipify.org?format=json',
          'https://httpbin.org/ip'
        ];

        for (const service of ipServices) {
          try {
            const response = await fetch(service);
            const data = await response.json();
            
            if (service.includes('ipapi.co')) {
              locationData = {
                country: data.country_name || 'Unknown',
                city: data.city || 'Unknown',
                timezone: data.timezone || locationData.timezone,
                coordinates: {
                  lat: parseFloat(data.latitude) || 0,
                  lng: parseFloat(data.longitude) || 0
                }
              };
              ipAddress = data.ip || 'Unknown';
              break; // Use ipapi.co if available (most detailed)
            } else if (service.includes('ipify')) {
              ipAddress = data.ip || 'Unknown';
              // Continue to try getting location from other services
            } else if (service.includes('httpbin')) {
              ipAddress = data.origin?.split(',')[0] || 'Unknown';
            }
          } catch (error) {
            continue; // Try next service
          }
        }

        // Get additional browser capabilities
        const getCapabilities = () => {
          return {
            cookiesEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            language: navigator.language,
            languages: navigator.languages || [navigator.language],
            platform: navigator.platform,
            doNotTrack: navigator.doNotTrack === '1',
            onlineStatus: navigator.onLine,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            availableScreenSize: `${screen.availWidth}x${screen.availHeight}`,
            timezoneOffset: new Date().getTimezoneOffset()
          };
        };

        const capabilities = getCapabilities();

        const currentUrl = window.location.href;
        const currentTitle = document.title;
        const referrer = document.referrer || 'direct';
        
        const trackingData = {
          sessionId,
          ipAddress,
          userAgent,
          location: locationData,
          device,
          browser: {
            name: browser.name,
            version: browser.version,
            language: capabilities.language,
            capabilities
          },
          os,
          pageViews: [{
            url: currentUrl,
            title: currentTitle,
            timestamp: new Date().toISOString(),
            duration: 0
          }],
          landingPage: currentUrl,
          currentPage: currentUrl,
          referrer,
          isNewVisitor: !localStorage.getItem('portfolio_visitor'),
          visitCount: parseInt(localStorage.getItem('portfolio_visit_count') || '0') + 1,
          sessionData: {
            startTime: new Date().toISOString(),
            timeZone: locationData.timezone,
            screenInfo: {
              total: device.screenResolution,
              available: capabilities.availableScreenSize,
              colorDepth: capabilities.colorDepth,
              pixelDepth: capabilities.pixelDepth
            }
          }
        };

        // Update localStorage
        localStorage.setItem('portfolio_visitor', 'true');
        localStorage.setItem('portfolio_visit_count', trackingData.visitCount.toString());

        // Send tracking data
        await fetch(buildApiUrl(API_ENDPOINTS.VISITORS), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackingData),
        });
        
        // Set initial page view
        setPageViews([{
          url: currentUrl,
          title: currentTitle,
          timestamp: new Date().toISOString(),
          duration: 0
        }]);

      } catch (error) {
        // Silent error handling - no console logs
      }
    };

    // Track visitor on component mount
    trackVisitor();

    // Track page duration on beforeunload
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - visitStartTime) / 1000);
      navigator.sendBeacon(buildApiUrl(API_ENDPOINTS.VISITORS_UPDATE), JSON.stringify({
        sessionId,
        duration,
        timestamp: new Date().toISOString()
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, visitStartTime]);
  const [windows, setWindows] = useState(() => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const isDesktop = screenWidth >= 768; // md breakpoint

    // Calculate center X position for new windows (assume 500px width)
    const centerX = (screenWidth - 500) / 2;
    
    // Calculate bottom right position for welcome window (assume 550px width, 500px height)
    const welcomeX = screenWidth - 550 - 50; // 50px padding from right
    const welcomeY = screenHeight - 500 - 200; // 200px padding from bottom (including topbar and dock)

    // Terminal centered on desktop, top-left on mobile
    const terminalX = isDesktop ? (screenWidth - 1000) / 2 : 10;
    const terminalY = isDesktop ? (screenHeight - 700) / 2 - 20 : 10;

    return [
      {
        id: 'welcome',
        component: 'welcome',
        x: welcomeX,
        y: welcomeY,
        zIndex: 1,
        minimized: false
      },
      {
        id: 'terminal',
        component: 'terminal',
        x: terminalX,
        y: terminalY,
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

  // Landing animation effect (after boot)
  useEffect(() => {
    if (!isBooting) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100); // Small delay for smooth transition

      return () => clearTimeout(timer);
    }
  }, [isBooting]);

  // Terminal typing animation trigger - after all other animations complete
  const [startTerminalTyping, setStartTerminalTyping] = useState(false);
  
  useEffect(() => {
    if (isLoaded) {
      // Start terminal typing after all landing animations complete
      // Dock animation has 500ms delay, so we wait a bit longer
      const timer = setTimeout(() => {
        setStartTerminalTyping(true);
      }, 1200); // Wait for all landing animations to finish
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const handleBootComplete = () => {
    setIsBooting(false);
  };

  const renderWindowContent = (component: string) => {
    switch (component) {
      case 'welcome':
        return <WelcomeWindow theme={theme} />;
      case 'projects':
        return <ProjectsWindow theme={theme} />;
      case 'terminal':
        return <TerminalWindow theme={theme} startTyping={startTerminalTyping} />;
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
    <>
      {isBooting && <BootLoader onComplete={handleBootComplete} theme={theme} />}
      <DndProvider backend={dndBackend} options={backendOptions}>
        <div className={`${theme} h-full w-full overflow-hidden fixed inset-0 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
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
    </>
  );
}