export const WikiIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"/>
    <path d="M14,2V8H20"/>
    <path d="M16,13H8" strokeDasharray="8 0">
      <animate attributeName="stroke-dasharray" values="8 0;0 8;8 0" dur="1.5s" begin="indefinite" repeatCount="indefinite" id="wiki-line1-wiki"/>
      <animate attributeName="stroke-dasharray" values="8 0" dur="0.1s" begin="indefinite" fill="freeze" id="wiki-line1-stop-wiki"/>
    </path>
    <path d="M16,17H8" strokeDasharray="8 0">
      <animate attributeName="stroke-dasharray" values="8 0;0 8;8 0" dur="1.5s" begin="indefinite" repeatCount="indefinite" id="wiki-line2-wiki"/>
      <animate attributeName="stroke-dasharray" values="8 0" dur="0.1s" begin="indefinite" fill="freeze" id="wiki-line2-stop-wiki"/>
    </path>
    <path d="M10,9H8" strokeDasharray="2 0">
      <animate attributeName="stroke-dasharray" values="2 0;0 2;2 0" dur="1.5s" begin="indefinite" repeatCount="indefinite" id="wiki-line3-wiki"/>
      <animate attributeName="stroke-dasharray" values="2 0" dur="0.1s" begin="indefinite" fill="freeze" id="wiki-line3-stop-wiki"/>
    </path>
  </svg>
);