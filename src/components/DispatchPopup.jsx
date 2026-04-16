import { useState, useEffect, useRef } from 'react'
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

// Voice personality per resident type
const VOICE_CONFIG = {
  fox:    { rate: 1.05, pitch: 0.88, volume: 1.0 },  // cautious, earthy, slightly low
  bee:    { rate: 1.35, pitch: 1.55, volume: 0.9 },  // fast, high, urgent
  bird:   { rate: 1.25, pitch: 1.45, volume: 0.95 }, // quick, light, airy
  tree:   { rate: 0.78, pitch: 0.62, volume: 1.0 },  // very slow, very deep, ancient
  boar:   { rate: 0.90, pitch: 0.72, volume: 1.0 },  // low, gruff, forceful
  spree:  { rate: 0.83, pitch: 0.80, volume: 0.95 }, // slow, flowing, resonant
  street: { rate: 0.95, pitch: 0.88, volume: 0.85 }, // flat, worn, tired
}

export default function DispatchPopup({ resident, onClose }) {
  const [phase, setPhase] = useState('dispatch') // 'dispatch' | 'aftermath' | 'ignored' | 'cityhealth'
  const [helperCount, setHelperCount] = useState(0)
  const [kiezHealth, setKiezHealth] = useState(0)
  const [fromIgnore, setFromIgnore] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const utterRef = useRef(null)
  const type = RESIDENT_TYPES[resident.type]
  const Icon = icons[resident.type]
  const voice = VOICE_CONFIG[resident.type] ?? { rate: 1.0, pitch: 1.0, volume: 1.0 }

  // Cancel speech whenever leaving dispatch phase or unmounting
  useEffect(() => {
    if (phase !== 'dispatch') {
      window.speechSynthesis?.cancel()
      setSpeaking(false)
    }
  }, [phase])

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel() }
  }, [])

  const toggleVoice = () => {
    const synth = window.speechSynthesis
    if (!synth) return

    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }

    synth.cancel()
    const utter = new SpeechSynthesisUtterance(resident.dispatch)
    utter.rate = voice.rate
    utter.pitch = voice.pitch
    utter.volume = voice.volume
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    utterRef.current = utter
    synth.speak(utter)
    setSpeaking(true)
  }

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
      onClick={undefined}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={s.dispatchLabel}>Dispatch from {resident.kiez}</div>
              <motion.button
                style={{
                  ...s.micBtn,
                  background: speaking ? `${type.color}28` : `${type.color}0d`,
                  border: `1.5px solid ${speaking ? `${type.color}bb` : `${type.color}55`}`,
                  color: speaking ? type.color : `${type.color}99`,
                }}
                onClick={toggleVoice}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                title={speaking ? 'Stop voice' : 'Hear this dispatch'}
              >
                {/* Pulsing ring when idle */}
                {!speaking && (
                  <motion.span
                    style={{
                      position: 'absolute', inset: -5,
                      borderRadius: '50%',
                      border: `1.5px solid ${type.color}66`,
                      pointerEvents: 'none',
                    }}
                    animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                {/* Mic icon */}
                <svg width="13" height="16" viewBox="0 0 13 16" fill="none">
                  <rect x="4" y="0" width="5" height="9" rx="2.5" fill="currentColor"/>
                  <path d="M1 7.5C1 10.538 3.462 13 6.5 13C9.538 13 12 10.538 12 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="6.5" y1="13" x2="6.5" y2="15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="4" y1="15.5" x2="9" y2="15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>
            <p style={s.dispatch}>"{resident.dispatch}"</p>

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
            onViewHealth={() => { setFromIgnore(false); setPhase('cityhealth') }}
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
            onViewHealth={() => { setFromIgnore(true); setPhase('cityhealth') }}
          />
        )}

        {/* ── City health screen ── */}
        {phase === 'cityhealth' && (
          <CityHealthScreen
            key="cityhealth"
            onClose={onClose}
            fromIgnore={fromIgnore}
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
    color: 'rgba(212,168,136,0.35)', marginBottom: 0,
  },
  micBtn: {
    position: 'relative',
    width: 34, height: 34, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
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
