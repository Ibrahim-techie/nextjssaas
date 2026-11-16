/**
 * A video still drawn in SVG for the landing preview: a harbour at dusk.
 * `slice` lets the same scene be cropped to any aspect ratio, which is what
 * the social image tool does to real photos.
 */
export default function DuskStill({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 90"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="Video still of a harbour at dusk"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2e3a" />
          <stop offset="0.45" stopColor="#4c6b75" />
          <stop offset="0.8" stopColor="#d99868" />
          <stop offset="1" stopColor="#f0b98a" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98a5f" />
          <stop offset="0.35" stopColor="#5a5f5c" />
          <stop offset="1" stopColor="#1a2224" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fbe3bf" />
          <stop offset="0.6" stopColor="#f6c995" stopOpacity="0.6" />
          <stop offset="1" stopColor="#f0b98a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="160" height="62" fill={`url(#${id}-sky)`} />
      <circle cx="104" cy="56" r="16" fill={`url(#${id}-sun)`} />
      <circle cx="104" cy="56" r="5" fill="#fde9c9" />

      <path
        d="M0 50 L14 44 L26 47 L40 40 L52 45 L62 43 L74 49 L84 52 L84 62 L0 62 Z"
        fill="#2b3a3f"
      />
      <path
        d="M120 52 L130 47 L142 49 L152 44 L160 46 L160 62 L120 62 Z"
        fill="#33444a"
      />

      <rect y="62" width="160" height="28" fill={`url(#${id}-sea)`} />
      <rect x="98" y="63" width="12" height="0.8" fill="#fde9c9" opacity="0.7" />
      <rect x="95" y="66" width="18" height="0.6" fill="#fde9c9" opacity="0.45" />
      <rect x="92" y="70" width="24" height="0.5" fill="#fde9c9" opacity="0.25" />

      <path d="M0 62 L48 62 L48 64 L0 65 Z" fill="#141c1e" />
      <rect x="10" y="52" width="1" height="10" fill="#141c1e" />
      <rect x="22" y="55" width="0.8" height="7" fill="#141c1e" />
      <path d="M36 62 L40 58 L41 62 Z" fill="#141c1e" />
      <path d="M56 61 L70 61 L68 63.5 L58 63.5 Z" fill="#101618" />
      <rect x="62.5" y="52" width="0.6" height="9" fill="#101618" />
      <path d="M63.1 52.5 L67.5 59.5 L63.1 59.5 Z" fill="#1d2629" />
    </svg>
  );
}
