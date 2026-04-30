const SchoolPlaceholder = () => (
    <svg
        viewBox="0 0 400 300"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ width: "100%", height: "100%" }}
    >
        {/* Sky */}
        <rect width="400" height="300" fill="#e8f4fd" />
        
        {/* Sun */}
        <circle cx="340" cy="55" r="28" fill="#fbbf24" opacity="0.9" />
        <circle cx="340" cy="55" r="20" fill="#fcd34d" />
        
        {/* Clouds */}
        <ellipse cx="80" cy="45" rx="35" ry="16" fill="white" opacity="0.8" />
        <ellipse cx="100" cy="38" rx="25" ry="18" fill="white" opacity="0.8" />
        <ellipse cx="60" cy="40" rx="20" ry="13" fill="white" opacity="0.8" />
        
        <ellipse cx="220" cy="30" rx="28" ry="13" fill="white" opacity="0.6" />
        <ellipse cx="240" cy="24" rx="20" ry="14" fill="white" opacity="0.6" />

        {/* Ground */}
        <rect x="0" y="220" width="400" height="80" fill="#86efac" />
        <rect x="0" y="240" width="400" height="60" fill="#4ade80" opacity="0.4" />

        {/* Path */}
        <polygon points="175,220 225,220 210,300 190,300" fill="#d4a574" opacity="0.7" />

        {/* Main building */}
        <rect x="90" y="120" width="220" height="105" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
        
        {/* Roof */}
        <polygon points="75,122 200,60 325,122" fill="#292382" opacity="0.85" />
        <polygon points="85,122 200,65 315,122" fill="#3730a3" opacity="0.6" />

        {/* Flag pole */}
        <line x1="200" y1="60" x2="200" y2="30" stroke="#94a3b8" strokeWidth="2" />
        <polygon points="200,30 220,38 200,46" fill="#ef4444" opacity="0.9" />

        {/* Main door */}
        <rect x="178" y="175" width="44" height="50" rx="22" fill="#292382" opacity="0.75" />
        <rect x="182" y="178" width="36" height="44" rx="18" fill="#4338ca" opacity="0.5" />
        {/* Door knob */}
        <circle cx="215" cy="203" r="2.5" fill="#fbbf24" />

        {/* Windows row */}
        {[110, 155, 245, 290].map((x, i) => (
            <g key={i}>
                <rect x={x} y="138" width="36" height="28" rx="3" fill="#bae6fd" stroke="#93c5fd" strokeWidth="1" />
                <line x1={x + 18} y1="138" x2={x + 18} y2="166" stroke="#93c5fd" strokeWidth="0.8" />
                <line x1={x} y1="152" x2={x + 36} y2="152" stroke="#93c5fd" strokeWidth="0.8" />
                {/* Window shine */}
                <rect x={x + 3} y="141" width="6" height="8" rx="1" fill="white" opacity="0.6" />
            </g>
        ))}

        {/* Steps */}
        <rect x="165" y="218" width="70" height="5" rx="1" fill="#cbd5e1" />
        <rect x="170" y="213" width="60" height="5" rx="1" fill="#e2e8f0" />

        {/* Left wing */}
        <rect x="30" y="150" width="65" height="75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
        <polygon points="22,152 63,118 105,152" fill="#292382" opacity="0.7" />
        {[38, 68].map((x, i) => (
            <rect key={i} x={x} y="165" width="24" height="20" rx="2" fill="#bae6fd" stroke="#93c5fd" strokeWidth="0.8" />
        ))}

        {/* Right wing */}
        <rect x="305" y="150" width="65" height="75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
        <polygon points="295,152 338,118 378,152" fill="#292382" opacity="0.7" />
        {[310, 340].map((x, i) => (
            <rect key={i} x={x} y="165" width="24" height="20" rx="2" fill="#bae6fd" stroke="#93c5fd" strokeWidth="0.8" />
        ))}

        {/* Trees left */}
        <rect x="48" y="195" width="5" height="28" fill="#92400e" opacity="0.7" />
        <ellipse cx="50" cy="185" rx="18" ry="22" fill="#16a34a" opacity="0.85" />
        <ellipse cx="50" cy="178" rx="12" ry="15" fill="#15803d" opacity="0.7" />

        <rect x="22" y="200" width="4" height="22" fill="#92400e" opacity="0.7" />
        <ellipse cx="24" cy="191" rx="14" ry="17" fill="#16a34a" opacity="0.75" />

        {/* Trees right */}
        <rect x="348" y="195" width="5" height="28" fill="#92400e" opacity="0.7" />
        <ellipse cx="350" cy="185" rx="18" ry="22" fill="#16a34a" opacity="0.85" />
        <ellipse cx="350" cy="178" rx="12" ry="15" fill="#15803d" opacity="0.7" />

        <rect x="372" y="200" width="4" height="22" fill="#92400e" opacity="0.7" />
        <ellipse cx="374" cy="191" rx="14" ry="17" fill="#16a34a" opacity="0.75" />

        {/* Bell tower */}
        <rect x="185" y="55" width="30" height="18" fill="#292382" opacity="0.5" />
        <circle cx="200" cy="67" r="5" fill="#fbbf24" opacity="0.9" />

        {/* Fence */}
        {Array.from({ length: 18 }).map((_, i) => (
            <rect key={i} x={10 + i * 21} y="228" width="4" height="14" rx="2" fill="#94a3b8" opacity="0.6" />
        ))}
        <line x1="10" y1="233" x2="388" y2="233" stroke="#94a3b8" strokeWidth="1.5" opacity="0.5" />
    </svg>
);


export default SchoolPlaceholder