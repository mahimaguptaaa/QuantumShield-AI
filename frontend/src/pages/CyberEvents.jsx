import { useEffect, useState } from 'react'
import AppShell from '../layouts/AppShell.jsx'
import { getEvents } from '../services/api.js'
import { LuSearch } from 'react-icons/lu'

const EVENT_COLORS = {
  login: 'text-signal-low',
  failed_login: 'text-signal-critical',
  vpn_login: 'text-signal-medium',
  new_device_login: 'text-signal-high',
  password_reset: 'text-neon-purple',
  mfa_failure: 'text-signal-critical',
  admin_action: 'text-neon-cyan',
}

export default function CyberEvents() {
  const [data, setData] = useState({ items: [], total: 0 })
  const [user, setUser] = useState('')
  const [eventType, setEventType] = useState('')

  useEffect(() => {
    getEvents({ user: user || undefined, event_type: eventType || undefined, page_size: 60 }).then(setData)
  }, [user, eventType])

  return (
    <AppShell title="Cyber Events" subtitle={`${data.total} telemetry records`}>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex-1 min-w-[220px]">
          <LuSearch className="w-4 h-4 text-ink-500" />
          <input placeholder="Filter by user..." value={user} onChange={(e) => setUser(e.target.value)} className="bg-transparent outline-none text-sm w-full text-ink-100 placeholder:text-ink-700" />
        </div>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-ink-300">
          <option value="">All Event Types</option>
          <option value="login">Login</option>
          <option value="failed_login">Failed Login</option>
          <option value="vpn_login">VPN Login</option>
          <option value="new_device_login">New Device Login</option>
          <option value="password_reset">Password Reset</option>
          <option value="mfa_failure">MFA Failure</option>
          <option value="admin_action">Admin Action</option>
        </select>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-void-800/95 backdrop-blur">
              <tr className="border-b border-white/[0.06] text-left text-ink-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 font-medium">User</th>
                <th className="px-5 py-3.5 font-medium">Event</th>
                <th className="px-5 py-3.5 font-medium">Device</th>
                <th className="px-5 py-3.5 font-medium">Browser / OS</th>
                <th className="px-5 py-3.5 font-medium">Location</th>
                <th className="px-5 py-3.5 font-medium">IP</th>
                <th className="px-5 py-3.5 font-medium">VPN</th>
                <th className="px-5 py-3.5 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((e) => (
                <tr key={e.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium">{e.user}</td>
                  <td className={`px-5 py-3 font-mono text-xs ${EVENT_COLORS[e.event_type] || 'text-ink-300'}`}>{e.event_type}</td>
                  <td className="px-5 py-3 text-xs text-ink-500">{e.device}</td>
                  <td className="px-5 py-3 text-xs text-ink-500">{e.browser} · {e.os}</td>
                  <td className="px-5 py-3 text-ink-500">{e.city}, {e.country}</td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-700">{e.ip_address}</td>
                  <td className="px-5 py-3">{e.is_vpn ? <span className="badge-medium">VPN</span> : <span className="text-ink-700 text-xs">—</span>}</td>
                  <td className="px-5 py-3 text-xs text-ink-700 font-mono">{new Date(e.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
