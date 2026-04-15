import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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

const CURSOR_SIZE = 110

export default function LandingScreen({ onComplete }) {
  const [ready, setReady] = useState(false)
  const [mouse, setMouse] = useState({ x: -300, y: -300 })
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onMove  = e => setMouse({ x: e.clientX, y: e.clientY })
    const onDown  = () => setClicking(true)
    const onUp    = () => setClicking(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  const staggerDelay = (i) => ({ delay: 0.3 + i * 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] })

  return (
    <div style={s.root} onClick={onComplete}>

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

      {/* ── Custom cursor: position tracker ── */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 99999,
          pointerEvents: 'none',
        }}
        animate={{ x: mouse.x - CURSOR_SIZE / 2, y: mouse.y - CURSOR_SIZE / 2 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.4 }}
      >
        {/* Circle with pulse / click scale */}
        <motion.div
          style={{
            width: CURSOR_SIZE, height: CURSOR_SIZE,
            borderRadius: '50%',
            border: '1.5px solid rgba(0,245,255,0.75)',
            boxShadow: '0 0 28px rgba(0,245,255,0.4), inset 0 0 28px rgba(0,245,255,0.07)',
            background: 'rgba(4,6,15,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 5,
          }}
          animate={{ scale: clicking ? 0.86 : [1, 1.05, 1] }}
          transition={
            clicking
              ? { duration: 0.08 }
              : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <span style={s.cursorLine}>ENTER</span>
          <span style={s.cursorLine}>BERLIN</span>
        </motion.div>
      </motion.div>

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

        {/* Coordinate label */}
        <motion.div
          style={s.coord}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={staggerDelay(5)}
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
    cursor: 'none',
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
  coord: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: 9,
    letterSpacing: '0.22em',
    color: 'rgba(0,245,255,0.2)',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  cursorLine: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 9, fontWeight: 700,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#00f5ff',
    lineHeight: 1,
    userSelect: 'none',
  },
}
