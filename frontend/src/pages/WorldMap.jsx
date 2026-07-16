import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../layouts/AppShell.jsx'
import { getWorldMapEvents } from '../services/api.js'

// Simple equirectangular projection: lon [-180,180] -> x%, lat [-90,90] -> y%
function project(lat, lon) {
  const x = ((lon + 180) / 360) * 100
  const y = ((90 - lat) / 180) * 100
  return { x, y }
}

const RISK_COLOR = {
  failed_login: '#FF3B5C',
  vpn_login: '#FFC93D',
  new_device_login: '#FF8A3D',
  mfa_failure: '#FF3B5C',
  login: '#00E5A0',
  password_reset: '#A855F7',
  admin_action: '#00D9FF',
}

export default function WorldMap() {
  const [events, setEvents] = useState([])
  const [hovered, setHovered] = useState(null)

  useEffect(() => { getWorldMapEvents().then(setEvents) }, [])

  const countryCounts = events.reduce((acc, e) => {
    acc[e.country] = (acc[e.country] || 0) + 1
    return acc
  }, {})
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <AppShell title="World Map" subtitle="Live geography of login events and VPN activity">
      <div className="glass-panel p-6 mb-6 relative overflow-hidden" style={{ aspectRatio: '2/1' }}>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'linear-gradient(rgba(47,107,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(47,107,255,0.12) 1px, transparent 1px)',
            backgroundSize: '5% 10%',
          }}
        />
        <div className="absolute top-4 left-6 section-label z-10">Global Attack Origin Map</div>

        {events.map((e, i) => {
          const { x, y } = project(e.lat, e.lon)
          const color = RISK_COLOR[e.event_type] || '#8A93A6'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.005 }}
              onMouseEnter={() => setHovered(e)}
              onMouseLeave={() => setHovered(null)}
              className="absolute w-2.5 h-2.5 rounded-full cursor-pointer"
              style={{
                left: `${x}%`, top: `${y}%`, background: color,
                boxShadow: `0 0 8px 2px ${color}80`,
                transform: 'translate(-50%,-50%)',
              }}
            />
          )
        })}

        {hovered && (
          <div
            className="absolute z-20 glass-panel px-3 py-2 text-xs pointer-events-none"
            style={{ left: `${project(hovered.lat, hovered.lon).x}%`, top: `${project(hovered.lat, hovered.lon).y}%`, transform: 'translate(10px, -110%)' }}
          >
            <div className="font-medium text-ink-100">{hovered.user}</div>
            <div className="text-ink-500">{hovered.event_type} · {hovered.city}, {hovered.country}</div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {topCountries.map(([country, count]) => (
          <div key={country} className="glass-card p-4 flex items-center justify-between">
            <span className="text-sm font-medium">{country}</span>
            <span className="font-mono text-neon-cyan font-semibold">{count}</span>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
