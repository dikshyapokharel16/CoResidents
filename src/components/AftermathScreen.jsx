import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const HEALTH_COLOR = (score) => {
  if (score < 40) return '#e05050'
  if (score < 65) return '#d4a02a'
  return '#8ab8b2'
}

const POP_DOT_COLOR = (status) => {
  if (status === 'At Risk')    return '#e05050'
  if (status === 'Recovering') return '#d4a02a'
  return '#8ab8b2'
}

export default function AftermathScreen({ resident, type, Icon, helperCount, kiezHealth, onClose }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(resident.imagePrompt)}?width=800&height=500&nologo=true&seed=${resident.id}`

  // Preload image
  useEffect(() => {
    const img = new Image()
    img.onload  = () => setImgLoaded(true)
    img.onerror = () => setImgError(true)
    img.src = imgUrl
  }, [imgUrl])

  const healthColor = HEALTH_COLOR(kiezHealth)
  const popColor    = POP_DOT_COLOR(type.populationStatus)

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
          background: `${type.color}1a`,
          border: `2px solid ${type.color}`,
          boxShadow: `0 0 20px ${type.color}40`,
        }}>
          {Icon && Icon(type.color)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: type.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter' }}>
            Aftermath — {type.label}
          </div>
          <div style={{ color: 'rgba(212,190,168,0.5)', fontSize: 11, fontFamily: 'Inter', marginTop: 2 }}>
            {resident.kiez}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(212,168,136,0.1)', margin: '0 0 18px' }} />

      {/* AI Image */}
      <div style={s.imgWrap}>
        {!imgLoaded && !imgError && (
          <motion.div
            style={s.skeleton}
            animate={{ opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span style={s.skeletonLabel}>Rendering scene…</span>
          </motion.div>
        )}
        {imgError && (
          <div style={{ ...s.skeleton, opacity: 0.5 }}>
            <span style={{ ...s.skeletonLabel, color: 'rgba(212,190,168,0.3)' }}>Image unavailable</span>
          </div>
        )}
        {!imgError && (
          <img
            src={imgUrl}
            alt="Aftermath scene"
            style={{ ...s.img, opacity: imgLoaded ? 1 : 0 }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Aftermath narrative */}
      <div style={s.sectionLabel}>What changed</div>
      <p style={s.narrative}>{resident.aftermath}</p>

      {/* Stats row */}
      <div style={s.statsRow}>

        {/* Helpers */}
        <div style={{ ...s.statCell, borderColor: `${type.color}30` }}>
          <div style={s.statNum}>{helperCount.toLocaleString()}</div>
          <div style={s.statLabel}>Helpers like you</div>
        </div>

        {/* Population status */}
        <div style={{ ...s.statCell, borderColor: `${type.color}30` }}>
          <motion.div
            style={{ width: 9, height: 9, borderRadius: '50%', background: popColor, flexShrink: 0, marginBottom: 10 }}
            animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div style={{ ...s.statNum, fontSize: 14, marginBottom: 0, lineHeight: 1.2 }}>{type.populationStatus}</div>
          <div style={s.statLabel}>Population</div>
        </div>

        {/* Kiez health */}
        <div style={{ ...s.statCell, borderColor: `${type.color}30` }}>
          <div style={{ ...s.statNum, color: healthColor }}>{kiezHealth}<span style={{ fontSize: 12, opacity: 0.6 }}>/100</span></div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, margin: '6px 0 6px', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: healthColor, borderRadius: 3 }}
              initial={{ width: 0 }}
              animate={{ width: `${kiezHealth}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <div style={s.statLabel}>Kiez health</div>
        </div>

      </div>

      {/* Back button */}
      <motion.button
        style={{ ...s.backBtn, borderColor: type.color, color: type.color }}
        whileHover={{ backgroundColor: `${type.color}22`, scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
      >
        Back to the map
      </motion.button>
    </motion.div>
  )
}

const s = {
  card: {
    width: '100%', maxWidth: 480,
    background: 'rgba(4,6,15,0.97)',
    border: '1px solid rgba(0,245,255,0.12)',
    borderRadius: 16,
    padding: '32px 32px 28px',
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
  header: {
    display: 'flex', alignItems: 'center',
    gap: 14, marginBottom: 16,
  },
  iconBubble: {
    width: 44, height: 44, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  imgWrap: {
    width: '100%', height: 300,
    borderRadius: 12, overflow: 'hidden',
    marginBottom: 28, position: 'relative',
    background: 'rgba(255,255,255,0.04)',
  },
  skeleton: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(0,245,255,0.06) 0%, rgba(157,0,255,0.05) 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  skeletonLabel: {
    fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.18em',
    textTransform: 'uppercase', color: 'rgba(212,190,168,0.4)',
  },
  img: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.5s ease',
  },
  sectionLabel: {
    fontFamily: 'Inter', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: 'rgba(212,168,136,0.35)', marginBottom: 14,
  },
  narrative: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 16, lineHeight: 1.88,
    color: 'rgba(224,240,255,0.82)',
    fontStyle: 'italic', fontWeight: 400,
    margin: '0 0 32px',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    gap: 10, marginBottom: 28,
  },
  statCell: {
    border: '1px solid',
    borderRadius: 10, padding: '18px 16px',
    background: 'rgba(212,104,42,0.04)',
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
    color: 'rgba(224,240,255,0.28)', marginTop: 4,
  },
  backBtn: {
    width: '100%', padding: '16px 0',
    background: 'transparent',
    border: '1.5px solid',
    borderRadius: 10, cursor: 'pointer',
    fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
    letterSpacing: '0.06em',
    transition: 'background 0.2s',
  },
}
