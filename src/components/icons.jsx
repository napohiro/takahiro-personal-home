// 手描き風の簡易ラインアイコン集。外部アイコンライブラリは使わず、
// すべてインラインSVGで完結させています。

const TAG_ICONS = {
  ai: (
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
  ),
  app: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9h17" />
    </>
  ),
  camp: (
    <>
      <path d="M12 4l8.5 16h-17L12 4z" />
      <path d="M12 4v16" />
    </>
  ),
  swim: (
    <>
      <path d="M2 10c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6-0.001" />
      <path d="M2 15c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6-0.001" />
    </>
  ),
  write: (
    <>
      <path d="M4 20l1-4.2L15.8 5 19 8.2 8.2 19 4 20z" />
      <path d="M13.4 6.6l3.9 3.9" />
    </>
  ),
  think: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 00-3 11.2c.8.7 1 1.3 1 1.8h4c0-.5.2-1.1 1-1.8A6 6 0 0012 3z" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3h5" />
      <path d="M10.5 3v5.6L5.7 17a2 2 0 001.7 3h9.2a2 2 0 001.7-3l-4.8-8.4V3" />
    </>
  ),
}

export function TagIcon({ name, className }) {
  const glyph = TAG_ICONS[name]
  if (!glyph) return null

  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  )
}

const DECO_ICONS = {
  grid: (
    <g stroke="currentColor" strokeWidth="1.4">
      <path d="M4 4h56v56H4z" opacity="0" />
      <path d="M14 4v56M28 4v56M42 4v56M4 14h56M4 28h56M4 42h56" />
    </g>
  ),
  code: (
    <path
      d="M22 16L8 32l14 16M42 16l14 16-14 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  mountain: (
    <path
      d="M4 46l14-22 9 12 7-9 18 19z"
      fill="currentColor"
    />
  ),
  wave: (
    <path
      d="M2 30c5-8 11-8 16 0s11 8 16 0 11-8 16 0 11 8 12 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  ),
  paper: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h24l12 12v36H14z" />
      <path d="M38 4v12h12" />
      <path d="M20 32h24M20 40h24M20 48h16" />
    </g>
  ),
  quote: (
    <path
      d="M14 16c-6 2-9 7-9 13 0 4.5 2.5 7 6.5 7S18 33.5 18 29c0-4-2.5-7-6.5-7 .3-2.3 1.8-4 4.5-5zM36 16c-6 2-9 7-9 13 0 4.5 2.5 7 6.5 7S40 33.5 40 29c0-4-2.5-7-6.5-7 .3-2.3 1.8-4 4.5-5z"
      fill="currentColor"
    />
  ),
  star: (
    <path
      d="M28 4l4.4 15.2L48 24l-15.6 4.8L28 44l-4.4-15.2L8 24l15.6-4.8L28 4z"
      fill="currentColor"
    />
  ),
  dots: (
    <g fill="currentColor">
      <circle cx="12" cy="14" r="3" />
      <circle cx="30" cy="8" r="2" />
      <circle cx="44" cy="20" r="3.5" />
      <circle cx="18" cy="34" r="2.5" />
      <circle cx="38" cy="40" r="3" />
      <circle cx="8" cy="46" r="2" />
    </g>
  ),
}

export function WorldDeco({ name, className }) {
  const glyph = DECO_ICONS[name]
  if (!glyph) return null

  return (
    <svg
      className={className}
      viewBox="0 0 56 56"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  )
}

export function LockIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 118 0v4" />
    </svg>
  )
}

export function PersonSilhouette({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 120"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="50" cy="34" r="22" />
      <path d="M50 62c-24 0-42 16-42 40v18h84V102c0-24-18-40-42-40z" />
    </svg>
  )
}
