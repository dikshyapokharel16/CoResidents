import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import ResidentMarker from './ResidentMarker'
import DispatchPopup from './DispatchPopup'
import { RESIDENTS, RESIDENT_TYPES } from '../data/residents'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const BERLIN_GEOJSON =
  'https://tsb-opendata.s3.eu-central-1.amazonaws.com/bezirksgrenzen/bezirksgrenzen.geojson'

// Fallback coordinates for Berlin neighbourhoods not covered by residents data
const KIEZ_COORDS = {
  'mitte':           { lng: 13.380, lat: 52.520, zoom: 13.5 },
  'prenzlauer berg': { lng: 13.430, lat: 52.537, zoom: 13.5 },
  'kreuzberg':       { lng: 13.388, lat: 52.497, zoom: 13.5 },
  'friedrichshain':  { lng: 13.453, lat: 52.512, zoom: 13.5 },
  'neukölln':        { lng: 13.435, lat: 52.480, zoom: 13.5 },
  'neukoelln':       { lng: 13.435, lat: 52.480, zoom: 13.5 },
  'charlottenburg':  { lng: 13.308, lat: 52.506, zoom: 13.5 },
  'tiergarten':      { lng: 13.360, lat: 52.514, zoom: 13.5 },
  'wedding':         { lng: 13.352, lat: 52.548, zoom: 13.5 },
  'pankow':          { lng: 13.403, lat: 52.568, zoom: 13.5 },
  'lichtenberg':     { lng: 13.500, lat: 52.510, zoom: 13.5 },
  'tempelhof':       { lng: 13.385, lat: 52.470, zoom: 13.5 },
  'treptow':         { lng: 13.460, lat: 52.490, zoom: 13.5 },
  'köpenick':        { lng: 13.575, lat: 52.455, zoom: 13.5 },
  'koepenick':       { lng: 13.575, lat: 52.455, zoom: 13.5 },
  'grunewald':       { lng: 13.241, lat: 52.467, zoom: 13.5 },
  'spandau':         { lng: 13.200, lat: 52.536, zoom: 13.0 },
  'reinickendorf':   { lng: 13.332, lat: 52.567, zoom: 13.5 },
  'schöneberg':      { lng: 13.352, lat: 52.490, zoom: 13.5 },
  'schoeneberg':     { lng: 13.352, lat: 52.490, zoom: 13.5 },
  'steglitz':        { lng: 13.320, lat: 52.460, zoom: 13.5 },
  'wilmersdorf':     { lng: 13.310, lat: 52.495, zoom: 13.5 },
  'moabit':          { lng: 13.340, lat: 52.528, zoom: 13.5 },
  'gesundbrunnen':   { lng: 13.388, lat: 52.560, zoom: 13.5 },
  'weissensee':      { lng: 13.465, lat: 52.555, zoom: 13.5 },
  'weißensee':       { lng: 13.465, lat: 52.555, zoom: 13.5 },
  'marzahn':         { lng: 13.567, lat: 52.540, zoom: 13.0 },
}

// All Berlin Kieze / neighbourhoods — used for autocomplete
const BERLIN_KIEZE = [
  'Adlershof', 'Alt-Hohenschönhausen', 'Alt-Treptow', 'Altglienicke',
  'Baumschulenweg', 'Biesdorf', 'Blankenburg', 'Bohnsdorf', 'Britz', 'Buch', 'Buckow',
  'Charlottenburg', 'Charlottenburg-Nord',
  'Dahlem', 'Französisch Buchholz', 'Friedenau', 'Friedrichsfelde',
  'Friedrichshagen', 'Friedrichshain',
  'Gatow', 'Gesundbrunnen', 'Gropiusstadt', 'Grunewald',
  'Hakenfelde', 'Halensee', 'Haselhorst', 'Heinersdorf', 'Hellersdorf', 'Hermsdorf',
  'Johannisthal', 'Karlshorst', 'Karow', 'Kaulsdorf', 'Kladow', 'Köpenick', 'Kreuzberg',
  'Lankwitz', 'Lichtenberg', 'Lichterfelde',
  'Mahlsdorf', 'Malchow', 'Mariendorf', 'Marienfelde', 'Märkisches Viertel',
  'Marzahn', 'Mitte', 'Moabit', 'Müggelheim',
  'Neukölln', 'Niederschöneweide', 'Niederschönhausen',
  'Oberschöneweide', 'Pankow', 'Plänterwald', 'Prenzlauer Berg',
  'Rahnsdorf', 'Reinickendorf', 'Rosenthal', 'Rudow', 'Rummelsburg',
  'Schöneberg', 'Siemensstadt', 'Spandau', 'Staaken', 'Steglitz',
  'Tegel', 'Tempelhof', 'Tiergarten', 'Treptow',
  'Wannsee', 'Wedding', 'Weißensee', 'Wilhelmstadt', 'Wilmersdorf', 'Wittenau',
  'Zehlendorf',
].sort()

// ── Neon district palette ──────────────────────────────────────────
const DISTRICT_PALETTE = [
  { fill: '#ff2d78', border: '#ff6699' }, // hot pink
  { fill: '#a855f7', border: '#cc88ff' }, // electric purple
  { fill: '#00d4ff', border: '#66e8ff' }, // electric cyan
  { fill: '#ff7c00', border: '#ffaa55' }, // neon orange
  { fill: '#22dd66', border: '#55ff99' }, // electric green
  { fill: '#4466ff', border: '#88aaff' }, // electric blue
  { fill: '#ff00aa', border: '#ff66cc' }, // magenta
  { fill: '#dddd00', border: '#ffff44' }, // neon yellow
  { fill: '#00ddcc', border: '#44ffee' }, // aqua
  { fill: '#ff5500', border: '#ff8844' }, // neon red
  { fill: '#88ff00', border: '#bbff44' }, // lime
  { fill: '#cc44ff', border: '#ee88ff' }, // violet
]

// ── Map layer specs ────────────────────────────────────────────────
const districtFill = {
  id: 'districts-fill', type: 'fill',
  paint: { 'fill-color': ['get', 'fillColor'], 'fill-opacity': 0.18 },
}
const districtGlow = {
  id: 'districts-glow', type: 'line',
  paint: {
    'line-color': ['get', 'borderColor'],
    'line-width': 8, 'line-blur': 10, 'line-opacity': 0.4,
  },
}
const districtLine = {
  id: 'districts-line', type: 'line',
  paint: {
    'line-color': ['get', 'borderColor'],
    'line-width': 1.2, 'line-opacity': 0.9,
  },
}
const districtLabel = {
  id: 'districts-label', type: 'symbol',
  minzoom: 8.5, maxzoom: 16,
  layout: {
    'text-field': ['coalesce', ['get','Gemeinde_n'], ['get','name'], ['get','Name'], ''],
    'text-font': ['Open Sans Bold'],
    'text-size': ['interpolate', ['linear'], ['zoom'], 8, 14, 10, 22, 12, 30, 14, 36],
    'text-letter-spacing': 0.24,
    'text-transform': 'uppercase',
    'text-max-width': 10,
    'text-anchor': 'center',
  },
  paint: {
    'text-color': ['get', 'borderColor'],
    'text-halo-color': 'rgba(2,3,12,0.98)',
    'text-halo-width': 4,
    'text-halo-blur': 1,
  },
}
// OSM building heights: prefer render_height (derived from building:levels in OSM)
// then explicit height tag, then fallback to 8 m (single storey)
const OSM_H = ['coalesce', ['to-number', ['get', 'render_height'], null], ['to-number', ['get', 'height'], null], 8]
const OSM_BASE = ['coalesce', ['to-number', ['get', 'render_min_height'], null], ['to-number', ['get', 'min_height'], null], 0]

const buildings3d = {
  id: '3d-buildings', source: 'carto', 'source-layer': 'building',
  type: 'fill-extrusion', minzoom: 13,
  paint: {
    // Height-based colour: taller buildings shift from deep navy → dark indigo
    'fill-extrusion-color': [
      'interpolate', ['linear'], OSM_H,
      0,   '#05060e',
      15,  '#080c1a',
      40,  '#0b1226',
      80,  '#0e1830',
      150, '#12203e',
    ],
    'fill-extrusion-height': OSM_H,
    'fill-extrusion-base': OSM_BASE,
    // Fade in as you zoom — avoids a pop at zoom 13
    'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.5, 0.95],
    'fill-extrusion-vertical-gradient': true,
  },
}

// Thin cyan cap on each rooftop — gives the neon skyline effect
const buildingsTop = {
  id: '3d-buildings-top', source: 'carto', 'source-layer': 'building',
  type: 'fill-extrusion', minzoom: 14,
  paint: {
    'fill-extrusion-color': [
      'interpolate', ['linear'], OSM_H,
      0,  '#00c8ff',
      80, '#a855f7',  // tall buildings get a purple cap
    ],
    'fill-extrusion-height': OSM_H,
    'fill-extrusion-base': ['max', 0, ['-', OSM_H, 0.9]],
    'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 14.5, 0, 16, 0.22],
  },
}

function pickResident(kiez) {
  if (kiez) {
    const matches = RESIDENTS.filter(r =>
      r.kiez.toLowerCase().includes(kiez.toLowerCase())
    )
    if (matches.length > 0)
      return matches[Math.floor(Math.random() * matches.length)]
  }
  return RESIDENTS[Math.floor(Math.random() * RESIDENTS.length)]
}

// ── Component ──────────────────────────────────────────────────────
export default function BerlinMap() {
  const mapRef = useRef()
  const autoTimerRef = useRef()

  const [viewState, setViewState] = useState({
    longitude: 13.405, latitude: 52.52,
    zoom: 10.5,
    pitch: 0,     // START FLAT (2D)
    bearing: 0,
  })
  const [districtData, setDistrictData] = useState(null)
  const [is3D, setIs3D] = useState(false)

  const [inputVal, setInputVal]         = useState('')
  const [submittedKiez, setSubmittedKiez] = useState('')
  const [locationSet, setLocationSet]   = useState(false)
  const [highlightKiez, setHighlightKiez] = useState(null)
  const [suggestions, setSuggestions]     = useState([])

  const [popup, setPopup]           = useState(null)
  const [popupShown, setPopupShown] = useState(false)

  const zoom        = viewState.zoom
  const showMarkers = zoom >= 11

  // ── Filter district GeoJSON to the matched kiez for highlight ──
  const highlightData = useMemo(() => {
    if (!districtData || !highlightKiez) return null
    const search = highlightKiez.toLowerCase()
    const words  = search.split(/\s+/).filter(w => w.length > 3)
    const matched = districtData.features.filter(f => {
      const name = (f.properties.Gemeinde_n || f.properties.name || f.properties.Name || '').toLowerCase()
      return name.includes(search) || words.some(w => name.includes(w))
    })
    if (!matched.length) return null
    return { type: 'FeatureCollection', features: matched }
  }, [districtData, highlightKiez])

  // ── Fetch + colorise districts ─────────────────────────────────
  useEffect(() => {
    fetch(BERLIN_GEOJSON)
      .then(r => r.json())
      .then(data => {
        setDistrictData({
          ...data,
          features: data.features.map((f, i) => {
            const p = DISTRICT_PALETTE[i % DISTRICT_PALETTE.length]
            return {
              ...f,
              properties: { ...f.properties, fillColor: p.fill, borderColor: p.border },
            }
          }),
        })
      })
      .catch(() => {})
  }, [])

  // ── Auto-popup after 14 s ──────────────────────────────────────
  useEffect(() => {
    autoTimerRef.current = setTimeout(() => {
      if (!popupShown) {
        setPopup(pickResident(null))
        setPopupShown(true)
      }
    }, 14000)
    return () => clearTimeout(autoTimerRef.current)
  }, [])

  // ── Click marker → fly to 3D + popup ──────────────────────────
  const handleResidentClick = useCallback((resident) => {
    const map = mapRef.current?.getMap()
    if (map) {
      map.easeTo({
        center: [resident.lng, resident.lat],
        zoom: 15.5,
        pitch: 62,
        bearing: -28,
        duration: 2600,
      })
    }
    setIs3D(true)
    clearTimeout(autoTimerRef.current)
    if (!popupShown) setPopupShown(true)
    setTimeout(() => setPopup(resident), 1900)
  }, [popupShown])

  // ── Reset to flat 2D overview ──────────────────────────────────
  // Configure directional light for realistic building shadows
  const handleMapLoad = useCallback((e) => {
    e.target.setLight({
      anchor: 'viewport',
      color: '#c8dfff',
      intensity: 0.4,
      position: [1.15, 210, 50],  // from southwest, ~40° above horizon
    })
  }, [])

  const handleReset = useCallback(() => {
    mapRef.current?.getMap()?.easeTo({
      center: [13.405, 52.52],
      zoom: 10.5, pitch: 0, bearing: 0, duration: 2000,
    })
    setIs3D(false)
    setPopup(null)
    setHighlightKiez(null)
    setLocationSet(false)
    setSubmittedKiez('')
  }, [])

  // ── Fly to a kiez by name (shared by form submit + suggestion click)
  const flyToKiez = useCallback((val) => {
    setSuggestions([])
    setSubmittedKiez(val)
    setLocationSet(true)
    setHighlightKiez(val)
    clearTimeout(autoTimerRef.current)

    const valLower = val.toLowerCase()
    const hits = RESIDENTS.filter(r =>
      r.kiez.toLowerCase().includes(valLower) ||
      valLower.includes(r.kiez.toLowerCase())
    )

    const map = mapRef.current?.getMap()
    if (map) {
      let target = null

      if (hits.length > 0) {
        target = {
          lng: hits.reduce((s, r) => s + r.lng, 0) / hits.length,
          lat: hits.reduce((s, r) => s + r.lat, 0) / hits.length,
        }
      } else {
        const entry = Object.entries(KIEZ_COORDS).find(([k]) =>
          k.includes(valLower) || valLower.includes(k)
        )
        if (entry) target = { lng: entry[1].lng, lat: entry[1].lat }
      }

      if (target) {
        setIs3D(true)
        map.easeTo({
          center: [target.lng, target.lat],
          zoom: 15,          // street-level zoom
          pitch: 52,
          bearing: -18,
          duration: 2200,
        })
      }
    }

    setTimeout(() => {
      if (!popupShown) {
        setPopup(pickResident(val))
        setPopupShown(true)
      }
    }, 2400)
  }, [popupShown])

  // ── Location submit ────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    const val = inputVal.trim()
    if (val) flyToKiez(val)
  }

  const legend = Object.entries(RESIDENT_TYPES).map(([key, val]) => ({
    key, ...val,
    count: RESIDENTS.filter(r => r.type === key).length,
  }))

  return (
    <motion.div
      style={{ width: '100vw', height: '100vh', position: 'relative', background: '#02030c' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* ── Map ───────────────────────────────────────────────── */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        onLoad={handleMapLoad}
      >
        {districtData && (
          <Source id="districts" type="geojson" data={districtData}>
            <Layer {...districtFill} />
            <Layer {...districtGlow} />
            <Layer {...districtLine} />
            <Layer {...districtLabel} />
          </Source>
        )}

        {/* ── Kiez highlight — amber/gold so it stands apart from all district colours ── */}
        {highlightData && (
          <Source id="kiez-highlight" type="geojson" data={highlightData}>
            {/* warm fill */}
            <Layer
              id="kiez-highlight-fill"
              type="fill"
              paint={{ 'fill-color': '#ffcc00', 'fill-opacity': 0.14 }}
            />
            {/* wide outer glow */}
            <Layer
              id="kiez-highlight-glow"
              type="line"
              paint={{ 'line-color': '#ffcc00', 'line-width': 16, 'line-blur': 28, 'line-opacity': 0.55 }}
            />
            {/* crisp inner border */}
            <Layer
              id="kiez-highlight-border"
              type="line"
              paint={{ 'line-color': '#ffee66', 'line-width': 2.5, 'line-opacity': 1 }}
            />
          </Source>
        )}

        <Layer {...buildings3d} />
        <Layer {...buildingsTop} />

        {RESIDENTS.map(r => (
          <Marker key={r.id} longitude={r.lng} latitude={r.lat} anchor="center">
            <ResidentMarker
              resident={r}
              visible={showMarkers}
              onMarkerClick={handleResidentClick}
            />
          </Marker>
        ))}

        <NavigationControl position="top-right" style={{ marginTop: 90 }} />
      </Map>

      {/* ── Grid overlay ──────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `
          linear-gradient(rgba(0,210,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,210,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />

      {/* ── Vignette ──────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(2,3,12,0.72) 100%)',
      }} />

      {/* ── 2D/3D mode badge ──────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute', top: 28, right: 110,
          display: 'flex', alignItems: 'center', gap: 10, zIndex: 10,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <AnimatePresence mode="wait">
          {is3D ? (
            <motion.div key="3d"
              style={{ display: 'flex', gap: 10 }}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
            >
              <div style={{
                ...badge,
                background: 'rgba(168,85,247,0.15)',
                border: '1px solid rgba(168,85,247,0.55)',
                color: '#cc88ff',
                boxShadow: '0 0 18px rgba(168,85,247,0.25)',
                textShadow: '0 0 10px rgba(168,85,247,0.9)',
              }}>
                ◆ 3D MODE
              </div>
              <motion.button
                style={{
                  ...badge, cursor: 'pointer',
                  background: 'rgba(0,245,255,0.08)',
                  border: '1px solid rgba(0,245,255,0.35)',
                  color: '#00f5ff',
                  textShadow: '0 0 8px #00f5ff',
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,245,255,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
              >
                ← Overview
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="2d"
              style={{
                ...badge,
                background: 'rgba(0,245,255,0.07)',
                border: '1px solid rgba(0,245,255,0.2)',
                color: 'rgba(0,245,255,0.6)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              ▦ 2D MAP
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Left panel ────────────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute', top: 28, left: 28,
          display: 'flex', flexDirection: 'column', gap: 14,
          zIndex: 10,
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {/* Headline */}
        <div>
          <div style={{
            fontFamily: 'Inter', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: '#00f5ff', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 8,
            textShadow: '0 0 12px #00f5ff',
          }}>
            <motion.span style={{
              display: 'inline-block', width: 6, height: 6,
              borderRadius: '50%', background: '#00f5ff',
              boxShadow: '0 0 10px #00f5ff, 0 0 20px #00f5ff',
            }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            Berlin · Live Conditions
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: 26,
            fontWeight: 700, letterSpacing: '0.06em',
            color: 'rgba(210,235,255,0.95)', lineHeight: 1.1,
            textShadow: '0 0 40px rgba(0,200,255,0.25)',
          }}>
            Who else lives here?
          </div>
          <div style={{
            fontFamily: 'Inter', fontSize: 11, fontWeight: 300,
            color: 'rgba(120,160,200,0.55)', marginTop: 5, letterSpacing: '0.04em',
          }}>
            {locationSet
              ? `Viewing: ${submittedKiez}`
              : `${RESIDENTS.length} stress reports · click a marker to explore in 3D`}
          </div>
        </div>

        {/* Location search + autocomplete */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', position: 'relative' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              value={inputVal}
              onChange={e => {
                const v = e.target.value
                setInputVal(v)
                if (v.trim().length < 1) { setSuggestions([]); return }
                setSuggestions(
                  BERLIN_KIEZE.filter(k => k.toLowerCase().includes(v.toLowerCase())).slice(0, 7)
                )
              }}
              onKeyDown={e => { if (e.key === 'Escape') setSuggestions([]) }}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
              placeholder="Enter your Kiez…"
              style={{
                background: 'rgba(2,3,12,0.92)',
                border: '1px solid rgba(0,245,255,0.22)',
                borderRight: 'none',
                borderRadius: suggestions.length > 0 ? '8px 0 0 0' : '8px 0 0 8px',
                padding: '9px 14px',
                color: 'rgba(210,235,255,0.88)',
                fontFamily: 'Inter', fontSize: 12,
                outline: 'none', width: 185,
                backdropFilter: 'blur(12px)',
                letterSpacing: '0.03em',
                transition: 'border-radius 0.1s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,245,255,0.6)'; e.target.style.boxShadow = '0 0 16px rgba(0,245,255,0.15)' }}
              onBlur={e =>  { e.target.style.borderColor = 'rgba(0,245,255,0.22)'; e.target.style.boxShadow = 'none' }}
            />
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'rgba(4,5,14,0.98)',
                border: '1px solid rgba(0,245,255,0.22)',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                overflow: 'hidden',
                zIndex: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}>
                {suggestions.map((name, i) => (
                  <div
                    key={name}
                    onMouseDown={() => { setInputVal(name); flyToKiez(name) }}
                    style={{
                      padding: '8px 14px',
                      fontFamily: 'Inter', fontSize: 12,
                      color: 'rgba(200,225,255,0.75)',
                      cursor: 'pointer',
                      borderBottom: i < suggestions.length - 1
                        ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.09)'; e.currentTarget.style.color = '#00f5ff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(200,225,255,0.75)' }}
                  >
                    <span style={{ fontSize: 9, color: 'rgba(0,245,255,0.4)' }}>▸</span>
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" style={{
            background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(168,85,247,0.2))',
            border: '1px solid rgba(0,245,255,0.45)',
            borderRadius: suggestions.length > 0 ? '0 8px 0 0' : '0 8px 8px 0',
            padding: '9px 16px',
            color: '#00f5ff', fontFamily: 'Inter',
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', cursor: 'pointer',
            textShadow: '0 0 8px #00f5ff',
            transition: 'border-radius 0.1s',
          }}>
            GO
          </button>
        </form>

        {/* Confirmed kiez pill */}
        <AnimatePresence>
          {locationSet && (
            <motion.div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(0,245,255,0.07)',
                border: '1px solid rgba(0,245,255,0.22)',
                borderRadius: 20, padding: '5px 12px',
                fontFamily: 'Inter', fontSize: 10.5,
                color: 'rgba(0,245,255,0.8)',
                letterSpacing: '0.05em', alignSelf: 'flex-start',
                boxShadow: '0 0 14px rgba(0,245,255,0.1)',
              }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 6px #00f5ff' }} />
              {submittedKiez} · dispatch incoming
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Bottom hint ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!is3D && !showMarkers && (
          <motion.div key="zoom-hint"
            style={{ ...hint, border: '1px solid rgba(0,245,255,0.25)', color: 'rgba(0,245,255,0.5)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            Scroll to zoom · markers appear at street level
          </motion.div>
        )}
        {!is3D && showMarkers && (
          <motion.div key="click-hint"
            style={{ ...hint, border: '1px solid rgba(168,85,247,0.4)', color: 'rgba(204,136,255,0.65)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            Click a resident to dive into 3D · read their dispatch
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Legend ────────────────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute', bottom: 32, right: 24,
          background: 'rgba(2,3,12,0.94)',
          border: '1px solid rgba(0,245,255,0.1)',
          borderRadius: 14, padding: '14px 16px',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,245,255,0.04)',
          minWidth: 190, zIndex: 10,
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div style={{
          fontFamily: 'Inter', fontSize: 8.5, letterSpacing: '0.24em',
          color: 'rgba(0,245,255,0.4)', textTransform: 'uppercase', marginBottom: 10,
        }}>
          Non-human residents
        </div>
        {legend.map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
            <span style={{ fontSize: 17, lineHeight: 1 }}>{item.emoji}</span>
            <span style={{
              fontFamily: 'Inter', fontSize: 12, flex: 1,
              color: item.color, textShadow: `0 0 8px ${item.color}77`,
            }}>
              {item.label}
            </span>
            <span style={{
              fontFamily: 'Inter', fontSize: 10,
              color: 'rgba(120,160,200,0.35)',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 4, padding: '1px 5px',
            }}>
              {item.count}
            </span>
          </div>
        ))}
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: '1px solid rgba(0,245,255,0.07)',
          fontFamily: 'Inter', fontSize: 9,
          color: 'rgba(0,245,255,0.22)', letterSpacing: '0.04em',
        }}>
          Click marker → read dispatch → act
        </div>
      </motion.div>

      {/* ── Bottom-left status ────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute', bottom: 32, left: 28,
          fontFamily: 'Inter', fontSize: 9.5, letterSpacing: '0.1em',
          color: 'rgba(120,155,200,0.3)', zIndex: 10,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {!is3D && zoom < 11  && '2D · Neighbourhood overview'}
        {!is3D && zoom >= 11 && '2D · Kiez level · click to dive in'}
        {is3D && '3D · Street level active · buildings extruded'}
      </motion.div>

      <div style={{
        position: 'absolute', bottom: 8, right: 8, zIndex: 10,
        fontFamily: 'Inter', fontSize: 8, color: 'rgba(120,155,200,0.18)',
      }}>
        © OpenStreetMap · CARTO · Berlin Open Data
      </div>

      {/* ── Dispatch Popup ────────────────────────────────────── */}
      <AnimatePresence>
        {popup && (
          <DispatchPopup resident={popup} onClose={() => setPopup(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Shared style snippets
const badge = {
  fontFamily: 'Inter', fontSize: 9, fontWeight: 700,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  borderRadius: 8, padding: '6px 13px',
  backdropFilter: 'blur(10px)',
}
const hint = {
  position: 'absolute', bottom: 100, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(2,3,12,0.88)',
  borderRadius: 24, padding: '9px 22px',
  fontFamily: 'Inter', fontSize: 10.5,
  letterSpacing: '0.13em', textTransform: 'uppercase',
  backdropFilter: 'blur(12px)', whiteSpace: 'nowrap',
  pointerEvents: 'none', zIndex: 10,
}
