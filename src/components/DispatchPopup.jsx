import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RESIDENT_TYPES } from '../data/residents'
import { stressBadge } from '../theme'
import AftermathScreen from './AftermathScreen'
import IgnoredScreen from './IgnoredScreen'
import CityHealthScreen from './CityHealthScreen'
import {
  incrementHelperCount, incrementKiezHealth,
  decrementKiezHealth, incrementPersonalActions, incrementPersonalIgnores,
} from '../utils/storage'
import { icons } from './icons'

export default function DispatchPopup({ resident, onClose }) {
  const [phase, setPhase] = useState('dispatch') // 'dispatch' | 'aftermath' | 'ignored' | 'cityhealth'
  const [helperCount, setHelperCount] = useState(0)
  const [kiezHealth, setKiezHealth] = useState(0)
  const type = RESIDENT_TYPES[resident.type]
  const Icon = icons[resident.type]

  const handleDo = () => {
    setHelperCount(incrementHelperCount(resident.type))
    setKiezHealth(incrementKiezHealth(resident.kiez))
    incrementPersonalActions()
    setPhase('aftermath')
  }

  const handleIgnore = () => {
    decrementKiezHealth(resident.kiez)
    incrementPersonalIgnores()
    setPhase('ignored')
  }

  return (
    <motion.div
      style={s.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <AnimatePresence mode="wait">

        {/* ── Main dispatch card ── */}
        {phase === 'dispatch' && (
          <motion.div
            key="card"
            style={s.card}
            initial={{ opacity: 0, y: 70, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          >
            {/* Close button */}
            <button style={s.closeBtn} onClick={onClose} aria-label="close">✕</button>

            {/* Neighbourhood badge */}
            <div style={s.kiezBadge}>
              <span style={s.kiezDot} />
              {resident.kiez}
            </div>

            {/* Header */}
            <div style={s.header}>
              <div style={{
                ...s.iconBubble,
                background: `${type.color}1a`,
                border: `2px solid ${type.color}`,
                boxShadow: `0 0 20px ${type.color}40`,
              }}>
                {Icon && Icon(type.color)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: type.color, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter' }}>
                  {type.label}
                </div>
              </div>
              <div style={{
                ...stressBadge,
                borderRadius: 6, padding: '4px 10px',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                alignSelf: 'flex-start',
              }}>
                {resident.stress}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(0,245,255,0.08)', margin: '4px 0 16px' }} />

            {/* Dispatch — first-person narrative */}
            <div style={s.dispatchLabel}>Dispatch from {resident.kiez}</div>
            <p style={s.dispatch}>{resident.dispatch}</p>

            {/* Action section */}
            <div style={{ ...s.actionBox, borderColor: `${type.color}30` }}>
              <div style={{ ...s.actionLabel, color: type.color }}>
                <span style={{ fontSize: 12 }}>→</span> Neighbourhood action
                <span style={{ marginLeft: 8, fontSize: 9, color: 'rgba(0,245,255,0.5)', fontWeight: 400, letterSpacing: '0.06em' }}>· {resident.kiez}</span>
              </div>
              <p style={s.actionText}>{resident.action}</p>
            </div>

            {/* CTA buttons */}
            <div style={s.btnRow}>
              <motion.button
                style={s.btnSkip}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleIgnore}
              >
                Ignore
              </motion.button>
              <motion.button
                style={{
                  ...s.btnDo,
                  background: type.color,
                  border: `2px solid ${type.color}`,
                  color: '#04060f',
                  boxShadow: `0 0 22px ${type.color}55`,
                }}
                whileHover={{ opacity: 0.88, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDo}
              >
                Take Action
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Aftermath screen ── */}
        {phase === 'aftermath' && (
          <AftermathScreen
            key="aftermath"
            resident={resident}
            type={type}
            Icon={Icon}
            helperCount={helperCount}
            kiezHealth={kiezHealth}
            onClose={onClose}
            onViewHealth={() => setPhase('cityhealth')}
          />
        )}

        {/* ── Ignored screen ── */}
        {phase === 'ignored' && (
          <IgnoredScreen
            key="ignored"
            resident={resident}
            type={type}
            Icon={Icon}
            onClose={onClose}
            onViewHealth={() => setPhase('cityhealth')}
          />
        )}

        {/* ── City health screen ── */}
        {phase === 'cityhealth' && (
          <CityHealthScreen
            key="cityhealth"
            onClose={onClose}
          />
        )}

      </AnimatePresence>
    </motion.div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────
const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(2,3,8,0.80)',
    backdropFilter: 'blur(8px)',
    padding: '20px',
  },
  card: {
    width: '100%', maxWidth: 580,
    background: 'rgba(4,6,15,0.97)',
    border: '1px solid rgba(0,245,255,0.12)',
    borderRadius: 16,
    padding: '48px 44px 36px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,245,255,0.05)',
    display: 'flex', flexDirection: 'column', gap: 0,
    position: 'relative',
    maxHeight: '90vh', overflowY: 'auto',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    background: 'none', border: 'none',
    color: 'rgba(224,240,255,0.3)', fontSize: 14,
    cursor: 'pointer', padding: '4px 6px', lineHeight: 1,
    fontFamily: 'Inter',
  },
  kiezBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: 'rgba(0,245,255,0.07)',
    border: '1px solid rgba(0,245,255,0.25)',
    borderRadius: 20, padding: '5px 14px',
    fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#00f5ff', marginBottom: 18, alignSelf: 'flex-start',
    boxShadow: '0 0 14px rgba(0,245,255,0.1)',
  },
  kiezDot: {
    display: 'inline-block', width: 5, height: 5,
    borderRadius: '50%', background: '#00f5ff',
    boxShadow: '0 0 6px rgba(0,245,255,0.8)',
    flexShrink: 0,
  },
  header: {
    display: 'flex', alignItems: 'center',
    gap: 14, marginBottom: 22,
  },
  iconBubble: {
    width: 48, height: 48, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dispatchLabel: {
    fontFamily: 'Inter', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: 'rgba(212,168,136,0.35)', marginBottom: 10,
  },
  dispatch: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 19, lineHeight: 1.88,
    color: 'rgba(224,240,255,0.9)',
    fontStyle: 'italic', fontWeight: 400,
    margin: '0 0 28px',
  },
  actionBox: {
    border: '1px solid',
    borderRadius: 10, padding: '20px 20px',
    background: 'rgba(212,104,42,0.07)',
    marginBottom: 28,
  },
  actionLabel: {
    fontFamily: 'Inter', fontSize: 11, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center',
  },
  actionText: {
    fontFamily: 'Inter', fontSize: 15, lineHeight: 1.65,
    color: 'rgba(224,240,255,0.8)', fontWeight: 400, margin: 0,
  },
  btnRow: {
    display: 'flex', gap: 16,
  },
  btnSkip: {
    flex: 1, padding: '15px 0',
    background: 'rgba(237,228,216,0.04)',
    border: '1px solid rgba(237,228,216,0.1)',
    borderRadius: 10, cursor: 'pointer',
    color: 'rgba(224,240,255,0.3)',
    fontFamily: 'Inter', fontSize: 13, fontWeight: 500,
    letterSpacing: '0.04em',
    transition: 'background 0.2s',
  },
  btnDo: {
    flex: 1, padding: '15px 0',
    background: 'transparent',
    border: '1.5px solid',
    borderRadius: 10, cursor: 'pointer',
    fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
    letterSpacing: '0.06em',
    transition: 'background 0.2s',
  },
}
