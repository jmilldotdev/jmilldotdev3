export const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <path d="M8,21H16"/>
    <path d="M12,17V21"/>
    <path d="M6,7L10,10L6,13"/>
    <path d="M13,13H17">
      <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" begin="indefinite" id="terminal-cursor-terminal"/>
    </path>
  </svg>
);