// ── Cyberpunk colour palette ───────────────────────────────────────
// Single source of truth for all neon/dark-navy tokens
// used across BerlinMap, DispatchPopup, ResidentMarker, LandingScreen, and AftermathScreen.

export const CYAN        = '#00f5ff'   // primary neon — electric cyan
export const MAGENTA     = '#ff00cc'   // hot magenta accent
export const PURPLE      = '#9d00ff'   // electric purple
export const GREEN       = '#00ff88'   // acid green
export const DARK_BG     = '#04060f'   // deepest background
export const PANEL_BG    = 'rgba(4,6,15,0.96)'    // UI panel glass
export const OFF_WHITE   = 'rgba(224,240,255,0.95)' // primary text (cool white)

// Stress badge — shared between DispatchPopup and ResidentMarker
export const stressBadge = {
  background: 'rgba(255,0,80,0.15)',
  border: '1px solid rgba(255,0,80,0.4)',
  borderRadius: 4, padding: '2px 6px',
  fontSize: 8, color: '#ff0050',
  fontWeight: 600, letterSpacing: '0.06em',
  textTransform: 'uppercase', fontFamily: 'Inter',
}
