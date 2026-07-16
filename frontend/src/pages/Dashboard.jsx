import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../layouts/AppShell.jsx'
import StatCard from '../components/StatCard.jsx'
import RiskBadge, { StatusBadge } from '../components/RiskBadge.jsx'
import { CardSkeleton } from '../components/Skeleton.jsx'
import { getDashboard, getHighRiskTransactions, getAlerts, simulateAttack } from '../services/api.js'
import {
  LuArrowLeftRight, LuRadar, LuUsers, LuShieldAlert, LuAtom, LuGauge, LuBrainCircuit, LuZap, LuBell,
} from 'react-icons/lu'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [highRisk, setHighRisk] = useState([])
  const [alerts, setAlerts] = useState([])
  const [simLoading, setSimLoading] = useState(false)
  const [simResult, setSimResult] = useState(null)

  const loadAll = async () => {
    const [d, hr, al] = await Promise.all([
      getDashboard(),
      getHighRiskTransactions(8),
      getAlerts('New'),
    ])
    setStats(d)
    setHighRisk(hr)
    setAlerts(al.slice(0, 6))
  }

  useEffect(() => { loadAll() }, [])

  const handleSimulate = async () => {
    setSimLoading(true)
    setSimResult(null)
    try {
      const res = await simulateAttack()
      setSimResult(res)
      await loadAll()
    } finally {
      setSimLoading(false)
    }
  }

  return (
    <AppShell title="SOC Dashboard" subtitle="Real-time cyber & transactional risk overview">
      <div className="flex justify-end mb-6">
        <button onClick={handleSimulate} disabled={simLoading} className="btn-primary flex items-center gap-2 text-sm !py-2.5">
          <LuZap className="w-4 h-4" />
          {simLoading ? 'Simulating attack chain...' : 'Generate Live Attack'}
        </button>
      </div>

      {simResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 mb-6 border-signal-critical/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <LuShieldAlert className="w-4 h-4 text-signal-critical" />
            <span className="font-display font-semibold">Live Simulation Result</span>
            <RiskBadge level={simResult.transaction.threat_level} />
          </div>
          <p className="text-sm text-ink-300">{simResult.transaction.explanation}</p>
        </motion.div>
      )}

      {!stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={LuArrowLeftRight} label="Total Transactions" value={stats.total_transactions} accent="blue" delay={0} />
          <StatCard icon={LuRadar} label="Threats Detected" value={stats.threats_detected} accent="high" delay={0.05} />
          <StatCard icon={LuUsers} label="High Risk Users" value={stats.high_risk_users} accent="critical" delay={0.1} />
          <StatCard icon={LuShieldAlert} label="Fraud Cases" value={stats.fraud_cases} accent="critical" delay={0.15} />
          <StatCard icon={LuAtom} label="Quantum Alerts" value={stats.quantum_alerts} accent="purple" delay={0.2} />
          <StatCard icon={LuGauge} label="Avg Risk Score" value={stats.avg_risk_score} suffix="/100" accent="medium" delay={0.25} />
          <StatCard icon={LuBrainCircuit} label="AI Confidence" value={stats.ai_confidence} suffix="%" accent="cyan" delay={0.3} />
          <StatCard icon={LuBell} label="Active Alerts" value={stats.active_alerts} accent="high" delay={0.35} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold">Highest Risk Transactions</h3>
            <span className="section-label">Live</span>
          </div>
          <div className="space-y-3">
            {highRisk.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-neon-blue/30 transition-colors">
                <div>
                  <div className="text-sm font-medium text-ink-100">{t.user}</div>
                  <div className="text-xs text-ink-500 font-mono mt-0.5">{t.txn_type} · ₹{t.amount.toLocaleString('en-IN')} · {t.country}</div>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge level={t.threat_level} />
                  <span className="font-mono text-sm font-semibold text-ink-300 w-10 text-right">{t.risk_score}</span>
                </div>
              </div>
            ))}
            {highRisk.length === 0 && <p className="text-sm text-ink-700 text-center py-6">No high-risk transactions yet.</p>}
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold">Alert Center</h3>
            <span className="section-label">New</span>
          </div>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-between mb-1.5">
                  <RiskBadge level={a.severity} />
                  <span className="text-[10px] text-ink-700 font-mono">
                    {new Date(a.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-ink-300 leading-relaxed line-clamp-2">{a.title}</div>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-sm text-ink-700 text-center py-6">No new alerts.</p>}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
