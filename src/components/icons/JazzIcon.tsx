export const JazzIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
    <g transform="translate(12, 12) scale(1.4)">
      <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="2s" begin="indefinite" repeatCount="indefinite" id="jazz-body-jazz" additive="sum"/>
      {/* First note */}
      <path d="M-4,-6 L-4,2"/>
      <path d="M-4,-6 L0,-5"/>
      <ellipse cx="-6" cy="2" rx="2" ry="1.5" transform="rotate(-15 -6 2)"/>
      
      {/* Second note */}
      <path d="M4,-4 L4,4"/>
      <path d="M4,-4 L8,-3"/>
      <ellipse cx="2" cy="4" rx="2" ry="1.5" transform="rotate(-15 2 4)"/>
      
      {/* Third note (smaller) */}
      <path d="M0,-2 L0,3" strokeWidth="0.8"/>
      <ellipse cx="-1.5" cy="3" rx="1.5" ry="1" transform="rotate(-15 -1.5 3)" strokeWidth="0.8"/>
    </g>
  </svg>
);