// Shared outline-style SVG icons for all resident types.
// Consistent style: fill="none", stroke={color}, strokeWidth="1.8",
// strokeLinecap="round", strokeLinejoin="round".
// Eyes/pupils use fill={color} only on small circles.

const fox = (c, size = 22) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none"
    stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6,15 10,4 15,14" />
    <polygon points="26,15 22,4 17,14" />
    <ellipse cx="16" cy="19" rx="9" ry="7" />
    <circle cx="12" cy="17" r="1.5" fill={c} stroke="none" />
    <circle cx="20" cy="17" r="1.5" fill={c} stroke="none" />
  </svg>
)

const bee = (c, size = 22) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none"
    stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="10" cy="12" rx="6" ry="3" strokeOpacity="0.5" transform="rotate(-25 10 12)" />
    <ellipse cx="22" cy="12" rx="6" ry="3" strokeOpacity="0.5" transform="rotate(25 22 12)" />
    <ellipse cx="16" cy="20" rx="5" ry="6" />
    <line x1="11" y1="18.5" x2="21" y2="18.5" strokeOpacity="0.4" />
    <line x1="11" y1="22" x2="21" y2="22" strokeOpacity="0.4" />
    <circle cx="16" cy="12" r="4" />
    <line x1="14" y1="9" x2="11" y2="4" />
    <line x1="18" y1="9" x2="21" y2="4" />
    <circle cx="11" cy="4" r="1.5" fill={c} stroke="none" />
    <circle cx="21" cy="4" r="1.5" fill={c} stroke="none" />
  </svg>
)

const bird = (c, size = 22) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none"
    stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16 Q10 8 2 11 Q7 14 16 16" />
    <path d="M16 16 Q22 8 30 11 Q25 14 16 16" />
    <ellipse cx="16" cy="18" rx="4" ry="3" />
    <path d="M12 19 L8 26 M14 20 L11 27" />
    <circle cx="22" cy="14" r="3.5" />
    <polygon points="25,14 29,13 25,15.5" fill={c} stroke="none" />
  </svg>
)

const tree = (c, size = 22) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none"
    stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="16,2 7,13 25,13" />
    <polygon points="16,8 5,21 27,21" />
    <rect x="13" y="21" width="6" height="8" rx="1" />
  </svg>
)

const boar = (c, size = 22) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none"
    stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="13" cy="19" rx="9" ry="6.5" />
    <ellipse cx="24" cy="16" rx="7" ry="5.5" />
    <ellipse cx="30" cy="16" rx="3" ry="2.5" />
    <path d="M28 18.5 L31 23" />
    <circle cx="26" cy="13.5" r="1.5" fill={c} stroke="none" />
    <polygon points="19,10 22,6 25,11" />
    <line x1="8" y1="24" x2="8" y2="30" />
    <line x1="14" y1="24" x2="14" y2="30" />
  </svg>
)

const spree = (c, size = 22) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none"
    stroke={c} strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 10 Q6 6 10 10 Q14 14 18 10 Q22 6 30 10" />
    <path d="M2 17 Q6 13 10 17 Q14 21 18 17 Q22 13 30 17" />
    <path d="M2 24 Q6 20 10 24 Q14 28 18 24 Q22 20 30 24" strokeOpacity="0.45" />
  </svg>
)

const street = (c, size = 22) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none"
    stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="4" x2="8" y2="28" />
    <line x1="24" y1="4" x2="24" y2="28" />
    <line x1="16" y1="6" x2="16" y2="11" />
    <line x1="16" y1="14" x2="16" y2="19" />
    <line x1="16" y1="22" x2="16" y2="27" />
    <path d="M4 10 Q6 8 8 10" strokeOpacity="0.4" />
    <path d="M24 22 Q26 20 28 22" strokeOpacity="0.4" />
  </svg>
)

export const icons = { fox, bee, bird, tree, boar, spree, street }
