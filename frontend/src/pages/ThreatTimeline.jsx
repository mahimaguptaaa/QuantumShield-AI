import { useEffect, useState } from 'react'
import AppShell from '../layouts/AppShell.jsx'
import { getUserTimeline, getHighRiskTransactions } from '../services/api.js'
import { LuSearch } from 'react-icons/lu'

const EVENT_LABELS = {
  login: 'Login',
  failed_login: 'Failed Login',
  vpn_login: 'VPN Login',
  new_device_login: 'New Device Login',
  password_reset: 'Password Reset',
  mfa_failure: 'MFA Failure',
  admin_action: 'Admin Action',
}

const EVENT_DOT = {
  login: 'bg-signal-low',
  failed_login: 'bg-signal-critical',
  vpn_login: 'bg-signal-medium',
  new_device_login: 'bg-signal-high',
  password_reset: 'bg-neon-purple',
  mfa_failure: 'bg-signal-critical',
  admin_action: 'bg-neon-cyan',
}

export default function ThreatTimeline() {
  const [user, setUser] = useState('')
  const [timeline, setTimeline] = useState([])
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    getHighRiskTransactions(15).then((txns) => setSuggestions([...new Set(txns.map(t => t.user))]))
  }, [])

  const loadTimeline = async (u) => {
    setUser(u)
    if (!u) { setTimeline([]); return }
    const res = await getUserTimeline(u)
    setTimeline(res)
  }

  return (
    <AppShell title="Threat Timeline" subtitle="Chronological reconstruction of a user's cyber activity">
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] max-w-md mb-4">
        <LuSearch className="w-4 h-4 text-ink-500" />
        <input placeholder="Enter user name to trace timeline..." value={user} onChange={(e) => loadTimeline(e.target.value)} className="bg-transparent outline-none text-sm w-full text-ink-100 placeholder:text-ink-700" />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {suggestions.map((u) => (
          <button key={u} onClick={() => loadTimeline(u)} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-ink-300 hover:border-neon-blue/40">
            {u}
          </button>
        ))}
      </div>

      {timeline.length > 0 ? (
        <div className="glass-panel p-8 relative">
          <div className="absolute left-[52px] top-8 bottom-8 w-px bg-gradient-to-b from-neon-blue/60 via-neon-purple/40 to-transparent" />
          <div className="space-y-6">
            {timeline.map((e) => (
              <div key={e.id} className="flex gap-5 relative">
                <div className="w-16 text-right text-xs font-mono text-ink-500 pt-1 shrink-0">
                  {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 z-10 ${EVENT_DOT[e.event_type] || 'bg-ink-500'} shadow-glow`} />
                <div className="glass-card p-4 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{EVENT_LABELS[e.event_type] || e.event_type}</span>
                    {e.is_vpn && <span className="badge-medium">VPN</span>}
                  </div>
                  <div className="text-xs text-ink-500 font-mono">
                    {e.device} · {e.browser} · {e.city}, {e.country} · {e.ip_address}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-ink-700">
          Select a user above to reconstruct their event timeline.
        </div>
      )}
    </AppShell>
  )
}
