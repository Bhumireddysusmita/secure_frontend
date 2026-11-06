// Decorative SVG illustrations in the brand's indigo/violet style. All are aria-hidden.

/** Landing hero: glowing shield with a padlock, orbit ring and floating ID / check cards. */
export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 440" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="h-glow" cx="50%" cy="55%" r="50%">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.45" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="h-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c83ff" />
          <stop offset="0.55" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="h-shield-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7d2fe" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="h-lock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe3ff" />
        </linearGradient>
        <linearGradient id="h-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#e0e3ff" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="h-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <filter id="h-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      <ellipse cx="250" cy="230" rx="230" ry="190" fill="url(#h-glow)" />

      {/* platform */}
      <ellipse cx="240" cy="360" rx="170" ry="38" fill="url(#h-base)" opacity="0.55" />
      <ellipse cx="240" cy="352" rx="150" ry="30" fill="#c7d2fe" opacity="0.7" />
      <ellipse cx="240" cy="352" rx="150" ry="30" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" />

      {/* orbit ring behind */}
      <ellipse cx="240" cy="215" rx="205" ry="62" fill="none" stroke="#a78bfa" strokeOpacity="0.45" strokeWidth="3" transform="rotate(-14 240 215)" />

      {/* shield */}
      <g className="animate-float" style={{ transformOrigin: "240px 200px" }}>
        <path d="M240 40 125 82v92c0 78 49 141 115 168 66-27 115-90 115-168V82L240 40Z" fill="#312e81" opacity="0.3" filter="url(#h-soft)" transform="translate(6 14)" />
        <path d="M240 40 125 82v92c0 78 49 141 115 168 66-27 115-90 115-168V82L240 40Z" fill="url(#h-shield)" />
        <path d="M240 40 125 82v92c0 78 49 141 115 168 66-27 115-90 115-168V82L240 40Z" fill="none" stroke="url(#h-shield-edge)" strokeWidth="6" />
        <path d="M240 64 147 98v76c0 64 39 116 93 140V64Z" fill="#fff" opacity="0.1" />
        {/* padlock */}
        <path d="M207 168v-26a33 33 0 0 1 66 0v26" fill="none" stroke="url(#h-lock)" strokeWidth="16" strokeLinecap="round" />
        <rect x="188" y="160" width="104" height="92" rx="18" fill="url(#h-lock)" />
        <rect x="188" y="160" width="104" height="18" rx="9" fill="#fff" opacity="0.8" />
        <circle cx="240" cy="200" r="12" fill="#3730a3" />
        <rect x="235" y="204" width="10" height="26" rx="5" fill="#3730a3" />
      </g>

      {/* orbit ring front arc */}
      <path d="M48 247c40 34 150 47 262 22" fill="none" stroke="#c4b5fd" strokeWidth="3.5" strokeLinecap="round" transform="rotate(-14 240 215)" />
      <circle cx="58" cy="226" r="6" fill="#a78bfa" />
      <circle cx="430" cy="140" r="5" fill="#818cf8" />

      {/* ID card */}
      <g transform="translate(355 200) rotate(-6)">
        <rect width="132" height="104" rx="16" fill="url(#h-card)" stroke="#fff" strokeWidth="2" />
        <circle cx="38" cy="44" r="15" fill="#6366f1" />
        <path d="M18 80c3-12 11-17 20-17s17 5 20 17" fill="#6366f1" />
        <rect x="70" y="32" width="46" height="8" rx="4" fill="#a5b4fc" />
        <rect x="70" y="50" width="38" height="8" rx="4" fill="#c7d2fe" />
        <rect x="70" y="68" width="44" height="8" rx="4" fill="#c7d2fe" />
      </g>

      {/* check card */}
      <g transform="translate(300 300) rotate(-6)">
        <rect width="130" height="76" rx="14" fill="url(#h-card)" stroke="#fff" strokeWidth="2" />
        <circle cx="34" cy="38" r="18" fill="#22c55e" />
        <path d="m25 38 6.5 6.5L43 33" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="64" y="26" width="48" height="7" rx="3.5" fill="#a5b4fc" />
        <rect x="64" y="43" width="36" height="7" rx="3.5" fill="#c7d2fe" />
      </g>

      {/* sparkles */}
      <path d="M96 92l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#818cf8" opacity="0.8" />
      <g fill="#a5b4fc">
        <circle cx="455" cy="40" r="3" /><circle cx="470" cy="40" r="3" /><circle cx="485" cy="40" r="3" />
        <circle cx="455" cy="55" r="3" /><circle cx="470" cy="55" r="3" /><circle cx="485" cy="55" r="3" />
        <circle cx="455" cy="70" r="3" /><circle cx="470" cy="70" r="3" /><circle cx="485" cy="70" r="3" />
      </g>
    </svg>
  );
}

/** Auth panels: laptop with a padlock on screen and a shield beside it. Drawn for a dark indigo background. */
export function LaptopShieldIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 260" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="l-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#3730a3" />
        </linearGradient>
        <linearGradient id="l-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7d2fe" />
          <stop offset="1" stopColor="#8b93f8" />
        </linearGradient>
        <linearGradient id="l-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <radialGradient id="l-glow" cx="50%" cy="60%" r="50%">
          <stop offset="0" stopColor="#c4b5fd" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="160" rx="170" ry="100" fill="url(#l-glow)" />
      <ellipse cx="170" cy="228" rx="150" ry="18" fill="#1e1b4b" opacity="0.35" />

      {/* laptop screen */}
      <g transform="translate(60 40)">
        <path d="M14 0h164a14 14 0 0 1 14 14v118H0V14A14 14 0 0 1 14 0Z" fill="#e0e7ff" />
        <rect x="10" y="10" width="172" height="114" rx="8" fill="url(#l-screen)" />
        <path d="M80 62v-12a16 16 0 0 1 32 0v12" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        <rect x="70" y="58" width="52" height="44" rx="9" fill="#fff" />
        <circle cx="96" cy="77" r="6" fill="#4338ca" />
        <rect x="93.5" y="79" width="5" height="12" rx="2.5" fill="#4338ca" />
        {/* base */}
        <path d="M-18 132h228l-12 22H-6Z" fill="url(#l-body)" />
        <rect x="70" y="134" width="52" height="5" rx="2.5" fill="#6366f1" opacity="0.6" />
      </g>

      {/* shield */}
      <g transform="translate(250 70)" className="animate-float">
        <path d="M45 0 0 16v36c0 30 19 55 45 66 26-11 45-36 45-66V16L45 0Z" fill="url(#l-shield)" />
        <path d="M45 0 0 16v36c0 30 19 55 45 66 26-11 45-36 45-66V16L45 0Z" fill="none" stroke="#e0e7ff" strokeOpacity="0.8" strokeWidth="3" />
        <path d="m27 58 12 12 24-26" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* dots */}
      <g fill="#c7d2fe" opacity="0.6">
        <circle cx="300" cy="20" r="3" /><circle cx="314" cy="20" r="3" /><circle cx="328" cy="20" r="3" />
        <circle cx="300" cy="34" r="3" /><circle cx="314" cy="34" r="3" /><circle cx="328" cy="34" r="3" />
      </g>
      <path d="M30 70l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#e0e7ff" opacity="0.8" />
    </svg>
  );
}

/** Sign-up panel: account card with a shield badge, drawn for a dark indigo background. */
export function AccountShieldIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 260" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="a-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe3ff" />
        </linearGradient>
        <linearGradient id="a-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <radialGradient id="a-glow" cx="50%" cy="60%" r="50%">
          <stop offset="0" stopColor="#c4b5fd" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="150" rx="170" ry="105" fill="url(#a-glow)" />
      <ellipse cx="170" cy="232" rx="140" ry="16" fill="#1e1b4b" opacity="0.35" />

      {/* back card */}
      <g transform="translate(70 60) rotate(-8)">
        <rect width="180" height="130" rx="18" fill="#a5b4fc" opacity="0.55" />
      </g>
      {/* front card: profile form */}
      <g transform="translate(70 70)">
        <rect width="190" height="140" rx="18" fill="url(#a-card)" />
        <circle cx="46" cy="52" r="22" fill="#6366f1" />
        <circle cx="46" cy="46" r="8" fill="#fff" />
        <path d="M32 66c3-8 8-11 14-11s11 3 14 11" fill="#fff" />
        <rect x="84" y="36" width="80" height="10" rx="5" fill="#a5b4fc" />
        <rect x="84" y="56" width="60" height="10" rx="5" fill="#c7d2fe" />
        <rect x="24" y="96" width="142" height="12" rx="6" fill="#e0e7ff" />
        <rect x="24" y="116" width="90" height="12" rx="6" fill="#6366f1" />
      </g>
      {/* shield badge */}
      <g transform="translate(232 128)" className="animate-float">
        <path d="M36 0 0 13v29c0 24 15 44 36 53 21-9 36-29 36-53V13L36 0Z" fill="url(#a-shield)" />
        <path d="M36 0 0 13v29c0 24 15 44 36 53 21-9 36-29 36-53V13L36 0Z" fill="none" stroke="#e0e7ff" strokeOpacity="0.8" strokeWidth="3" />
        <path d="M26 42v-6a10 10 0 0 1 20 0v6" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <rect x="21" y="40" width="30" height="25" rx="6" fill="#fff" />
        <circle cx="36" cy="52" r="3.5" fill="#4338ca" />
      </g>
      <path d="M40 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#e0e7ff" opacity="0.8" />
      <g fill="#c7d2fe" opacity="0.6">
        <circle cx="300" cy="30" r="3" /><circle cx="314" cy="30" r="3" /><circle cx="328" cy="30" r="3" />
        <circle cx="300" cy="44" r="3" /><circle cx="314" cy="44" r="3" /><circle cx="328" cy="44" r="3" />
      </g>
    </svg>
  );
}
