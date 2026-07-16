import { useEffect, useState } from 'react'
import AppShell from '../layouts/AppShell.jsx'
import { getQuantumAssets, getQuantumEducation, getQuantumLiveDetections } from '../services/api.js'
import { LuAtom, LuShieldCheck, LuTriangleAlert, LuArrowRight, LuRadar } from 'react-icons/lu'

const RISK_STYLE = {
  Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical',
}

export default function QuantumSecurity() {
  const [assets, setAssets] = useState([])
  const [edu, setEdu] = useState(null)
  const [live, setLive] = useState(null)

  useEffect(() => {
    getQuantumAssets().then(setAssets)
    getQuantumEducation().then(setEdu)
    getQuantumLiveDetections().then(setLive)
  }, [])

  return (
    <AppShell title="Quantum Security" subtitle="Post-quantum cryptographic risk across bank systems">
      {live && (
        <div className="glass-panel p-6 mb-6 border-signal-high/30">
          <div className="flex items-center gap-2 mb-4">
            <LuRadar className="w-5 h-5 text-signal-high" />
            <h3 className="font-display font-semibold">Live Detection: Sessions Vulnerable to Harvest-Now-Decrypt-Later</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="glass-card p-4">
              <div className="text-xs text-ink-500 mb-1">Legacy-Cipher Sessions (48h)</div>
              <div className="font-display text-2xl font-bold text-signal-high">{live.legacy_session_count}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-xs text-ink-500 mb-1">Sessions Scanned</div>
              <div className="font-display text-2xl font-bold">{live.total_sessions_scanned}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-xs text-ink-500 mb-1">% Harvestable Now</div>
              <div className="font-display text-2xl font-bold text-signal-critical">{live.harvestable_now_pct}%</div>
            </div>
          </div>
          <div className="text-xs text-ink-500 mb-2">Detected via live cipher-suite telemetry — not a static inventory.</div>
          <div className="flex flex-wrap gap-2">
            {live.affected_users.map((u) => (
              <span key={u} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-ink-300">{u}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {assets.map((a) => (
          <div key={a.id} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <LuAtom className="w-5 h-5 text-neon-purple" />
              <span className={RISK_STYLE[a.quantum_risk]}>{a.quantum_risk} Risk</span>
            </div>
            <div className="font-display font-semibold mb-2">{a.system_name}</div>
            <div className="text-xs text-ink-500 space-y-1.5 font-mono">
              <div>Current: <span className="text-ink-300">{a.current_encryption}</span></div>
              <div className="flex items-center gap-1.5">
                <LuArrowRight className="w-3 h-3" /> <span className="text-neon-cyan">{a.recommended_algorithm}</span>
              </div>
              <div>Migration: <span className="text-ink-300">{a.migration_status}</span></div>
            </div>
            <p className="text-xs text-ink-500 mt-3 leading-relaxed">{a.notes}</p>
          </div>
        ))}
      </div>

      {edu && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <LuTriangleAlert className="w-5 h-5 text-signal-high" />
              <h3 className="font-display font-semibold">Harvest Now, Decrypt Later</h3>
            </div>
            <p className="text-sm text-ink-300 leading-relaxed">{edu.harvest_now_decrypt_later}</p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <LuShieldCheck className="w-5 h-5 text-signal-low" />
              <h3 className="font-display font-semibold">Post-Quantum Algorithms</h3>
            </div>
            <div className="space-y-3">
              {edu.post_quantum_algorithms.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-ink-500">{p.type}</div>
                  </div>
                  <span className="badge-low">{p.status}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-500 mt-4 leading-relaxed">{edu.recommendation}</p>
          </div>
        </div>
      )}
    </AppShell>
  )
}
