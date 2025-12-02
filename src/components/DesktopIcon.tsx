import { FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface DesktopIconProps {
  theme: 'dark' | 'light';
  x: number;
  y: number;
  onMove?: (x: number, y: number) => void;
}

export default function DesktopIcon({ theme, x, y, onMove }: DesktopIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const dragStateRef = useRef({ isDragging: false, startX: 0, startY: 0, clickTime: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const handleClick = (e: React.MouseEvent) => {
    // Only open link if not dragging and was a quick click
    const clickDuration = Date.now() - dragStateRef.current.clickTime;
    if (!dragStateRef.current.isDragging && clickDuration < 200) {
      e.preventDefault();
      window.open('https://developer-journal.vercel.app/', '_blank');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsSelected(true);
    setIsDragging(true);
    
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
      clickTime: Date.now()
    };

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;
      
      e.preventDefault();
      
      const newX = e.clientX - dragStateRef.current.startX;
      const newY = e.clientY - dragStateRef.current.startY;
      
      const constrainedX = Math.max(0, Math.min(window.innerWidth - 100, newX));
      const constrainedY = Math.max(40, Math.min(window.innerHeight - 120, newY));
      
      setPosition({ x: constrainedX, y: constrainedY });
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        if (iconRef.current) {
          iconRef.current.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
        }
      });
    };

    const handleMouseUp = () => {
      if (dragStateRef.current.isDragging) {
        setIsDragging(false);
        onMove?.(position.x, position.y);
      }
      
      dragStateRef.current.isDragging = false;
      setIsSelected(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [position, onMove]);

  return (
    <div 
      ref={iconRef}
      className={`absolute select-none ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}`}
      style={{ 
        left: 0, 
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        willChange: isDragging ? 'transform' : 'auto'
      }}
      onClick={handleClick}
      onMouseEnter={() => !isDragging && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsSelected(false);
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
        isDragging ? 'duration-0' : 'duration-200'
      } ${
        isSelected || isHovered
          ? theme === 'dark'
            ? 'bg-white/10 backdrop-blur-sm'
            : 'bg-black/10 backdrop-blur-sm'
          : ''
      } ${isDragging ? 'scale-105 shadow-2xl' : ''}`}>
        <div 
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
            isDragging ? 'duration-0' : 'duration-200'
          } ${
            isHovered || isSelected ? 'scale-110' : 'scale-100'
          }`}
          style={{ backgroundColor: '#f6d32d' }}
        >
          <FileText className="w-6 h-6 text-white" />
        </div>
        <span className={`text-xs font-['JetBrains_Mono'] text-center max-w-[80px] leading-tight ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        } ${isSelected ? 'bg-blue-500/30 px-1 rounded' : ''}`}>
          Read Journal
        </span>
      </div>
    </div>
  );
}