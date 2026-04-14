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

// ── Earthy random palette — warm rust / terracotta / mist teal ───
function makeEarthyPalette(n) {
  const bands = [[8,30],[18,38],[340,375],[168,192],[28,45]]
  return Array.from({ length: n }, (_, i) => {
    const [lo, hi] = bands[i % bands.length]
    const hue  = Math.round(lo + Math.random() * (hi - lo)) % 360
    const sat  = 40 + Math.round(Math.random() * 28)   // 40–68% — earthy saturation
    const fill = 32 + Math.round(Math.random() * 18)   // 32–50% — rich but not washed
    const bord = Math.min(fill + 18, 70)
    return {
      fill:   `hsl(${hue},${sat}%,${fill}%)`,
      border: `hsl(${hue},${sat}%,${bord}%)`,
    }
  })
}

// ── Map layer specs ────────────────────────────────────────────────
const districtFill = {
  id: 'districts-fill', type: 'fill',
  paint: { 'fill-color': ['get', 'fillColor'], 'fill-opacity': 0.28 },
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
// Compute bounding-box centre of a GeoJSON Polygon or MultiPolygon feature
function featureCentroid(feature) {
  let ring
  if (feature.geometry.type === 'Polygon') {
    ring = feature.geometry.coordinates[0]
  } else {
    // MultiPolygon — pick the largest outer ring by vertex count
    ring = feature.geometry.coordinates.reduce((a, b) =>
      a[0].length >= b[0].length ? a : b
    )[0]
  }
  const lngs = ring.map(c => c[0])
  const lats  = ring.map(c => c[1])
  return {
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
  }
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
      0,   '#04060f',
      15,  '#08091a',
      40,  '#0d0e2a',
      80,  '#12143a',
      150, '#181a4a',
    ],
    'fill-extrusion-height': OSM_H,
    'fill-extrusion-base': OSM_BASE,
    // Fade in as you zoom — avoids a pop at zoom 13
    'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.5, 0.95],
    'fill-extrusion-vertical-gradient': true,
  },
}

// Warm rust/terracotta cap on each rooftop
const buildingsTop = {
  id: '3d-buildings-top', source: 'carto', 'source-layer': 'building',
  type: 'fill-extrusion', minzoom: 14,
  paint: {
    'fill-extrusion-color': [
      'interpolate', ['linear'], OSM_H,
      0,  '#00f5ff',  // neon cyan cap
      80, '#ff00cc',  // magenta for tall buildings
    ],
    'fill-extrusion-height': OSM_H,
    'fill-extrusion-base': ['max', 0, ['-', OSM_H, 0.9]],
    'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 14.5, 0, 16, 0.22],
  },
}

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
// Berlin bounding box — keeps results inside the city
const BERLIN_BOX = 'viewbox=13.09,52.68,13.76,52.34&bounded=1'

// Single best match — used by flyToKiez fallback
async function geocodeKiez(name) {
  try {
    const q = encodeURIComponent(`${name}, Berlin`)
    const res = await fetch(`${NOMINATIM}?q=${q}&format=json&limit=1&countrycodes=de&${BERLIN_BOX}`,
      { headers: { 'Accept-Language': 'de' } })
    const json = await res.json()
    if (json[0]) return { lng: parseFloat(json[0].lon), lat: parseFloat(json[0].lat) }
  } catch (_) {}
  return null
}

// Up to N results — used for live search suggestions
async function searchNominatim(query, limit = 5) {
  try {
    const q = encodeURIComponent(`${query}, Berlin`)
    const res = await fetch(`${NOMINATIM}?q=${q}&format=json&limit=${limit}&countrycodes=de&${BERLIN_BOX}`,
      { headers: { 'Accept-Language': 'de' } })
    return await res.json()
  } catch (_) { return [] }
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
  const [districtCentroids, setDistrictCentroids] = useState([])
  const [is3D, setIs3D] = useState(false)

  const [inputVal, setInputVal]         = useState('')
  const [submittedKiez, setSubmittedKiez] = useState('')
  const [locationSet, setLocationSet]   = useState(false)
  const [highlightKiez, setHighlightKiez] = useState(null)
  const [suggestions, setSuggestions]     = useState([])

  const [popup, setPopup]           = useState(null)
  const [popupShown, setPopupShown] = useState(false)

  const [userPin, setUserPin]         = useState(null)   // { lng, lat, label }
  const [clickToPlace, setClickToPlace] = useState(false)

  const zoom           = viewState.zoom
  const showMarkers    = zoom >= 9
  const showKiezLabels = zoom >= 8.5 && zoom < 15

  // ── Random session subset — shuffled once on mount ────────────────
  // At overview zoom show 14 random residents; zoomed in show all
  const [sessionResidents] = useState(
    () => [...RESIDENTS].sort(() => Math.random() - 0.5)
  )
  const activeResidents = zoom >= 12 ? RESIDENTS : sessionResidents.slice(0, 14)

  // ── Live search suggestions: kiez names + Nominatim geocoding ────
  useEffect(() => {
    const v = inputVal.trim()
    if (v.length < 2) { setSuggestions([]); return }
    const vl = v.toLowerCase()

    // Instant local matches
    const kiez = BERLIN_KIEZE
      .filter(k => k.toLowerCase().includes(vl))
      .slice(0, 3)
      .map(k => ({ type: 'kiez', label: k }))
    setSuggestions(kiez)

    // Debounced Nominatim for addresses / landmarks
    const t = setTimeout(async () => {
      const geo = await searchNominatim(v)
      const places = geo
        .map(r => ({
          type: 'place',
          label: r.display_name.split(',')[0].trim(),
          lng: parseFloat(r.lon),
          lat: parseFloat(r.lat),
        }))
        .filter(p => !kiez.some(k => k.label.toLowerCase() === p.label.toLowerCase()))
        .slice(0, 4)
      setSuggestions([...kiez, ...places])
    }, 380)
    return () => clearTimeout(t)
  }, [inputVal])

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
        const palette  = makeEarthyPalette(data.features.length)
        const coloured = data.features.map((f, i) => {
          const p = palette[i]
          return {
            ...f,
            properties: { ...f.properties, fillColor: p.fill, borderColor: p.border },
          }
        })
        setDistrictData({ ...data, features: coloured })
        setDistrictCentroids(
          coloured.map(f => {
            const name = f.properties.Gemeinde_n || f.properties.name || f.properties.Name || ''
            return { ...featureCentroid(f), name, borderColor: f.properties.borderColor }
          })
        )
      })
      .catch(() => {})
  }, [])

  // ── Cancel click-to-place on Escape ───────────────────────────
  useEffect(() => {
    if (!clickToPlace) return
    const handler = e => { if (e.key === 'Escape') setClickToPlace(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [clickToPlace])

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
        zoom: 17,
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

  // ── Activate click-to-place mode ────────────────────────────
  const handleAddLocation = useCallback(() => {
    setClickToPlace(true)
  }, [])

  const handleMapClick = useCallback(e => {
    if (!clickToPlace) return
    const { lng, lat } = e.lngLat
    setUserPin({ lng, lat, label: 'Dropped pin' })
    setClickToPlace(false)
    setIs3D(true)
    mapRef.current?.getMap()?.easeTo({ center: [lng, lat], zoom: 17, pitch: 52, bearing: -18, duration: 1200 })
  }, [clickToPlace])

  // ── Fly to a kiez by name (shared by form submit + suggestion click)
  const flyToKiez = useCallback(async (val, preCoords = null) => {
    setSuggestions([])
    setSubmittedKiez(val)
    setLocationSet(true)
    setHighlightKiez(val)
    clearTimeout(autoTimerRef.current)

    const valLower = val.toLowerCase()

    // 0. Use pre-computed coords if provided (e.g. from a geocoded suggestion)
    let target = preCoords

    if (!target) {
      // 1. Residents centroid
      const hits = RESIDENTS.filter(r => r.kiez.toLowerCase().includes(valLower))
      if (hits.length > 0) {
        target = {
          lng: hits.reduce((s, r) => s + r.lng, 0) / hits.length,
          lat: hits.reduce((s, r) => s + r.lat, 0) / hits.length,
        }
      }
    }
    if (!target) {
      // 2. Local KIEZ_COORDS table
      const key = Object.keys(KIEZ_COORDS).find(k => k.includes(valLower) || valLower.includes(k))
      if (key) target = { lng: KIEZ_COORDS[key].lng, lat: KIEZ_COORDS[key].lat }
    }
    if (!target) {
      // 3. Nominatim geocoding — covers every Berlin neighbourhood
      target = await geocodeKiez(val)
    }

    const map = mapRef.current?.getMap()
    if (map && target) {
      setIs3D(true)
      map.easeTo({
        center: [target.lng, target.lat],
        zoom: 17,
        pitch: 52,
        bearing: -18,
        duration: 2000,
      })
    }

    setTimeout(() => {
      setPopup(pickResident(val))
      setPopupShown(true)
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
      style={{ width: '100vw', height: '100vh', position: 'relative', background: '#04060f' }}
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
        onClick={handleMapClick}
        cursor={clickToPlace ? 'crosshair' : 'grab'}
      >
        {districtData && (
          <Source id="districts" type="geojson" data={districtData}>
            <Layer {...districtFill} />
            <Layer {...districtGlow} />
            <Layer {...districtLine} />
          </Source>
        )}

        {/* ── Kiez highlight — amber/gold so it stands apart from all district colours ── */}
        {highlightData && (
          <Source id="kiez-highlight" type="geojson" data={highlightData}>
            {/* warm fill */}
            <Layer
              id="kiez-highlight-fill"
              type="fill"
              paint={{ 'fill-color': '#e08858', 'fill-opacity': 0.14 }}
            />
            {/* wide outer glow */}
            <Layer
              id="kiez-highlight-glow"
              type="line"
              paint={{ 'line-color': '#e08858', 'line-width': 16, 'line-blur': 28, 'line-opacity': 0.55 }}
            />
            {/* crisp inner border */}
            <Layer
              id="kiez-highlight-border"
              type="line"
              paint={{ 'line-color': '#ffee66', 'line-width': 2.5, 'line-opacity': 1 }}
            />
          </Source>
        )}

        {/* ── District name text boxes — mounted only when visible ── */}
        {showKiezLabels && districtCentroids.map((d, i) => d.name && (
          <Marker key={`kl-${i}`} longitude={d.lng} latitude={d.lat} anchor="center" style={{ zIndex: 5 }}>
            <div style={{
              pointerEvents: 'none',
              background: 'rgba(4,6,15,0.82)',
              border: `1.5px solid ${d.borderColor}`,
              borderRadius: 7,
              padding: '5px 12px',
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: d.borderColor,
              textShadow: `0 0 14px ${d.borderColor}, 0 0 28px ${d.borderColor}66`,
              boxShadow: `0 0 20px ${d.borderColor}33, 0 2px 12px rgba(0,0,0,0.7)`,
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              lineHeight: 1,
            }}>
              {d.name}
            </div>
          </Marker>
        ))}

        <Layer {...buildings3d} />
        <Layer {...buildingsTop} />

        {activeResidents.map(r => (
          <Marker key={r.id} longitude={r.lng} latitude={r.lat} anchor="center">
            <ResidentMarker
              resident={r}
              visible={showMarkers}
              onMarkerClick={handleResidentClick}
            />
          </Marker>
        ))}

        <NavigationControl position="top-right" style={{ marginTop: 90 }} />

        {/* ── User-dropped pin (draggable) ──────────────────── */}
        {userPin && (
          <Marker
            longitude={userPin.lng} latitude={userPin.lat} anchor="bottom"
            draggable
            onDragStart={() => setUserPin(p => ({ ...p, dragging: true }))}
            onDragEnd={e => setUserPin(p => ({ ...p, lng: e.lngLat.lng, lat: e.lngLat.lat, dragging: false }))}
          >
            <motion.div
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab' }}
              initial={{ opacity: 0, y: -12, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              {/* Pulse ring — hidden while dragging */}
              {!userPin.dragging && (
                <motion.div style={{
                  position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                  width: 40, height: 40, borderRadius: '50%',
                  border: '2px solid #e08858', pointerEvents: 'none',
                }}
                  animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                />
              )}
              {/* Pin bubble */}
              <div style={{
                background: 'rgba(28,18,12,0.95)', border: '2px solid #e08858',
                borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 18px #e0885877, 0 4px 12px rgba(0,0,0,0.6)',
              }}>
                <span style={{ transform: 'rotate(45deg)', fontSize: 14 }}>📍</span>
              </div>
              {/* Coordinates label */}
              <div style={{
                marginTop: 4,
                background: 'rgba(28,18,12,0.9)', border: '1px solid rgba(224,136,88,0.4)',
                borderRadius: 6, padding: '3px 8px',
                fontFamily: 'Inter', fontSize: 9, fontWeight: 600,
                letterSpacing: '0.06em', color: '#e08858',
                whiteSpace: 'nowrap',
              }}>
                {userPin.lat.toFixed(4)}°, {userPin.lng.toFixed(4)}°
              </div>
            </motion.div>
          </Marker>
        )}
      </Map>

      {/* ── Grid overlay ──────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `
          linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />

      {/* ── Vignette ──────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(18,12,8,0.72) 100%)',
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
                background: 'rgba(255,0,204,0.15)',
                border: '1px solid rgba(255,0,204,0.55)',
                color: '#d4906e',
                boxShadow: '0 0 18px rgba(255,0,204,0.25)',
                textShadow: '0 0 10px rgba(255,0,204,0.9)',
              }}>
                ◆ 3D MODE
              </div>
              <motion.button
                style={{
                  ...badge, cursor: 'pointer',
                  background: 'rgba(0,245,255,0.1)',
                  border: '1px solid rgba(0,245,255,0.4)',
                  color: '#00f5ff',
                  textShadow: '0 0 8px rgba(0,245,255,0.7)',
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
                border: '1px solid rgba(0,245,255,0.25)',
                color: 'rgba(0,245,255,0.7)',
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
          position: 'absolute', top: 44, left: 28,
          display: 'flex', flexDirection: 'column', gap: 20,
          zIndex: 10,
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {/* Headline */}
        <div>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: 28,
            fontWeight: 700, letterSpacing: '0.04em',
            color: 'rgba(237,228,216,0.92)', lineHeight: 1.1,
            textShadow: '0 0 40px rgba(0,245,255,0.18)',
          }}>
            Who else lives here?
          </div>
          <div style={{
            fontFamily: 'Inter', fontSize: 11, fontWeight: 300,
            color: 'rgba(224,240,255,0.4)', marginTop: 5, letterSpacing: '0.04em',
          }}>
            {locationSet
              ? `Viewing: ${submittedKiez}`
              : `${RESIDENTS.length} stress reports · click a marker to explore in 3D`}
          </div>
        </div>

        {/* ── Search any location ────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', position: 'relative' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') setSuggestions([]) }}
              placeholder="Search Kiez, address, place…"
              style={{
                background: 'rgba(4,6,15,0.94)',
                border: '1px solid rgba(0,245,255,0.28)',
                borderRight: 'none',
                borderRadius: suggestions.length > 0 ? '8px 0 0 0' : '8px 0 0 8px',
                padding: '11px 18px',
                color: 'rgba(237,228,216,0.88)',
                fontFamily: 'Inter', fontSize: 13,
                outline: 'none', width: 195,
                backdropFilter: 'blur(12px)',
                letterSpacing: '0.03em',
                transition: 'border-radius 0.1s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,245,255,0.7)'; e.target.style.boxShadow = '0 0 16px rgba(0,245,255,0.18)' }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(0,245,255,0.28)'
                e.target.style.boxShadow = 'none'
                setTimeout(() => setSuggestions([]), 160)
              }}
            />
            {/* Suggestions: Kieze (instant) + addresses (geocoded) */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'rgba(4,6,15,0.98)',
                border: '1px solid rgba(0,245,255,0.25)', borderTop: 'none',
                borderRadius: '0 0 8px 8px', overflow: 'hidden',
                zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
              }}>
                {suggestions.map((s, i) => (
                  <div
                    key={s.label + i}
                    onMouseDown={() => {
                      setInputVal(s.label)
                      s.type === 'place'
                        ? flyToKiez(s.label, { lng: s.lng, lat: s.lat })
                        : flyToKiez(s.label)
                    }}
                    style={{
                      padding: '8px 14px',
                      fontFamily: 'Inter', fontSize: 12,
                      color: 'rgba(224,240,255,0.6)', cursor: 'pointer',
                      borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.12)'; e.currentTarget.style.color = 'rgba(224,240,255,0.92)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(224,240,255,0.6)' }}
                  >
                    <span style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0, color: s.type === 'kiez' ? 'rgba(0,245,255,0.7)' : 'rgba(255,0,204,0.7)' }}>
                      {s.type === 'kiez' ? 'Kiez' : '📍'}
                    </span>
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" style={{
            background: 'linear-gradient(135deg, rgba(212,104,42,0.22), rgba(255,0,204,0.22))',
            border: '1px solid rgba(0,245,255,0.5)',
            borderRadius: suggestions.length > 0 ? '0 8px 0 0' : '0 8px 8px 0',
            padding: '9px 16px', color: '#00f5ff',
            fontFamily: 'Inter', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', cursor: 'pointer',
            textShadow: '0 0 8px rgba(212,104,42,0.6)', transition: 'border-radius 0.1s',
          }}>
            GO
          </button>
        </form>

        {/* ── Search dispatch ───────────────────────────────── */}
        <motion.button
          onClick={() => setPopup(pickResident(submittedKiez || ''))}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,245,255,0.07)',
            border: '1px solid rgba(0,245,255,0.35)',
            borderRadius: 8, padding: '9px 14px',
            fontFamily: 'Inter', fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#00f5ff', cursor: 'pointer',
            boxShadow: '0 0 16px rgba(0,245,255,0.1)',
            transition: 'background 0.2s, box-shadow 0.2s',
            width: '100%',
          }}
          whileHover={{ backgroundColor: 'rgba(0,245,255,0.13)', boxShadow: '0 0 24px rgba(0,245,255,0.2)' }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ fontSize: 9, lineHeight: 1 }}
          >◈</motion.span>
          {submittedKiez ? `Dispatch from ${submittedKiez}` : 'Search dispatch near me'}
        </motion.button>

        {/* ── Pin a location on the map ─────────────────────── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <motion.button
            onClick={handleAddLocation}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: clickToPlace ? 'rgba(224,136,88,0.18)' : 'rgba(224,136,88,0.07)',
              border: `1px solid ${clickToPlace ? 'rgba(255,0,204,0.7)' : 'rgba(224,136,88,0.3)'}`,
              borderRadius: 8, padding: '7px 13px',
              color: '#e08858', fontFamily: 'Inter',
              fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em',
              cursor: 'pointer',
              textShadow: '0 0 10px rgba(224,136,88,0.5)',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            📍 {clickToPlace ? 'Click the map…' : 'Add location on map'}
          </motion.button>

          {userPin && (
            <motion.button
              onClick={() => setUserPin(null)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '7px 10px',
                color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter',
                fontSize: 10.5, cursor: 'pointer',
              }}
              whileHover={{ backgroundColor: 'rgba(255,80,80,0.12)', color: '#ff7070' }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
            >
              ✕ Remove
            </motion.button>
          )}
        </div>

        {/* Confirmed kiez pill */}
        <AnimatePresence>
          {locationSet && (
            <motion.div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(212,104,42,0.08)',
                border: '1px solid rgba(0,245,255,0.3)',
                borderRadius: 20, padding: '5px 12px',
                fontFamily: 'Inter', fontSize: 10.5,
                color: 'rgba(212,104,42,0.9)',
                letterSpacing: '0.05em', alignSelf: 'flex-start',
                boxShadow: '0 0 14px rgba(0,245,255,0.12)',
              }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 6px rgba(0,245,255,0.7)' }} />
              {submittedKiez} · dispatch incoming
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Click-to-place overlay ───────────────────────────── */}
      <AnimatePresence>
        {clickToPlace && (
          <motion.div
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 30, pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{ fontSize: 36, filter: 'drop-shadow(0 0 16px #e08858)' }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              📍
            </motion.div>
            <div style={{
              background: 'rgba(4,6,15,0.96)', border: '1px solid rgba(0,245,255,0.45)',
              borderRadius: 12, padding: '12px 20px', textAlign: 'center',
              boxShadow: '0 0 32px rgba(224,136,88,0.15)',
            }}>
              <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#e08858', marginBottom: 4 }}>
                CLICK ANYWHERE IN BERLIN TO PIN
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.05em' }}>
                Drag the pin after to fine-tune · Esc to cancel
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom hint ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!is3D && !showMarkers && (
          <motion.div key="zoom-hint"
            style={{ ...hint, border: '1px solid rgba(0,245,255,0.3)', color: 'rgba(0,245,255,0.65)' }}
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
            style={{ ...hint, border: '1px solid rgba(255,0,204,0.4)', color: 'rgba(255,0,204,0.7)' }}
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
          background: 'rgba(4,6,15,0.94)',
          border: '1px solid rgba(0,245,255,0.14)',
          borderRadius: 14, padding: '14px 16px',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,245,255,0.06)',
          minWidth: 190, zIndex: 10,
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div style={{
          fontFamily: 'Inter', fontSize: 8.5, letterSpacing: '0.24em',
          color: 'rgba(0,245,255,0.45)', textTransform: 'uppercase', marginBottom: 10,
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
          borderTop: '1px solid rgba(0,245,255,0.1)',
          fontFamily: 'Inter', fontSize: 9,
          color: 'rgba(0,245,255,0.3)', letterSpacing: '0.04em',
        }}>
          Click marker → read dispatch → act
        </div>
      </motion.div>

      {/* ── Bottom-left status ────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute', bottom: 32, left: 28,
          fontFamily: 'Inter', fontSize: 9.5, letterSpacing: '0.1em',
          color: 'rgba(224,240,255,0.25)', zIndex: 10,
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
        fontFamily: 'Inter', fontSize: 8, color: 'rgba(224,240,255,0.15)',
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
  background: 'rgba(4,6,15,0.9)',
  borderRadius: 24, padding: '9px 22px',
  fontFamily: 'Inter', fontSize: 10.5,
  letterSpacing: '0.13em', textTransform: 'uppercase',
  backdropFilter: 'blur(12px)', whiteSpace: 'nowrap',
  pointerEvents: 'none', zIndex: 10,
}
