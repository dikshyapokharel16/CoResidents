import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RESIDENT_TYPES } from '../data/residents'
import { stressBadge } from '../theme'
import { icons } from './icons'

export default function ResidentMarker({ resident, visible, onMarkerClick }) {
  const [hovered, setHovered] = useState(false)
  const type = RESIDENT_TYPES[resident.type]
  const Icon = icons[resident.type]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={{ position: 'relative', cursor: 'pointer', zIndex: hovered ? 200 : 1 }}
          initial={{ opacity: 0, scale: 0, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onMarkerClick?.(resident)}
        >
          {/* Single gentle pulse ring */}
          <motion.div
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 46, height: 46,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `1.5px solid ${type.color}`,
              pointerEvents: 'none',
            }}
            animate={{ scale: [1, 1.9, 1], opacity: [0.45, 0, 0.45] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
          />

          {/* Main icon bubble */}
          <motion.div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: `rgba(4,6,15,0.88)`,
              border: `2px solid ${type.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 14px ${type.color}55, 0 2px 8px rgba(0,0,0,0.5)`,
            }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.15, boxShadow: `0 0 22px ${type.color}88` }}
          >
            {Icon && Icon(type.color)}
          </motion.div>

          {/* Tooltip */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: 52, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 210,
                  background: 'rgba(4,6,15,0.97)',
                  border: `1px solid ${type.color}55`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  backdropFilter: 'blur(16px)',
                  pointerEvents: 'none',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
                  zIndex: 300,
                }}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* Tip arrow */}
                <div style={{
                  position: 'absolute', bottom: -5, left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: 8, height: 8,
                  background: 'rgba(26,16,10,0.97)',
                  borderRight: `1px solid ${type.color}55`,
                  borderBottom: `1px solid ${type.color}55`,
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: `${type.color}20`, border: `1.5px solid ${type.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {Icon && Icon(type.color)}
                  </div>
                  <div>
                    <div style={{ color: type.color, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'Inter' }}>
                      {type.label}
                    </div>
                    <div style={{ color: 'rgba(224,240,255,0.35)', fontSize: 9.5, fontFamily: 'Inter', letterSpacing: '0.06em' }}>
                      {resident.kiez}
                    </div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', flexShrink: 0,
                    ...stressBadge,
                  }}>
                    {resident.stress}
                  </div>
                </div>

                <p style={{
                  color: 'rgba(224,240,255,0.5)', fontSize: 10.5,
                  lineHeight: 1.6, fontWeight: 300, fontFamily: 'Inter', margin: 0,
                }}>
                  {resident.detail}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
