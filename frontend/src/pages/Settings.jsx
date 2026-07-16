import { useState } from 'react'
import AppShell from '../layouts/AppShell.jsx'
import { LuMoon, LuBell, LuUserRound } from 'react-icons/lu'

export default function Settings() {
  const [notifications, setNotifications] = useState({ high: true, medium: true, resolved: false })

  return (
    <AppShell title="Settings" subtitle="Preferences for your SOC analyst console">
      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-5">
            <LuUserRound className="w-5 h-5 text-neon-blue" />
            <h3 className="font-display font-semibold">Profile</h3>
          </div>
          <div className="space-y-4">
            <Field label="Name" value="SOC Analyst" />
            <Field label="Email" value="analyst@bankofmaharashtra.demo" />
            <Field label="Role" value="Level 2 Fraud & Cyber Analyst" />
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-5">
            <LuMoon className="w-5 h-5 text-neon-purple" />
            <h3 className="font-display font-semibold">Appearance</h3>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-sm text-ink-300">Theme</span>
            <span className="badge-low">Dark (Neon)</span>
          </div>
          <p className="text-xs text-ink-700 mt-3">Light mode is disabled for SOC environments to reduce eye strain during monitoring shifts.</p>
        </div>

        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <LuBell className="w-5 h-5 text-signal-high" />
            <h3 className="font-display font-semibold">Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: 'high', label: 'High & Critical severity alerts' },
              { key: 'medium', label: 'Medium severity alerts' },
              { key: 'resolved', label: 'Resolution confirmations' },
            ].map((n) => (
              <label key={n.key} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                <span className="text-sm text-ink-300">{n.label}</span>
                <input
                  type="checkbox"
                  checked={notifications[n.key]}
                  onChange={() => setNotifications((s) => ({ ...s, [n.key]: !s[n.key] }))}
                  className="w-4 h-4 accent-neon-blue"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-ink-500 mb-1">{label}</div>
      <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-ink-300">{value}</div>
    </div>
  )
}
