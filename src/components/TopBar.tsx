import { Sun, Moon, Mail, Wifi, WifiOff, Battery, BatteryLow, Plug } from 'lucide-react';
import { useEffect, useState } from 'react';
import me from './../../img/me.png';
interface TopBarProps {
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  windows: Array<{ id: string; component: string; minimized: boolean }>;
  onRestoreWindow: (id: string) => void;
  onOpenContact: () => void;
}

export default function TopBar({ theme, onThemeToggle, windows, onRestoreWindow, onOpenContact }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [batterySupported, setBatterySupported] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Battery API functionality
    const getBatteryInfo = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          const updateBattery = () => {
            setBatteryLevel(Math.round(battery.level * 100));
            setIsCharging(battery.charging);
          };

          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingchange', updateBattery);

          return () => {
            battery.removeEventListener('levelchange', updateBattery);
            battery.removeEventListener('chargingchange', updateBattery);
          };
        } else {
          setBatterySupported(false);
        }
      } catch (error) {
        setBatterySupported(false);
      }
    };

    getBatteryInfo();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWindowTitle = (component: string) => {
    switch (component) {
      case 'welcome':
        return 'About';
      case 'projects':
        return 'Projects';
      case 'terminal':
        return 'Terminal';
      case 'skills':
        return 'Skills';
      case 'contact':
        return 'Contact';
      case 'education':
        return 'Education & Experience';
      default:
        return '';
    }
  };

  const getBatteryIcon = () => {
    if (!batterySupported || batteryLevel === null) return null;

    if (isCharging) {
      return <Plug className="w-4 h-4" />;
    } else if (batteryLevel <= 20) {
      return <BatteryLow className="w-4 h-4" />;
    } else {
      return <Battery className="w-4 h-4" />;
    }
  };

  const getBatteryColor = () => {
    if (!batterySupported || batteryLevel === null) return '';

    if (isCharging) {
      return theme === 'dark' ? 'text-green-400' : 'text-green-600';
    } else if (batteryLevel <= 20) {
      return theme === 'dark' ? 'text-red-400' : 'text-red-600';
    } else if (batteryLevel <= 50) {
      return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    } else {
      return theme === 'dark' ? 'text-white/80' : 'text-gray-700';
    }
  };

  const minimizedWindows = windows.filter(w => w.minimized);

  return (
    <div className={`fixed top-0 left-0 right-0 h-[40px] ${theme === 'dark'
      ? 'bg-black/80 text-white/90'
      : 'bg-white/80 text-gray-900'
      } backdrop-blur-xl border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'
      } flex items-center justify-between px-4 z-[9999]`}>
      <div className="flex items-center gap-4">
        <span className="font-['JetBrains_Mono'] text-sm flex items-center gap-2">
          <img src={me} alt="img" className='w-5 h-5 rounded-full' />
          <span className="hidden md:inline">Ushan</span>Rashmika
        </span>

        {minimizedWindows.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            {minimizedWindows.map(window => (
              <button
                key={window.id}
                onClick={() => onRestoreWindow(window.id)}
                className={`px-3 py-1 rounded-md text-xs font-['JetBrains_Mono'] transition-all ${theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-black/10 hover:bg-black/15'
                  }`}
              >
                {getWindowTitle(window.component)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center md:absolute md:left-1/2 md:-translate-x-1/2">
        <span className="font-['JetBrains_Mono'] text-sm">{formatTime(time)}</span>
        <span className="font-['JetBrains_Mono'] text-[10px] opacity-60">{formatDate(time)}</span>
      </div>

      <div className="flex items-center gap-0">
        <button
          onClick={onThemeToggle}
          className={`p-2 rounded-full transition-all ${theme === 'dark'
            ? 'hover:bg-white/10'
            : 'hover:bg-black/10'
            }`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {batterySupported && batteryLevel !== null && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded ${getBatteryColor()}`}
            title={`Battery: ${batteryLevel}% ${isCharging ? '(Charging)' : ''}`}
          >
            {getBatteryIcon()}
            <span className="text-xs font-['JetBrains_Mono']">{batteryLevel}%</span>
          </div>
        )}
        <div
          className={`p-2 rounded-full ${isOnline
            ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
            : theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}
          title={isOnline ? 'Connected' : 'Disconnected'}
        >
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        </div>

        {/* <button
          onClick={onOpenContact}
          className={`p-2 rounded-full transition-all ${theme === 'dark'
            ? 'hover:bg-white/10'
            : 'hover:bg-black/10'
            }`}
          aria-label="Open contact"
        >
          <Mail className="w-4 h-4" />
        </button> */}

      </div>
    </div>
  );
}