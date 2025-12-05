import { useState, useEffect, useRef } from 'react';

interface BootLoaderProps {
  onComplete: () => void;
  theme: 'dark' | 'light';
}

const bootMessages = [
  { text: 'BIOS 2.8.1 - American Megatrends Inc.', delay: 800 },
  { text: 'CPU: Intel(R) Core(TM) i9-14900K @ 3.20GHz (24 cores)', delay: 150 },
  { text: 'Memory: 65536 MB DDR5 @ 6400 MHz', delay: 200 },
  { text: '[    0.000000] Linux version 6.8.0-gnome-x86_64', delay: 250 },
  { text: '[    0.123456] ACPI: Core revision 20240322', delay: 80 },
  { text: '[    0.234567] PCI: Using configuration type 1', delay: 80 },
  { text: '[    0.456789] smpboot: Allowing 24 CPUs, 0 hotplug CPUs', delay: 100 },
  { text: '[    0.789012] Console: colour dummy device 80x25', delay: 80 },
  { text: '[    1.123456] tsc: Detected 3200.000 MHz processor', delay: 90 },
  { text: '[    1.345678] Calibrating delay loop... 6400.00 BogoMIPS', delay: 400 },
  { text: '[    1.567890] Security Framework initialized', delay: 100 },
  { text: '[  OK  ] Started Early OOM Daemon', delay: 120 },
  { text: '[  OK  ] Created slice system-getty.slice', delay: 90 },
  { text: '[  OK  ] Listening on Journal Socket', delay: 80 },
  { text: '[  OK  ] Listening on udev Control Socket', delay: 80 },
  { text: '         Mounting Kernel Debug File System...', delay: 70 },
  { text: '         Starting Journal Service...', delay: 100 },
  { text: '         Starting Load Kernel Modules...', delay: 120 },
  { text: '[  OK  ] Mounted Kernel Debug File System', delay: 150 },
  { text: '[  OK  ] Finished Load Kernel Modules', delay: 180 },
  { text: '[  OK  ] Reached target Local File Systems', delay: 150 },
  { text: '         Starting Network Time Synchronization...', delay: 100 },
  { text: '[  OK  ] Started Network Time Synchronization', delay: 200 },
  { text: '[  OK  ] Started Journal Service', delay: 90 },
  { text: '[  OK  ] Reached target Network', delay: 180 },
  { text: '         Starting GNOME Display Manager...', delay: 120 },
  { text: '         Starting React.js Runtime Environment...', delay: 150 },
  { text: '         Starting TypeScript Compilation Service...', delay: 130 },
  { text: '[  OK  ] Started React.js Runtime Environment', delay: 250 },
  { text: '[  OK  ] Started TypeScript Compilation Service', delay: 200 },
  { text: '[  OK  ] Started GNOME Display Manager', delay: 300 },
  { text: '[  OK  ] Reached target Graphical Interface', delay: 250 },
  { text: '', delay: 150 },
  { text: 'Ushanrashmika23 Portfolio System [Version 1.0.0]', delay: 400 },
  { text: 'Starting desktop environment...', delay: 800 },
];

export default function BootLoader({ onComplete, theme }: BootLoaderProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Boot sequence
  useEffect(() => {
    if (currentIndex < bootMessages.length) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, bootMessages[currentIndex].text]);
        setCurrentIndex(prev => prev + 1);
      }, bootMessages[currentIndex].delay);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      // All messages displayed, wait a moment then fade out
      const completeTimer = setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 300);
      }, 200);

      return () => clearTimeout(completeTimer);
    }
  }, [currentIndex, isComplete, onComplete]);

  return (
    <div 
      className="fixed inset-0 z-[10000] flex transition-opacity duration-500 overflow-hidden"
      style={{
        backgroundColor: '#1a1d23',
        opacity: isComplete ? 0 : 1
      }}
    >
      <div className="w-full h-full p-6 overflow-y-auto">
        <div className="mb-4 flex items-center gap-3">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#33ccff' }}
          ></div>
          <div 
            className="font-['JetBrains_Mono'] text-xs"
            style={{ color: '#808080' }}
          >
            Ushanrashmika23's Portfolio Boot Loader v1.0
          </div>
        </div>

        <div className="font-['JetBrains_Mono'] text-xs leading-relaxed space-y-0.5">
          {messages.map((message, index) => (
            <div
              key={index}
              className="transition-all duration-100"
              style={{
                color: message.includes('[  OK  ]')
                  ? '#33ff33'
                  : message.includes('Starting') || message.includes('Mounting')
                  ? '#ffdd33'
                  : message.includes('BIOS') || message.includes('Linux') || message.includes('Command line') || message.includes('version')
                  ? '#ff66ff'
                  : message.includes('GNOME Portfolio System') || message.includes('Copyright') || message.includes('Starting desktop')
                  ? '#33ccff'
                  : message.includes('CPU:') || message.includes('Memory:')
                  ? '#33ffff'
                  : '#c0c0c0',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              {message}
              {index === messages.length - 1 && showCursor && (
                <span 
                  className="inline-block w-2 h-3 ml-0.5"
                  style={{ backgroundColor: '#33ff33' }}
                ></span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
