import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { RESIDENTS, RESIDENT_TYPES } from '../data/residents'
import { icons } from './icons'
import {
  getPersonalActions, getPersonalIgnores,
  getHelperCount, getKiezHealth,
} from '../utils/storage'

const healthColor = (score) => {
  if (score < 35) return '#e05050'
  if (score < 55) return '#d4a02a'
  return '#00ff88'
}

const popColor = (status) => {
  if (status === 'At Risk')    return '#e05050'
  if (status === 'Recovering') return '#d4a02a'
  return '#00ff88'
}

export default function CityHealthScreen({ onClose, fromIgnore = false }) {
  const personalActions = getPersonalActions()
  const personalIgnores = getPersonalIgnores()

  const types = useMemo(() =>
    Object.entries(RESIDENT_TYPES).map(([key, val]) => ({
      key, ...val,
      helpers: getHelperCount(key),
      count: RESIDENTS.filter(r => r.type === key).length,
    })),
    []
  )

  const kieze = useMemo(() => {
    const unique = [...new Set(RESIDENTS.map(r => r.kiez))]
    return unique
      .map(kiez => ({ kiez, health: getKiezHealth(kiez) }))
      .sort((a, b) => b.health - a.health)
  }, [])

  return (
    <motion.div
      style={s.card}
      initial={{ opacity: 0, y: 50, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 210, damping: 26 }}
    >
      <div style={s.titleRow}>
        <div style={s.titleLabel}>City Health</div>
        <div style={s.titleSub}>Berlin — Non-human residents</div>
      </div>

      <div style={{ height: 1, background: 'rgba(0,245,255,0.1)', margin: '0 0 24px' }} />

      {/* Your impact */}
      <div style={s.sectionLabel}>Your impact</div>
      <div style={s.impactRow}>
        <div style={s.impactCell}>
          <div style={{ ...s.impactNum, color: '#00ff88' }}>{personalActions}</div>
          <div style={s.impactMeta}>Actions taken</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', alignSelf: 'stretch' }} />
        <div style={s.impactCell}>
          <div style={{ ...s.impactNum, color: '#e05050' }}>{personalIgnores}</div>
          <div style={s.impactMeta}>Ignored</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', alignSelf: 'stretch' }} />
        <div style={s.impactCell}>
          <div style={{ ...s.impactNum, color: 'rgba(224,240,255,0.5)' }}>
            {personalActions + personalIgnores > 0
              ? Math.round((personalActions / (personalActions + personalIgnores)) * 100)
              : 0}%
          </div>
          <div style={s.impactMeta}>Response rate</div>
        </div>
      </div>

      {/* Resident status */}
      <div style={{ ...s.sectionLabel, marginTop: 28 }}>Non-human residents</div>
      <div style={s.typeGrid}>
        {types.map(item => {
          const pColor = popColor(item.populationStatus)
          const Icon = icons[item.key]
          return (
            <div key={item.key} style={{ ...s.typeCell, borderColor: `${item.color}22` }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `${item.color}14`, border: `1.5px solid ${item.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 10px ${item.color}33`,
              }}>
                {Icon && Icon(item.color, 16)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: item.color, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
                  {item.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: pColor, flexShrink: 0 }} />
                  <div style={{ fontFamily: 'Inter', fontSize: 9, color: pColor, letterSpacing: '0.08em' }}>
                    {item.populationStatus}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'rgba(224,240,255,0.7)', lineHeight: 1 }}>
                  {item.helpers.toLocaleString()}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 8, color: 'rgba(224,240,255,0.22)', letterSpacing: '0.08em', marginTop: 2 }}>
                  helpers
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Kiez health */}
      <div style={{ ...s.sectionLabel, marginTop: 28 }}>Kiez health</div>
      <div style={s.kiezList}>
        {kieze.map(({ kiez, health }) => {
          const hColor = healthColor(health)
          return (
            <div key={kiez} style={s.kiezRow}>
              <div style={s.kiezName}>{kiez}</div>
              <div style={s.kiezBarWrap}>
                <motion.div
                  style={{ height: '100%', background: hColor, borderRadius: 3, opacity: 0.7 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${health}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
              <div style={{ ...s.kiezScore, color: hColor }}>{health}</div>
            </div>
          )
        })}
      </div>

      <motion.button
        style={s.actionBtn}
        whileHover={{ opacity: 0.88, scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
      >
        {fromIgnore ? 'Take Action This Time' : 'Take More Action'}
      </motion.button>
    </motion.div>
  )
}

const s = {
  card: {
    width: '100%', maxWidth: 580,
    background: 'rgba(4,6,15,0.97)',
    border: '1px solid rgba(0,245,255,0.12)',
    borderRadius: 16,
    padding: '36px 40px 32px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,245,255,0.05)',
    display: 'flex', flexDirection: 'column',
    position: 'relative',
    maxHeight: '92vh', overflowY: 'auto',
  },
  titleRow: { marginBottom: 18 },
  titleLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 20, fontWeight: 700,
    color: '#00f5ff',
    textShadow: '0 0 20px rgba(0,245,255,0.5)',
    letterSpacing: '0.08em',
  },
  titleSub: {
    fontFamily: 'Inter', fontSize: 10, fontWeight: 300,
    letterSpacing: '0.18em', textTransform: 'uppercase',
    color: 'rgba(0,245,255,0.3)', marginTop: 4,
  },
  sectionLabel: {
    fontFamily: 'Inter', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: 'rgba(0,245,255,0.35)', marginBottom: 12,
  },
  impactRow: {
    display: 'flex',
    border: '1px solid rgba(0,245,255,0.1)',
    borderRadius: 12, overflow: 'hidden',
  },
  impactCell: {
    flex: 1, padding: '18px 16px',
    background: 'rgba(0,245,255,0.03)',
    textAlign: 'center',
  },
  impactNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 30, fontWeight: 700, lineHeight: 1,
  },
  impactMeta: {
    fontFamily: 'Inter', fontSize: 9, fontWeight: 500,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(224,240,255,0.25)', marginTop: 6,
  },
  typeGrid: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  typeCell: {
    display: 'flex', alignItems: 'center', gap: 12,
    border: '1px solid',
    borderRadius: 10, padding: '12px 14px',
    background: 'rgba(255,255,255,0.02)',
  },
  kiezList: {
    display: 'flex', flexDirection: 'column', gap: 7,
    marginBottom: 28,
  },
  kiezRow: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  kiezName: {
    fontFamily: 'Inter', fontSize: 10, fontWeight: 500,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'rgba(224,240,255,0.35)',
    width: 100, flexShrink: 0,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  kiezBarWrap: {
    flex: 1, height: 4,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 3, overflow: 'hidden',
  },
  kiezScore: {
    fontFamily: 'Inter', fontSize: 10, fontWeight: 600,
    width: 28, textAlign: 'right', flexShrink: 0,
  },
  actionBtn: {
    width: '100%', padding: '20px 0',
    background: '#00f5ff',
    border: 'none',
    borderRadius: 12, cursor: 'pointer',
    color: '#04060f',
    fontFamily: 'Inter', fontSize: 15, fontWeight: 800,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    boxShadow: '0 0 32px rgba(0,245,255,0.35)',
    transition: 'opacity 0.2s',
  },
}
