import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import * as d3force from 'd3-force'
import AppShell from '../layouts/AppShell.jsx'
import RiskBadge from '../components/RiskBadge.jsx'
import { getHighRiskTransactions, explainTransaction } from '../services/api.js'
import { LuNetwork, LuGitBranch } from 'react-icons/lu'

const SIGNAL_COLOR = (text) => {
  const t = text.toLowerCase()
  if (t.includes('vpn')) return '#FFC93D'
  if (t.includes('device')) return '#FF8A3D'
  if (t.includes('failed login') || t.includes('mfa')) return '#FF3B5C'
  if (t.includes('geo') || t.includes('travel') || t.includes('international')) return '#8B5CF6'
  if (t.includes('amount') || t.includes('value')) return '#00D9FF'
  if (t.includes('off-hour')) return '#00E5A0'
  return '#8A93A6'
}

export default function CorrelationGraph() {
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getHighRiskTransactions(12).then((txns) => {
      setCandidates(txns)
      if (txns.length) selectTxn(txns[0])
    })
  }, [])

  const selectTxn = async (t) => {
    setSelected(t)
    setLoading(true)
    try {
      const res = await explainTransaction(t.id)
      setDetail(res)
    } finally {
      setLoading(false)
    }
  }

  const layout = useMemo(() => {
    if (!detail || !selected) return null

    const width = 700
    const height = 460
    const centerNode = { id: 'txn', label: `₹${selected.amount.toLocaleString('en-IN')}`, sub: selected.txn_type, type: 'center', fx: width / 2, fy: height / 2 }
    const userNode = { id: 'user', label: selected.user, sub: 'Account Holder', type: 'user' }
    const signalNodes = detail.signals.map((s, i) => ({
      id: `signal-${i}`, label: s.length > 42 ? s.slice(0, 42) + '…' : s, sub: 'Signal', type: 'signal', color: SIGNAL_COLOR(s),
    }))

    const nodes = [centerNode, userNode, ...signalNodes]
    const links = [
      { source: 'user', target: 'txn' },
      ...signalNodes.map((n) => ({ source: n.id, target: 'txn' })),
    ]

    const simulation = d3force.forceSimulation(nodes)
      .force('link', d3force.forceLink(links).id((d) => d.id).distance(140).strength(0.9))
      .force('charge', d3force.forceManyBody().strength(-320))
      .force('center', d3force.forceCenter(width / 2, height / 2))
      .force('collide', d3force.forceCollide(60))
      .stop()

    for (let i = 0; i < 300; i++) simulation.tick()

    return { nodes, links, width, height }
  }, [detail, selected])

  return (
    <AppShell title="Correlation Graph" subtitle="Live force-directed view of how signals combine into a risk verdict">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <LuGitBranch className="w-4 h-4 text-neon-cyan" />
            <h3 className="font-display font-semibold text-sm">High-Risk Transactions</h3>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {candidates.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTxn(t)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  selected?.id === t.id ? 'bg-neon-blue/10 border-neon-blue/40' : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{t.user}</span>
                  <RiskBadge level={t.threat_level} />
                </div>
                <div className="text-xs text-ink-500 font-mono">₹{t.amount.toLocaleString('en-IN')} · {t.country}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 lg:col-span-2 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <LuNetwork className="w-4 h-4 text-neon-blue" />
              <h3 className="font-display font-semibold text-sm">Correlation Thread</h3>
            </div>
            {detail && (
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-ink-500">Rule <span className="text-ink-300">{selected.risk_score}</span></span>
                <span className="text-ink-500">ML <span className="text-neon-cyan">{detail.ml_anomaly_score}</span></span>
              </div>
            )}
          </div>

          {loading && <div className="h-[460px] flex items-center justify-center text-ink-700 text-sm">Loading correlation graph...</div>}

          {!loading && layout && (
            <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="w-full h-[460px]">
              {layout.links.map((l, i) => {
                const s = layout.nodes.find((n) => n.id === (l.source.id || l.source))
                const t = layout.nodes.find((n) => n.id === (l.target.id || l.target))
                if (!s || !t) return null
                return (
                  <motion.line
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke="rgba(47,107,255,0.35)" strokeWidth={1.5}
                  />
                )
              })}
              {layout.nodes.map((n, i) => (
                <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                  <motion.circle
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: n.type === 'center' ? 34 : n.type === 'user' ? 26 : 20, opacity: 1 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
                    fill={n.type === 'center' ? '#161C2C' : n.type === 'user' ? '#0F1420' : '#10151F'}
                    stroke={n.type === 'center' ? '#8B5CF6' : n.type === 'user' ? '#2F6BFF' : n.color}
                    strokeWidth={2}
                  />
                  <text textAnchor="middle" dy={n.type === 'center' ? -4 : -2} fontSize={n.type === 'signal' ? 8 : 10} fill="#F4F6FB" fontFamily="Inter" fontWeight={600}>
                    {n.type === 'center' ? n.label : n.label.length > 16 ? n.label.slice(0, 16) + '…' : n.label}
                  </text>
                  <text textAnchor="middle" dy={n.type === 'center' ? 10 : 10} fontSize={7} fill="#8A93A6" fontFamily="JetBrains Mono">
                    {n.sub}
                  </text>
                </g>
              ))}
            </svg>
          )}

          {detail && (
            <div className="mt-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-ink-300 leading-relaxed">
              {detail.explanation}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
