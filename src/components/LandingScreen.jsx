import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RESIDENT_TYPES } from '../data/residents'
import { icons } from './icons'

const NEON_COLORS = ['#00f5ff', '#ff00cc', '#9d00ff', '#00ff88', '#ff6600', '#ffee00']
const TYPES = Object.entries(RESIDENT_TYPES)

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

// ── Background text rows (aino-style) ─────────────────────────────
// Each row: text content, scroll direction, speed (s), font style
const TEXT_ROWS = [
  {
    text: "It's 2:47am and I cannot hunt  ·  I have flown half a kilometre  ·  I navigate by stars  ·  My roots need air as much as water  ·  I am forgetting how to hunt  ·  ",
    dir: 'left', speed: 55, size: 21, font: "'Playfair Display', serif", italic: true, top: '5vh',
  },
  {
    text: "Light pollution index 8.2  ·  37% canopy cover lost since 1990  ·  Air quality index: moderate  ·  Urban heat island +3.4°C  ·  Noise level 68dB  ·  ",
    dir: 'right', speed: 42, size: 11, font: "'Inter', sans-serif", italic: false, top: '11vh',
  },
  {
    text: "Urban Fox  ·  Solitary Bee  ·  Migratory Bird  ·  Linden Tree  ·  Wild Boar  ·  Spree River  ·  ",
    dir: 'right', speed: 38, size: 12, font: "'Inter', sans-serif", italic: false, top: '17vh',
  },
  {
    text: "I drank from the Spree before the factories came  ·  My nest was built before the wall fell  ·  I have seen five generations of humans in this park  ·  ",
    dir: 'left', speed: 67, size: 20, font: "'Playfair Display', serif", italic: true, top: '23vh',
  },
  {
    text: "4,200 particles per litre  ·  The water runs 2°C warmer  ·  I was planted in 1943  ·  I watched it happen  ·  I am suffocating slowly  ·  ",
    dir: 'left', speed: 70, size: 21, font: "'Playfair Display', serif", italic: true, top: '29vh',
  },
  {
    text: "Bee colony count −62%  ·  Wild boar sightings Grunewald +180%  ·  Fox spotted Hasenheide  ·  Sparrow population declining  ·  Parakeet territories expanding  ·  ",
    dir: 'right', speed: 35, size: 11, font: "'Inter', sans-serif", italic: false, top: '35vh',
  },
  {
    text: "Prenzlauer Berg  ·  Kreuzberg  ·  Tiergarten  ·  Mitte  ·  Neukölln  ·  Grunewald  ·  Wedding  ·  Spandau  ·  Tempelhof  ·  Lichtenberg  ·  ",
    dir: 'right', speed: 30, size: 12, font: "'Inter', sans-serif", italic: false, top: '41vh',
  },
  {
    text: "The foxglove bloomed through the tarmac  ·  I nested where the wall once stood  ·  My territory is now a cycle lane  ·  I remember the meadow  ·  ",
    dir: 'left', speed: 75, size: 20, font: "'Playfair Display', serif", italic: true, top: '47vh',
  },
  {
    text: "Construction has shrunk it to under two square kilometres  ·  The parakeet is larger than me  ·  My piglets are thin  ·  The light erases the stars  ·  ",
    dir: 'left', speed: 80, size: 21, font: "'Playfair Display', serif", italic: true, top: '53vh',
  },
  {
    text: "Microplastics detected  ·  pH 7.4 and dropping  ·  Oxygen saturation 61%  ·  Flood risk zone C  ·  Surface temperature +2.1°C  ·  Spree km 0.0  ·  ",
    dir: 'right', speed: 48, size: 11, font: "'Inter', sans-serif", italic: false, top: '59vh',
  },
  {
    text: "Dispatch from Prenzlauer Berg  ·  Dispatch from Mitte  ·  Dispatch from Grunewald  ·  Dispatch from Kreuzberg  ·  Dispatch from Tiergarten  ·  ",
    dir: 'right', speed: 45, size: 12, font: "'Inter', sans-serif", italic: false, top: '65vh',
  },
  {
    text: "The concrete remembers nothing  ·  I have watched the water level rise three centimetres  ·  My bark carries the history of two world wars  ·  ",
    dir: 'left', speed: 58, size: 20, font: "'Playfair Display', serif", italic: true, top: '71vh',
  },
  {
    text: "I still don't know another way across  ·  I don't know what comes after the branches  ·  My home used to be four square kilometres  ·  ",
    dir: 'left', speed: 62, size: 21, font: "'Playfair Display', serif", italic: true, top: '77vh',
  },
  {
    text: "Species richness index 2.1  ·  Green corridor interrupted  ·  Tiergarten elevation 34m  ·  Impervious surface 68%  ·  Groundwater depth −4.2m  ·  ",
    dir: 'right', speed: 40, size: 11, font: "'Inter', sans-serif", italic: false, top: '83vh',
  },
  {
    text: "Schönhauser Allee  ·  Unter den Linden  ·  Sonnenallee  ·  Alexanderplatz  ·  Tempelhofer Feld  ·  Spandauer Damm  ·  ",
    dir: 'right', speed: 50, size: 12, font: "'Inter', sans-serif", italic: false, top: '89vh',
  },
]

const CURSOR_SIZE = 120

export default function LandingScreen({ onComplete }) {
  const DESC = "We are not the only ones living here. This is a translation for those who have no words — the fox, the river, the tree, the street..."

  const [ready, setReady] = useState(false)
  const [mouse, setMouse] = useState({ x: -300, y: -300 })
  const [clicking, setClicking] = useState(false)
  const [time, setTime] = useState(() => new Date())
  const [descIdx, setDescIdx] = useState(0)
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const synth = window.speechSynthesis
    let spoken = false

    const speak = () => {
      if (spoken) return
      spoken = true
      synth.cancel()
      const utter = new SpeechSynthesisUtterance(DESC)
      utter.rate = 1.1
      utter.pitch = 1.0
      utter.volume = 0.85

      const voices = synth.getVoices()
      const preferred = [
        'Microsoft Aria Online (Natural) - English (United States)',
        'Microsoft Jenny Online (Natural) - English (United States)',
        'Google UK English Female',
        'Samantha',
      ]
      for (const name of preferred) {
        const v = voices.find(v => v.name === name)
        if (v) { utter.voice = v; break }
      }

      // Primary: onboundary reveals each word as it's spoken
      let boundaryFired = false
      utter.onboundary = (e) => {
        if (e.name !== 'word') return
        boundaryFired = true
        const nextSpace = DESC.indexOf(' ', e.charIndex)
        setDescIdx(nextSpace === -1 ? DESC.length : nextSpace)
      }

      // Fallback: if onboundary never fires (some Chrome/voice combos), use interval
      let fallbackId = null
      utter.onstart = () => {
        setTimeout(() => {
          if (!boundaryFired) {
            fallbackId = setInterval(() => {
              setDescIdx(i => {
                if (i >= DESC.length) { clearInterval(fallbackId); return i }
                return i + 1
              })
            }, 50)
          }
        }, 600)
      }

      utter.onend = () => { clearInterval(fallbackId); setDescIdx(DESC.length) }

      synth.speak(utter)
    }

    window.addEventListener('mousedown', speak, { once: true })
    return () => { window.removeEventListener('mousedown', speak); synth.cancel() }
  }, [])

  useEffect(() => {
    const onMove = e => setMouse({ x: e.clientX, y: e.clientY })
    const onDown = () => { setClicking(true); setClicked(true) }
    const onUp   = () => setClicking(false)
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
    <div style={s.root} onClick={descIdx >= DESC.length ? onComplete : undefined}>

      {/* ── CSS keyframes for scrolling text ── */}
      <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      {/* ── Background scrolling text rows (aino-style) ── */}
      {TEXT_ROWS.map((row, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: row.top,
            left: 0,
            width: '100%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.07,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontFamily: row.font,
              fontSize: row.size,
              fontStyle: row.italic ? 'italic' : 'normal',
              fontWeight: row.italic ? 400 : 400,
              color: '#e0f0ff',
              letterSpacing: row.italic ? '0.01em' : '0.14em',
              textTransform: row.italic ? 'none' : 'uppercase',
              animation: `${row.dir === 'left' ? 'scrollLeft' : 'scrollRight'} ${row.speed}s linear infinite`,
            }}
          >
            {/* Duplicate text for seamless loop */}
            {row.text}{row.text}{row.text}{row.text}
          </span>
        </div>
      ))}

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
          animate={{ x: [0, p.driftX, 0], y: [0, p.driftY, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Custom cursor: position tracker ── */}
      <motion.div
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none', width: CURSOR_SIZE, height: CURSOR_SIZE }}
        animate={{ x: mouse.x - CURSOR_SIZE / 2, y: mouse.y - CURSOR_SIZE / 2 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.4 }}
      >
        {/* Small bubble — visible while typing, fades out when typing completes */}
        <motion.div
          style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 14, height: 14,
            borderRadius: '50%',
            background: 'rgba(0,245,255,0.9)',
            boxShadow: '0 0 14px rgba(0,245,255,0.9), 0 0 30px rgba(0,245,255,0.45)',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: descIdx >= DESC.length ? 0 : 1,
            scale:   descIdx >= DESC.length ? 0 : 1,
          }}
          transition={{
            opacity: { duration: 0.5, delay: descIdx === 0 ? 0.4 : 0 },
            scale:   { duration: 0.5, delay: descIdx === 0 ? 0.4 : 0 },
          }}
        />

        {/* Full circle — appears only once typing is complete */}
        <motion.div
          style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: descIdx >= DESC.length ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Circle with pulse / click shrink */}
          <motion.div
            style={{
              width: CURSOR_SIZE, height: CURSOR_SIZE,
              borderRadius: '50%',
              border: '1.5px solid rgba(0,245,255,0.75)',
              boxShadow: '0 0 28px rgba(0,245,255,0.4), inset 0 0 28px rgba(0,245,255,0.07)',
              background: 'rgba(4,6,15,0.4)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 2,
            }}
            animate={{ scale: clicking ? 0.86 : [1, 1.05, 1] }}
            transition={
              clicking
                ? { duration: 0.08 }
                : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <span style={s.cursorText}>CLICK TO</span>
            <span style={s.cursorText}>ENTER</span>
          </motion.div>
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

        {/* CO RESIDENTS + mitbewohner — grouped so sub right-aligns to hero */}
        <motion.div
          style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}
          initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
          animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={staggerDelay(1)}
        >
          <h1 style={s.hero}>Co residents</h1>
          <div style={{ ...s.sub, textAlign: 'right' }}>mitbewohner</div>
        </motion.div>

        {/* Divider */}
        <motion.div
          style={s.divider}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={ready ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ ...staggerDelay(3), duration: 0.9 }}
        />

        {/* Dispatch heading above the box */}
        <motion.div
          style={s.dispatchHeading}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={staggerDelay(4)}
        >
          DISPATCHES INCOMING
        </motion.div>

        {/* Description box — typewriter inside rectangle */}
        <motion.div
          style={s.descBox}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={staggerDelay(5)}
        >
          <p style={s.descText}>
            {DESC.slice(0, descIdx)}
            <span style={s.typeCursor}>|</span>
          </p>
        </motion.div>

        {/* Click hint — unmounts entirely on click */}
        <AnimatePresence>
          {!clicked && (
            <motion.div
              key="clickHint"
              style={s.clickHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 1.8 }}
            >
              · click anywhere ·
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Top bar — coord above time ── */}
      <motion.div
        style={s.topBar}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={staggerDelay(1)}
      >
        <span style={s.coord}>BERLIN · 52.520°N · 13.405°E</span>
        <div style={s.timeRow}>
          <span style={s.timeDot} />
          <span style={s.timeDigits}>
            {String(time.getHours()).padStart(2, '0')}
            <span style={s.timeSep}>:</span>
            {String(time.getMinutes()).padStart(2, '0')}
            <span style={s.timeSep}>:</span>
            {String(time.getSeconds()).padStart(2, '0')}
          </span>
          <span style={s.timeLabel}>LOCAL</span>
        </div>
      </motion.div>

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
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
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
  topBar: {
    position: 'absolute', top: 22, left: 0, right: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
    zIndex: 3, pointerEvents: 'none',
  },
  timeRow: {
    display: 'flex', alignItems: 'center', gap: 7,
  },
  dispatchHeading: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 'clamp(10px, 1vw, 12px)',
    fontStyle: 'normal',
    fontWeight: 600,
    letterSpacing: '0.22em',
    color: 'rgba(0,245,255,0.45)',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  descBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    maxWidth: 460, textAlign: 'center',
    border: '1px solid rgba(0,245,255,0.18)',
    background: 'rgba(0,245,255,0.03)',
    padding: '24px 32px',
    backdropFilter: 'blur(2px)',
  },
  descText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(13px, 1.4vw, 16px)',
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 1.85,
    letterSpacing: '0.02em',
    color: 'rgba(224,240,255,0.72)',
    margin: 0,
  },
  clickHint: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10,
    fontWeight: 400,
    letterSpacing: '0.3em',
    color: 'rgba(0,245,255,0.35)',
    textTransform: 'uppercase',
    animation: 'blink 2s ease-in-out infinite',
  },
  typeCursor: {
    display: 'inline-block',
    marginLeft: 1,
    animation: 'blink 0.8s step-end infinite',
    color: 'rgba(0,245,255,0.6)',
    fontStyle: 'normal',
    fontWeight: 300,
  },
  timeDot: {
    display: 'inline-block',
    width: 5, height: 5,
    borderRadius: '50%',
    background: '#00f5ff',
    boxShadow: '0 0 6px rgba(0,245,255,0.9)',
    animation: 'blink 1s step-end infinite',
    flexShrink: 0,
  },
  timeDigits: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    color: 'rgba(0,245,255,0.55)',
  },
  timeSep: {
    display: 'inline-block',
    animation: 'blink 1s step-end infinite',
    margin: '0 1px',
  },
  timeLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: '0.25em',
    color: 'rgba(0,245,255,0.25)',
    textTransform: 'uppercase',
  },
  cursorText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#00f5ff',
    lineHeight: 1,
    userSelect: 'none',
    textShadow: '0 0 14px rgba(0,245,255,0.7)',
  },
}
