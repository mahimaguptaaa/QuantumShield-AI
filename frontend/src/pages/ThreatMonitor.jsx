import { useEffect, useState } from 'react'
import AppShell from '../layouts/AppShell.jsx'
import RiskBadge, { StatusBadge } from '../components/RiskBadge.jsx'
import { getHighRiskTransactions, getAlerts, updateAlert } from '../services/api.js'
import { LuCheck, LuX } from 'react-icons/lu'

export default function ThreatMonitor() {
  const [threats, setThreats] = useState([])
  const [alerts, setAlerts] = useState([])

  const load = async () => {
    const [t, a] = await Promise.all([getHighRiskTransactions(30), getAlerts()])
    setThreats(t)
    setAlerts(a)
  }
  useEffect(() => { load() }, [])

  const handleAction = async (id, status) => {
    await updateAlert(id, status)
    load()
  }

  return (
    <AppShell title="Threat Monitor" subtitle="High and critical risk activity across the bank">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="font-display font-semibold mb-5">Top Threats</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {threats.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{t.user}</span>
                  <RiskBadge level={t.threat_level} />
                </div>
                <div className="text-xs text-ink-500 font-mono mb-2">
                  {t.txn_type} · ₹{t.amount.toLocaleString('en-IN')} · {t.country} · Risk {t.risk_score}
                </div>
                <div className="text-xs text-ink-300 leading-relaxed">{t.explanation}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-display font-semibold mb-5">Alert Center</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {alerts.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-between mb-2">
                  <RiskBadge level={a.severity} />
                  <span className="text-[10px] font-mono text-ink-700">{a.status}</span>
                </div>
                <div className="text-sm text-ink-100 font-medium mb-1">{a.title}</div>
                <div className="text-xs text-ink-500 mb-3 line-clamp-2">{a.description}</div>
                {a.status === 'New' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(a.id, 'Resolved')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-signal-low/10 text-signal-low border border-signal-low/30">
                      <LuCheck className="w-3.5 h-3.5" /> Resolve
                    </button>
                    <button onClick={() => handleAction(a.id, 'Dismissed')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/[0.03] text-ink-500 border border-white/[0.08]">
                      <LuX className="w-3.5 h-3.5" /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
