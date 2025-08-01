export const JazzIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
    <g>
      <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="2s" begin="indefinite" repeatCount="indefinite" id="jazz-body-jazz"/>
      {/* First note */}
      <path d="M8,4 L8,14"/>
      <path d="M8,4 L12,5"/>
      <ellipse cx="6" cy="14" rx="2" ry="1.5" transform="rotate(-15 6 14)"/>
      
      {/* Second note */}
      <path d="M16,6 L16,16"/>
      <path d="M16,6 L20,7"/>
      <ellipse cx="14" cy="16" rx="2" ry="1.5" transform="rotate(-15 14 16)"/>
      
      {/* Third note (smaller) */}
      <path d="M12,8 L12,15" strokeWidth="0.8"/>
      <ellipse cx="10.5" cy="15" rx="1.5" ry="1" transform="rotate(-15 10.5 15)" strokeWidth="0.8"/>
    </g>
  </svg>
);