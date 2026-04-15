import { useState, useMemo } from 'react'
import { RESIDENTS } from '../data/residents'

// Derive unique kiezes from resident data (sorted)
const RESIDENT_KIEZES = [...new Set(RESIDENTS.map(r => r.kiez))].sort((a, b) =>
  a.localeCompare(b, 'de')
)

export default function KiezBar({ selectedKiez, onSelectKiez }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return RESIDENT_KIEZES
    const q = query.toLowerCase()
    return RESIDENT_KIEZES.filter(k => k.toLowerCase().includes(q))
  }, [query])

  return (
    <div style={s.bar}>
      <span style={s.label}>Who else lives here?</span>

      <div style={s.searchWrap}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
          <circle cx="6" cy="6" r="4.5" stroke="#00f5ff" strokeWidth="1.2"/>
          <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#00f5ff" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <input
          style={s.searchInput}
          placeholder="search Kiez…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          spellCheck={false}
        />
        {query && (
          <button style={s.clearBtn} onClick={() => setQuery('')} aria-label="Clear">×</button>
        )}
      </div>

      <div style={s.scroll}>
        {filtered.map(kiez => {
          const active = selectedKiez === kiez
          return (
            <button
              key={kiez}
              style={{
                ...s.pill,
                background: active ? 'rgba(0,245,255,0.14)' : 'transparent',
                borderColor: active ? 'rgba(0,245,255,0.55)' : 'rgba(255,255,255,0.12)',
                color: active ? '#00f5ff' : 'rgba(255,255,255,0.52)',
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
    width: '100%',
    background: '#04060f',
    borderBottom: '1px solid rgba(0,245,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0 20px',
    height: 48,
    flexShrink: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(0,245,255,0.55)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderBottom: '1px solid rgba(0,245,255,0.18)',
    paddingBottom: 2,
    flexShrink: 0,
    width: 160,
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    width: '100%',
    caretColor: '#00f5ff',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 1,
    padding: 0,
    flexShrink: 0,
  },
  scroll: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    flex: 1,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    alignItems: 'center',
    height: '100%',
  },
  pill: {
    flexShrink: 0,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: 11,
    letterSpacing: '0.06em',
    padding: '3px 10px',
    border: '1px solid',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'background 0.15s, border-color 0.15s, color 0.15s',
    whiteSpace: 'nowrap',
  },
}
