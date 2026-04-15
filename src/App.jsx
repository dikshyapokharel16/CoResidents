import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import LandingScreen from './components/LandingScreen'
import HomeScreen from './components/HomeScreen'

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [mouse, setMouse] = useState({ x: -100, y: -100 })
  const goHome = useCallback(() => setScreen('home'), [])

  useEffect(() => {
    const onMove = e => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      {/* Global cursor — hidden on landing (LandingScreen renders its own) */}
      {screen !== 'landing' && <>
        {/* Outer ring — slightly lagging for depth */}
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
        {/* Inner dot — snaps immediately */}
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

      {screen === 'landing'
        ? <LandingScreen onComplete={goHome} />
        : <HomeScreen />
      }
    </>
  )
}
