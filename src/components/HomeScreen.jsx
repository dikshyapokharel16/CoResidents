import { useState } from 'react'
import KiezBar from './KiezBar'
import BerlinMap from './BerlinMap'

export default function HomeScreen() {
  const [selectedKiez, setSelectedKiez] = useState(null)

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#04060f' }}>
      <KiezBar selectedKiez={selectedKiez} onSelectKiez={setSelectedKiez} />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <BerlinMap selectedKiez={selectedKiez} />
      </div>
    </div>
  )
}
