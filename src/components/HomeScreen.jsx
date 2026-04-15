import { useState } from 'react'
import KiezBar from './KiezBar'
import BerlinMap from './BerlinMap'

export default function HomeScreen() {
  const [selectedKiez, setSelectedKiez] = useState(null)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#04060f' }}>
      <BerlinMap selectedKiez={selectedKiez} />
      <KiezBar selectedKiez={selectedKiez} onSelectKiez={setSelectedKiez} />
    </div>
  )
}
