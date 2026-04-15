import { useState, useMemo } from 'react'
import { RESIDENTS } from '../data/residents'

const RESIDENT_KIEZES = [...new Set(RESIDENTS.map(r => r.kiez))].sort((a, b) =>
  a.localeCompare(b, 'de')
)

const NEON = ['#ff6600', '#ffee00', '#00f5ff', '#00ff88', '#ff00cc', '#9d00ff']

export default function KiezBar({ selectedKiez, onSelectKiez }) {
  const [query, setQuery] = useState('')

  const kiezList = useMemo(() =>
    RESIDENT_KIEZES.map((kiez, i) => ({ kiez, color: NEON[i % NEON.length] })),
    []
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return kiezList
    const q = query.toLowerCase()
    return kiezList.filter(({ kiez }) => kiez.toLowerCase().includes(q))
  }, [query, kiezList])

  return (
    <div style={s.bar}>
      <div style={s.title}>Kiez</div>

      <div style={s.searchWrap}>
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
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
                color: active ? color : `${color}88`,
                borderLeft: active ? `2px solid ${color}99` : '2px solid transparent',
                background: active ? `${color}12` : 'transparent',
                textShadow: active ? `0 0 12px ${color}55` : 'none',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.color = `${color}bb`
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.color = `${color}88`
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
    width: 160,
    background: 'rgba(4,6,15,0.88)',
    borderLeft: '1px solid rgba(0,245,255,0.08)',
    backdropFilter: 'blur(16px)',
    display: 'flex', flexDirection: 'column',
    zIndex: 10,
    boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 8, fontWeight: 700,
    letterSpacing: '0.32em', textTransform: 'uppercase',
    color: 'rgba(0,245,255,0.35)',
    padding: '20px 16px 12px',
    borderBottom: '1px solid rgba(0,245,255,0.07)',
    flexShrink: 0,
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '9px 12px',
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
    padding: '6px 0',
  },
  pill: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    fontFamily: "'Inter', sans-serif",
    fontSize: 11, fontWeight: 400,
    letterSpacing: '0.03em',
    padding: '7px 14px 7px 14px',
    border: 'none',
    borderLeft: '2px solid transparent',
    borderRadius: 0,
    cursor: 'pointer',
    background: 'transparent',
    transition: 'color 0.15s, background 0.15s, text-shadow 0.15s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxSizing: 'border-box',
  },
}
