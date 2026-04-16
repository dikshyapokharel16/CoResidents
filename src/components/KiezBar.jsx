import { useState, useMemo } from 'react'

// Full Berlin neighbourhood list — ensures the sidebar is always filled
const ALL_KIEZE = [
  'Adlershof', 'Alt-Hohenschönhausen', 'Alt-Treptow', 'Altglienicke',
  'Baumschulenweg', 'Biesdorf', 'Blankenburg', 'Bohnsdorf', 'Britz', 'Buch', 'Buckow',
  'Charlottenburg', 'Charlottenburg-Nord',
  'Dahlem', 'Französisch Buchholz', 'Friedenau', 'Friedrichsfelde',
  'Friedrichshagen', 'Friedrichshain',
  'Gatow', 'Gesundbrunnen', 'Gropiusstadt', 'Grunewald',
  'Hakenfelde', 'Halensee', 'Haselhorst', 'Heinersdorf', 'Hellersdorf', 'Hermsdorf',
  'Johannisthal', 'Karlshorst', 'Karow', 'Kaulsdorf', 'Kladow', 'Köpenick', 'Kreuzberg',
  'Lankwitz', 'Lichtenberg', 'Lichterfelde',
  'Mahlsdorf', 'Malchow', 'Mariendorf', 'Marienfelde', 'Märkisches Viertel',
  'Marzahn', 'Mitte', 'Moabit', 'Müggelheim',
  'Neukölln', 'Niederschöneweide', 'Niederschönhausen',
  'Oberschöneweide', 'Pankow', 'Plänterwald', 'Prenzlauer Berg',
  'Rahnsdorf', 'Reinickendorf', 'Rosenthal', 'Rudow', 'Rummelsburg',
  'Schöneberg', 'Siemensstadt', 'Spandau', 'Staaken', 'Steglitz',
  'Tegel', 'Tempelhof', 'Tiergarten', 'Treptow',
  'Wannsee', 'Wedding', 'Weißensee', 'Wilhelmstadt', 'Wilmersdorf', 'Wittenau',
  'Zehlendorf',
].sort()

const NEON = ['#ff6600', '#ffee00', '#00f5ff', '#00ff88', '#ff00cc', '#9d00ff']

export default function KiezBar({ selectedKiez, onSelectKiez }) {
  const [query, setQuery] = useState('')

  const kiezList = useMemo(() =>
    ALL_KIEZE.map((kiez, i) => ({ kiez, color: NEON[i % NEON.length] })),
    []
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return kiezList
    const q = query.toLowerCase()
    return kiezList.filter(({ kiez }) => kiez.toLowerCase().includes(q))
  }, [query, kiezList])

  return (
    <div style={s.bar}>
      <div style={s.title}>Select Your Kiez</div>

      <div style={s.searchWrap}>
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
          <circle cx="6" cy="6" r="4.5" stroke="#00f5ff" strokeWidth="1.3"/>
          <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#00f5ff" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          style={s.searchInput}
          placeholder="search kiez…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          spellCheck={false}
        />
        {query && (
          <button style={s.clearBtn} onClick={() => setQuery('')}>×</button>
        )}
      </div>

      <div style={s.scroll}>
        {filtered.map(({ kiez, color }) => {
          const active = selectedKiez === kiez
          return (
            <button
              key={kiez}
              style={{
                ...s.pill,
                color: active ? color : `${color}cc`,
                background: active ? `${color}28` : 'rgba(255,255,255,0.07)',
                border: `1px solid ${active ? `${color}55` : 'rgba(255,255,255,0.10)'}`,
                textShadow: active ? `0 0 10px ${color}66` : 'none',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                  e.currentTarget.style.color = color
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.color = `${color}cc`
                }
              }}
              onClick={() => onSelectKiez(active ? null : kiez)}
            >
              {kiez}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  bar: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0,
    width: 175,
    background: 'rgba(4,6,15,0.92)',
    borderLeft: '1px solid rgba(0,245,255,0.08)',
    backdropFilter: 'blur(16px)',
    display: 'flex', flexDirection: 'column',
    zIndex: 10,
    boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13, fontWeight: 900,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#00f5ff',
    textShadow: '0 0 18px rgba(0,245,255,0.7)',
    padding: '20px 14px 14px',
    borderBottom: '1px solid rgba(0,245,255,0.12)',
    flexShrink: 0,
    lineHeight: 1.35,
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '8px 11px',
    borderBottom: '1px solid rgba(0,245,255,0.07)',
    flexShrink: 0,
  },
  searchInput: {
    background: 'transparent',
    border: 'none', outline: 'none',
    fontFamily: "'Inter', sans-serif",
    fontSize: 11, fontWeight: 300,
    color: 'rgba(255,255,255,0.5)',
    width: '100%',
    caretColor: '#00f5ff',
  },
  clearBtn: {
    background: 'none', border: 'none',
    cursor: 'pointer', fontSize: 14,
    color: 'rgba(255,255,255,0.2)',
    lineHeight: 1, padding: 0, flexShrink: 0,
  },
  scroll: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    padding: '6px 10px 16px',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  pill: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    fontFamily: "'Inter', sans-serif",
    fontSize: 10, fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '7px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'color 0.15s, background 0.15s, border-color 0.15s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
}
