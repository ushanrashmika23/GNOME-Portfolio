import { ReactNode, useRef, useState, useEffect } from 'react';
import { Minus, X, Maximize2, User, Folder, Terminal as TerminalIcon, Wrench, Mail, GraduationCap } from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  component: string;
  initialX: number;
  initialY: number;
  zIndex: number;
  theme: 'dark' | 'light';
  children: ReactNode;
  onMove: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
}

const getWindowIcon = (component: string) => {
  switch (component) {
    case 'welcome':
      return User;
    case 'projects':
      return Folder;
    case 'terminal':
      return TerminalIcon;
    case 'skills':
      return Wrench;
    case 'contact':
      return Mail;
    case 'education':
      return GraduationCap;
    default:
      return User;
  }
};

const getWindowColor = (component: string) => {
  switch (component) {
    case 'welcome':
      return '#3584e4';
    case 'projects':
      return '#33d17a';
    case 'terminal':
      return '#f6d32d';
    case 'skills':
      return '#e01b24';
    case 'contact':
      return '#ff7800';
    case 'education':
      return '#9141ac';
    default:
      return '#3584e4';
  }
};

const getDockIconPosition = (component: string) => {
  // Get dock position - dock is centered at bottom with items
  const dockItems = ['welcome', 'projects', 'terminal', 'skills', 'education', 'contact'];
  const itemIndex = dockItems.indexOf(component);
  const itemWidth = 56; // 14 (w-14) * 4 (rem to px)
  const gap = 8; // 2 (gap-2) * 4
  const totalWidth = (itemWidth * 6) + (gap * 5);
  const dockLeft = (window.innerWidth - totalWidth) / 2;
  const iconX = dockLeft + (itemIndex * (itemWidth + gap)) + (itemWidth / 2);
  const iconY = window.innerHeight - 70; // Approximate dock position from bottom

  return { x: iconX, y: iconY };
};

export default function Window({
  id,
  title,
  component,
  initialX,
  initialY,
  zIndex,
  theme,
  children,
  onMove,
  onFocus,
  onClose,
  onMinimize,
}: WindowProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: initialX, y: initialY });
  const dragStateRef = useRef({ isDragging: false, startX: 0, startY: 0 });
  const rafRef = useRef<number>();

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    onFocus(id);

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX - positionRef.current.x,
      startY: e.clientY - positionRef.current.y,
    };

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;

    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    setIsDragging(true);
    onFocus(id);

    dragStateRef.current = {
      isDragging: true,
      startX: touch.clientX - positionRef.current.x,
      startY: touch.clientY - positionRef.current.y,
    };

    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;

      e.preventDefault();

      const newX = e.clientX - dragStateRef.current.startX;
      const newY = e.clientY - dragStateRef.current.startY;

      positionRef.current = { x: newX, y: newY };

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (windowRef.current) {
          windowRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        }
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragStateRef.current.isDragging) return;

      e.preventDefault();

      const touch = e.touches[0];
      const newX = touch.clientX - dragStateRef.current.startX;
      const newY = touch.clientY - dragStateRef.current.startY;

      positionRef.current = { x: newX, y: newY };

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (windowRef.current) {
          windowRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        }
      });
    };

    const handleMouseUp = () => {
      if (dragStateRef.current.isDragging) {
        dragStateRef.current.isDragging = false;
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        onMove(id, positionRef.current.x, positionRef.current.y);
      }
    };

    const handleTouchEnd = () => {
      if (dragStateRef.current.isDragging) {
        dragStateRef.current.isDragging = false;
        setIsDragging(false);
        document.body.style.userSelect = '';

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        onMove(id, positionRef.current.x, positionRef.current.y);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [id, onMove]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const handleMinimize = () => {
    setIsMinimizing(true);
    setTimeout(() => {
      onMinimize(id);
      setIsMinimizing(false);
    }, 400); // Slightly longer for genie effect
  };

  const Icon = getWindowIcon(component);
  const iconColor = getWindowColor(component);

  // Calculate genie effect transform
  const getGenieTransform = () => {
    if (!isMinimizing) return '';

    const dockPos = getDockIconPosition(component);
    const windowRect = windowRef.current?.getBoundingClientRect();

    if (!windowRect) return 'translate(50%, 100vh) scale(0)';

    const windowCenterX = positionRef.current.x + (windowRect.width / 2);
    const windowCenterY = positionRef.current.y + (windowRect.height / 2);

    const translateX = dockPos.x - windowCenterX;
    const translateY = dockPos.y - windowCenterY;

    return `translate(${translateX}px, ${translateY}px) scale(0.1) scaleY(0.05)`;
  };

  return (
    <div
      ref={windowRef}
      className={`absolute rounded-[12px] overflow-hidden max-w-[95vw] ${theme === 'dark'
          ? 'bg-[#242424]/95 border-[#3d3d3d]'
          : 'bg-white/95 border-gray-200'
        } border backdrop-blur-xl shadow-2xl ${!isDragging ? 'transition-all duration-300 hover:shadow-3xl' : ''
        } ${isClosing ? 'opacity-0 scale-95 transition-all duration-300' : 'opacity-100 scale-100'
        } ${isMinimizing ? 'opacity-0' : ''
        }`}
      style={{
        transform: isMinimizing
          ? getGenieTransform()
          : `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`,
        zIndex,
        willChange: isDragging ? 'transform' : 'auto',
        transition: isMinimizing
          ? 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.4s ease-out'
          : isDragging
            ? 'none'
            : 'all 0.3s',
        transformOrigin: 'center bottom',
      }}
      onClick={() => onFocus(id)}
    >
      {/* Title Bar */}
      <div
        className={`h-[36px] sm:h-[40px] ${theme === 'dark' ? 'bg-[#303030]' : 'bg-gray-100'
          } border-b ${theme === 'dark' ? 'border-[#3d3d3d]' : 'border-gray-200'
          } flex items-center justify-between px-3 sm:px-4 cursor-grab active:cursor-grabbing select-none`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 window-controls">
          <button
            onClick={handleClose}
            className={`w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-full ${theme === 'dark' ? 'bg-[#ff5f57] hover:bg-[#ff3b30]' : 'bg-[#ff5f57] hover:bg-[#ff3b30]'
              } flex items-center justify-center group transition-all`}
            aria-label="Close"
          >
            <X className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-[#4d0000] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={handleMinimize}
            className={`w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-full ${theme === 'dark' ? 'bg-[#febc2e] hover:bg-[#ffb300]' : 'bg-[#febc2e] hover:bg-[#ffb300]'
              } flex items-center justify-center group transition-all`}
            aria-label="Minimize"
          >
            <Minus className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-[#4d3900] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            className={`w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-full ${theme === 'dark' ? 'bg-[#28c840] hover:bg-[#1fb234]' : 'bg-[#28c840] hover:bg-[#1fb234]'
              } flex items-center justify-center group transition-all`}
            aria-label="Maximize"
          >
            <Maximize2 className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-[#003d00] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-none">
          <div
            className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center"
            style={{ backgroundColor: iconColor }}
          >
            <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
          </div>
          <span className={`font-['JetBrains_Mono'] text-xs sm:text-sm ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'
            }`}>
            {title}
          </span>
        </div>

        <div className="w-[50px] sm:w-[80px]" />
      </div>

      {/* Content */}
      <div className="overflow-auto max-h-[60vh] sm:max-h-[70vh]">
        {children}
      </div>
    </div>
  );
}
