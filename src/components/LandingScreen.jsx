import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RESIDENT_TYPES } from '../data/residents'
import { icons } from './icons'

const NEON_COLORS = ['#00f5ff', '#ff00cc', '#9d00ff', '#00ff88', '#ff6600', '#ffee00']
const TYPES = Object.entries(RESIDENT_TYPES)

// Stable particles — generated once
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  color: NEON_COLORS[i % NEON_COLORS.length],
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5,
  driftX: (Math.random() - 0.5) * 60,
  driftY: (Math.random() - 0.5) * 60,
}))

export default function LandingScreen({ onComplete }) {
  const [ready, setReady] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200)
    return () => clearTimeout(t)
  }, [])

  const staggerDelay = (i) => ({ delay: 0.3 + i * 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] })

  return (
    <div style={s.root}>

      {/* ── Animated grid background ── */}
      <motion.div
        style={s.grid}
        animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* ── Scanlines ── */}
      <div style={s.scanlines} />

      {/* ── Floating particles ── */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            pointerEvents: 'none',
          }}
          animate={{
            x: [0, p.driftX, 0],
            y: [0, p.driftY, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Content column ── */}
      <div style={s.content}>

        {/* Icon row */}
        <motion.div
          style={s.iconRow}
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={staggerDelay(0)}
        >
          {TYPES.map(([key, type]) => (
            <motion.div
              key={key}
              style={{
                width: 44, height: 44,
                borderRadius: '50%',
                border: `1px solid ${type.color}55`,
                background: `${type.color}0f`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 16px ${type.color}33`,
              }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3 + Math.random() * 1.5, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
            >
              {icons[key] && icons[key](type.color, 20)}
            </motion.div>
          ))}
        </motion.div>

        {/* CO RESIDENTS — hero headline */}
        <motion.h1
          style={s.hero}
          initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
          animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={staggerDelay(1)}
        >
          Co residents
        </motion.h1>

        {/* mitbewohner */}
        <motion.div
          style={s.sub}
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={staggerDelay(2)}
        >
          mitbewohner
        </motion.div>

        {/* Divider */}
        <motion.div
          style={s.divider}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={ready ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ ...staggerDelay(3), duration: 0.9 }}
        />

        {/* Tagline */}
        <motion.p
          style={s.tagline}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={staggerDelay(4)}
        >
          Dispatches from the non-human city.
        </motion.p>

        {/* Enter button */}
        <motion.button
          style={{
            ...s.btn,
            boxShadow: btnHovered
              ? '0 0 32px rgba(0,245,255,0.5), 0 0 64px rgba(0,245,255,0.2)'
              : '0 0 16px rgba(0,245,255,0.2)',
            background: btnHovered ? 'rgba(0,245,255,0.08)' : 'transparent',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={staggerDelay(5)}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          onClick={onComplete}
          whileTap={{ scale: 0.97 }}
        >
          Enter Berlin →
        </motion.button>

        {/* Coordinate label */}
        <motion.div
          style={s.coord}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={staggerDelay(6)}
        >
          BERLIN · 52.520°N · 13.405°E
        </motion.div>

      </div>
    </div>
  )
}

const s = {
  root: {
    position: 'relative',
    width: '100vw', height: '100vh',
    background: '#04060f',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  scanlines: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
    zIndex: 1,
  },
  content: {
    position: 'relative', zIndex: 2,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 20,
    textAlign: 'center', padding: '0 32px',
  },
  iconRow: {
    display: 'flex', gap: 14, marginBottom: 8,
  },
  hero: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    fontSize: 'clamp(48px, 9vw, 100px)',
    letterSpacing: '0.06em',
    color: '#00f5ff',
    lineHeight: 1,
    textShadow: '0 0 40px rgba(0,245,255,0.8), 0 0 80px rgba(0,245,255,0.4), 0 0 120px rgba(0,245,255,0.2)',
    margin: 0,
  },
  sub: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: 'clamp(14px, 2vw, 22px)',
    letterSpacing: '0.38em',
    color: 'rgba(224,240,255,0.45)',
    textTransform: 'lowercase',
  },
  divider: {
    width: 80, height: 1,
    background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)',
    transformOrigin: 'center',
  },
  tagline: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: 'clamp(10px, 1.4vw, 13px)',
    letterSpacing: '0.16em',
    color: 'rgba(224,240,255,0.28)',
    textTransform: 'uppercase',
    margin: 0,
  },
  btn: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#00f5ff',
    border: '1px solid rgba(0,245,255,0.6)',
    borderRadius: 2,
    padding: '14px 40px'
