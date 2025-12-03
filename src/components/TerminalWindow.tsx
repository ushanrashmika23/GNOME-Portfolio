import { useEffect, useState, useRef } from 'react';

interface TerminalWindowProps {
  theme: 'dark' | 'light';
  startTyping?: boolean;
}

export default function TerminalWindow({ theme, startTyping = false }: TerminalWindowProps) {
  const [displayedLines, setDisplayedLines] = useState<Array<{ type: string; text: string }>>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [canStartTyping, setCanStartTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const terminalLines = [
    { type: 'command', text: '$ whoami' },
    { type: 'command', text: 'ushan@portfolio:~$ cat welcome.txt' },
    { type: 'output', text: '' },
    { type: 'output', text: '╔═══════════════════════════════════════╗' },
    { type: 'output', text: '║    Welcome to Ushan Rashmika\'s Portfolio     ║' },
    { type: 'output', text: '╚═══════════════════════════════════════╝' },
    { type: 'output', text: '' },
    { type: 'output', text: '> Full-Stack Developer' },
    { type: 'output', text: '> Passionate about clean code and UI/UX' },
    { type: 'output', text: '> Building web applications since 2023' },
    { type: 'output', text: '' },
    { type: 'command', text: '$ ls -la skills/' },
    { type: 'output', text: '' },
    { type: 'output', text: 'drwxr-xr-x  frontend/' },
    { type: 'output', text: 'drwxr-xr-x  backend/' },
    { type: 'output', text: 'drwxr-xr-x  databases/' },
    { type: 'output', text: 'drwxr-xr-x  tools/' },
    { type: 'output', text: '' },
    { type: 'command', text: '$ cat about.txt' },
    { type: 'output', text: '' },
    { type: 'output', text: 'Hi! I\'m a passionate developer who loves creating' },
    { type: 'output', text: 'elegant solutions to complex problems.' },
    { type: 'output', text: '' },
    { type: 'output', text: 'Frontend: React, Angular, TypeScript, Tailwind' },
    { type: 'output', text: 'Backend: Node.js, Spring Boot, ExpressJs' },
    { type: 'output', text: 'Database: MYSQL, MongoDB' },
    { type: 'output', text: 'Tools: Git, Docker, AWS, Linux' },
    { type: 'output', text: '' },
    { type: 'command', text: '$ echo "Let\'s build something amazing!"' },
    { type: 'output', text: 'Let\'s build something amazing!' },
    { type: 'output', text: '' },
    { type: 'command', text: 'ushan@portfolio:~$ _' },
  ];

  // Wait for startTyping to become true before beginning animation
  useEffect(() => {
    if (startTyping) {
      const timer = setTimeout(() => {
        setCanStartTyping(true);
      }, 500); // Small delay after landing animations complete
      
      return () => clearTimeout(timer);
    }
  }, [startTyping]);

  useEffect(() => {
    if (!canStartTyping || currentLineIndex >= terminalLines.length) return;

    const currentLine = terminalLines[currentLineIndex];
    
    if (currentCharIndex < currentLine.text.length) {
      const timeout = setTimeout(() => {
        setCurrentCharIndex(currentCharIndex + 1);
      }, 20);
      return () => clearTimeout(timeout);
    } else {
      // Move to next line
      const timeout = setTimeout(() => {
        setDisplayedLines([...displayedLines, currentLine]);
        setCurrentLineIndex(currentLineIndex + 1);
        setCurrentCharIndex(0);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [canStartTyping, currentLineIndex, currentCharIndex]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [currentLineIndex, currentCharIndex]);

  const currentLine = currentLineIndex < terminalLines.length ? terminalLines[currentLineIndex] : null;
  const currentText = currentLine ? currentLine.text.slice(0, currentCharIndex) : '';

  // Atom One Dark color palette
  const atomDarkColors = {
    background: '#282c34',
    foreground: '#abb2bf',
    command: '#61afef',    // Bright blue for commands
    output: '#98c379',     // Green for output
    comment: '#5c6370',
    red: '#e06c75',
    orange: '#d19a66',
    yellow: '#e5c07b',
    green: '#98c379',
    cyan: '#56b6c2',
    blue: '#61afef',
    purple: '#c678dd',
  };

  // Atom One Light color palette
  const atomLightColors = {
    background: '#fafafa',
    foreground: '#383a42',
    command: '#4078f2',    // Blue for commands
    output: '#50a14f',     // Green for output
    comment: '#a0a1a7',
    red: '#e45649',
    orange: '#c18401',
    yellow: '#986801',
    green: '#50a14f',
    cyan: '#0184bc',
    blue: '#4078f2',
    purple: '#a626a4',
  };

  const atomColors = theme === 'dark' ? atomDarkColors : atomLightColors;

  return (
    <div 
      className={`w-full max-w-[650px] h-[500px] sm:w-[650px] p-4 sm:p-6 font-['JetBrains_Mono'] text-xs sm:text-sm overflow-auto`}
      style={{ 
        backgroundColor: atomColors.background,
        color: atomColors.foreground
      }}
    >
      <div className="flex items-center gap-2 sticky  pb-2 z-10" style={{
        backgroundColor: atomColors.background
      }}>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs m-0" style={{ color: atomColors.comment }}>
          bash
        </span>
      </div>

      <div className="space-y-1" ref={containerRef}>
        {displayedLines.map((line, index) => (
          <div 
            key={index} 
            className="whitespace-pre"
            style={{
              color: line.type === 'command' 
                ? atomColors.command
                : atomColors.output
            }}
          >
            {line.text}
          </div>
        ))}
        {currentLine && (
          <div 
            ref={scrollRef}
            className="whitespace-pre"
            style={{
              color: currentLine.type === 'command' 
                ? atomColors.command
                : atomColors.output
            }}
          >
            {currentText}
            {showCursor && (
              <span 
                className="inline-block w-2 h-4 ml-0.5"
                style={{
                  backgroundColor: atomColors.cyan
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}