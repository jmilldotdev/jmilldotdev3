export const AboutIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="12" cy="12" r="10">
      <animate attributeName="stroke-dasharray" values="0 63;63 0" dur="2s" begin="indefinite" repeatCount="indefinite" id="about-circle-about"/>
    </circle>
    <path d="M9,9h6v6H9z"/>
    <path d="M12,6v3"/>
    <path d="M12,15v3"/>
    <path d="M6,12h3"/>
    <path d="M15,12h3"/>
  </svg>
);