import { motion } from 'framer-motion'

// Deterministic "days unresolved" based on resident id — feels real, never changes per resident
const daysUnresolved = (id) => (id * 17 + 31) % 52 + 12   // 12–63 days

const popTrendAfterIgnore = (status) => {
  if (status === 'At Risk')    return 'Critical'
  if (status === 'Recovering') return 'Stalled'
  return 'Declining'
}

const trendColor = (trend) => {
  if (trend === 'Critical')  return '#e05050'
  if (trend === 'Stalled')   return '#d4a02a'
  return '#d4702a'
}

function buildNarrative(resident, type) {
  return `The ${resident.stress.toLowerCase()} in ${resident.kiez} continued without pause. ` +
    `The ${type.label.toLowerCase()} faced another cycle of the same pressure — ` +
    `the kind that compounds quietly, season by season, until the threshold is crossed ` +
    `and recovery is no longer guaranteed.`
}

export default function IgnoredScreen({ resident, type, Icon, onClose, onViewHealth }) {
  const days   = daysUnresolved(resident.id)
  const trend  = popTrendAfterIgnore(type.populationStatus)
  const tColor = trendColor(trend)
  const accent = '#e05050'

  return (
    <motion.div
      style={s.card}
      initial={{ opacity: 0, y: 50, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 210, damping: 26 }}
    >
      {/* Close */}
      <button style={s.closeBtn} onClick={onClose} aria-label="close">✕</button>

      {/* Header */}
      <div style={s.header}>
        <div style={{
          ...s.iconBubble,
          background: `${accent}18`,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 20px ${accent}40`,
          opacity: 0.7,
        }}>
          {Icon && Icon(accent)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter' }}>
            Left Behind — {type.label}
          </div>
          <div style={{ color: 'rgba(212,190,168,0.45)', fontSize: 11, fontFamily: 'Inter', marginTop: 2 }}>
            {resident.kiez}
          </div>
        </div>
        <div style={{
          fontFamily: 'Inter', fontSize: 9, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: accent, background: `${accent}14`,
          border: `1px solid ${accent}33`,
          borderRadius: 6, padding: '4px 10px',
          alignSelf: 'flex-start',
        }}>
          Ignored
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `${accent}18`, margin: '0 0 22px' }} />

      {/* What remained */}
      <div style={s.sectionLabel}>What remained</div>
      <p style={s.narrative}>{buildNarrative(resident, type)}</p>

      {/* Missed action reminder */}
      <div style={{ ...s.missedBox, borderColor: `${accent}22` }}>
        <div style={s.missedLabel}>The action you passed on</div>
        <p style={s.missedText}>{resident.action}</p>
      </div>

      {/* Stats */}
      <div style={s.sectionLabel}>Cost of inaction</div>
      <div style={s.statsRow}>

        {/* Days unresolved */}
        <div style={{ ...s.statCell, borderColor: `${accent}22` }}>
          <div style={{ ...s.statNum, color: 'rgba(224,240,255,0.5)' }}>
            {days}<span style={{ fontSize: 12, opacity: 0.5 }}>d</span>
          </div>
          <div style={s.statLabel}>Days unresolved</div>
        </div>

        {/* Population trend */}
        <div style={{ ...s.statCell, borderColor: `${accent}22` }}>
          <motion.div
            style={{ width: 8, height: 8, borderRadius: '50%', background: tColor, marginBottom: 10, flexShrink: 0 }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <div style={{ ...s.statNum, fontSize: 13, lineHeight: 1.25, color: tColor }}>{trend}</div>
          <div style={s.statLabel}>Population</div>
        </div>

        {/* Actions taken */}
        <div style={{ ...s.statCell, borderColor: `${accent}22` }}>
          <div style={{ ...s.statNum, color: 'rgba(224,240,255,0.22)' }}>0</div>
          <div style={s.statLabel}>Actions taken</div>
        </div>

      </div>

      {/* Button */}
      <motion.button
        style={s.btnHealth}
        whileHover={{ backgroundColor: 'rgba(0,245,255,0.1)', scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        onClick={onViewHealth}
      >
        See city health
      </motion.button>
    </motion.div>
  )
}

const s = {
  card: {
    width: '100%', maxWidth: 580,
    background: 'rgba(4,6,15,0.97)',
    border: '1px solid rgba(224,80,80,0.14)',
    borderRadius: 16,
    padding: '36px 40px 32px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(224,80,80,0.06)',
    display: 'flex', flexDirection: 'column', gap: 0,
    position: 'relative',
    maxHeight: '92vh', overflowY: 'auto',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    background: 'none', border: 'none',
    color: 'rgba(224,240,255,0.3)', fontSize: 14,
    cursor: 'pointer', padding: '4px 6px', lineHeight: 1,
    fontFamily: 'Inter',
  },
  header: {
    display: 'flex', alignItems: 'center',
    gap: 14, marginBottom: 18,
  },
  iconBubble: {
    width: 44, height: 44, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  sectionLabel: {
    fontFamily: 'Inter', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: 'rgba(224,80,80,0.7)', marginBottom: 12,
  },
  narrative: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 17, lineHeight: 1.88,
    color: 'rgba(224,240,255,0.85)',
    fontStyle: 'italic', fontWeight: 400,
    margin: '0 0 24px',
  },
  missedBox: {
    border: '1px solid',
    borderRadius: 10, padding: '16px 18px',
    background: 'rgba(224,80,80,0.06)',
    marginBottom: 28,
  },
  missedLabel: {
    fontFamily: 'Inter', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.16em', textTransform: 'uppercase',
    color: 'rgba(224,80,80,0.65)', marginBottom: 8,
  },
  missedText: {
    fontFamily: 'Inter', fontSize: 14, lineHeight: 1.65,
    color: 'rgba(224,240,255,0.65)', fontWeight: 300, margin: 0,
    fontStyle: 'italic',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    gap: 10, marginBottom: 28,
  },
  statCell: {
    border: '1px solid',
    borderRadius: 10, padding: '16px 14px',
    background: 'rgba(224,80,80,0.05)',
  },
  statNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26, fontWeight: 700,
    color: 'rgba(224,240,255,0.9)',
    lineHeight: 1, marginBottom: 6,
  },
  statLabel: {
    fontFamily: 'Inter', fontSize: 9, fontWeight: 500,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(224,240,255,0.5)', marginTop: 4,
  },
  btnHealth: {
    width: '100%', padding: '15px 0',
    background: 'transparent',
    border: '1.5px solid rgba(0,245,255,0.35)',
    borderRadius: 10, cursor: 'pointer',
    color: '#00f5ff',
    fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
    letterSpacing: '0.06em',
    transition: 'background 0.2s',
  },
}
