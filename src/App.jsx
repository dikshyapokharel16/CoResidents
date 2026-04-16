import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LandingScreen from './components/LandingScreen'
import HomeScreen from './components/HomeScreen'

const AMBIENT_FILES = [
  '/CoResidents/audio/826582__newlocknew__dsgnerie_a-far-dark-otherworldly-transitions-2-x4_em.mp3',
  '/CoResidents/audio/212459__unfa__electronic-noise-in-the-city.flac',
]
const AMBIENT_VOLUMES = [0.55, 0.35]

function fadeVolume(audio, from, to, durationMs) {
  const steps = 40
  const interval = durationMs / steps
  const delta = (to - from) / steps
  let current = from
  let step = 0
  const id = setInterval(() => {
    step++
    current = Math.min(Math.max(current + delta, 0), 1)
    audio.volume = current
    if (step >= steps) clearInterval(id)
  }, interval)
  return id
}

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [mouse, setMouse] = useState({ x: -100, y: -100 })
  const [soundOn, setSoundOn] = useState(false)
  const ambientRefs = useRef([])
  const startedRef = useRef(false)
  const goHome = useCallback(() => setScreen('home'), [])

  // Create audio elements once
  useEffect(() => {
    const audios = AMBIENT_FILES.map(src => {
      const a = new Audio(src)
      a.loop = true
      a.volume = 0
      return a
    })
    ambientRefs.current = audios
    return () => audios.forEach(a => { a.pause(); a.src = '' })
  }, [])

  const toggleSound = useCallback(() => {
    const audios = ambientRefs.current
    if (!audios.length) return

    if (!soundOn) {
      // First time — need to call play() from direct click handler
      if (!startedRef.current) {
        audios.forEach((a, i) => {
          a.play().catch(() => {})
          fadeVolume(a, 0, AMBIENT_VOLUMES[i], 1500)
        })
        startedRef.current = true
      } else {
        audios.forEach((a, i) => {
          a.play().catch(() => {})
          fadeVolume(a, 0, AMBIENT_VOLUMES[i], 800)
        })
      }
      setSoundOn(true)
    } else {
      audios.forEach(a => fadeVolume(a, a.volume, 0, 600))
      setTimeout(() => audios.forEach(a => a.pause()), 650)
      setSoundOn(false)
    }
  }, [soundOn])

  const duckAmbient = useCallback(() => {
    if (!soundOn) return
    ambientRefs.current.forEach(a => fadeVolume(a, a.volume, 0, 400))
  }, [soundOn])

  const restoreAmbient = useCallback(() => {
    if (!soundOn) return
    ambientRefs.current.forEach((a, i) => fadeVolume(a, a.volume, AMBIENT_VOLUMES[i], 800))
  }, [soundOn])

  useEffect(() => {
    const onMove = e => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      {/* Global cursor */}
      {screen !== 'landing' && <>
        <motion.div
          style={{
            position: 'fixed', top: 0, left: 0, zIndex: 99999,
            width: 30, height: 30, borderRadius: '50%',
            border: '1.5px solid rgba(0,245,255,0.6)',
            boxShadow: '0 0 12px rgba(0,245,255,0.25)',
            pointerEvents: 'none',
          }}
          animate={{ x: mouse.x - 15, y: mouse.y - 15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.3 }}
        />
        <motion.div
          style={{
            position: 'fixed', top: 0, left: 0, zIndex: 99999,
            width: 4, height: 4, borderRadius: '50%',
            background: '#00f5ff',
            boxShadow: '0 0 8px rgba(0,245,255,0.9)',
            pointerEvents: 'none',
          }}
          animate={{ x: mouse.x - 2, y: mouse.y - 2 }}
          transition={{ type: 'spring', stiffness: 900, damping: 40, mass: 0.05 }}
        />
      </>}

      {/* Sound toggle button — only on map screen */}
      <AnimatePresence>
        {screen === 'home' && (
          <motion.button
            key="soundBtn"
            style={{
              position: 'fixed', bottom: 28, left: 24, zIndex: 500,
              width: 40, height: 40, borderRadius: '50%',
              background: soundOn ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${soundOn ? 'rgba(0,245,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
              color: soundOn ? '#00f5ff' : 'rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: soundOn ? '0 0 16px rgba(0,245,255,0.2)' : 'none',
              transition: 'background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            onClick={toggleSound}
            title={soundOn ? 'Mute ambient sound' : 'Play ambient sound'}
          >
            {/* Pulsing ring when sound is on */}
            {soundOn && (
              <motion.span
                style={{
                  position: 'absolute', inset: -5, borderRadius: '50%',
                  border: '1px solid rgba(0,245,255,0.3)',
                  pointerEvents: 'none',
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {soundOn ? (
              /* Speaker with waves */
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 5.5h2.5L8 2.5v11L4.5 10.5H2V5.5z" fill="currentColor"/>
                <path d="M10 5.5c1.1 0.9 1.7 2.1 1.7 2.5s-0.6 1.6-1.7 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M11.5 3.5c1.8 1.4 2.8 2.8 2.8 4.5s-1 3.1-2.8 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            ) : (
              /* Speaker muted */
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 5.5h2.5L8 2.5v11L4.5 10.5H2V5.5z" fill="currentColor"/>
                <line x1="11" y1="5.5" x2="14.5" y2="10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <line x1="14.5" y1="5.5" x2="11" y2="10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {screen === 'landing'
        ? <LandingScreen onComplete={goHome} />
        : <HomeScreen onVoiceStart={duckAmbient} onVoiceStop={restoreAmbient} />
      }
    </>
  )
}
