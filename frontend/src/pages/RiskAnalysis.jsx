import { useEffect, useState } from 'react'
import AppShell from '../layouts/AppShell.jsx'
import { getAnalytics, getDashboard, getModelPerformance } from '../services/api.js'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { LuBrainCircuit } from 'react-icons/lu'

const COLORS = ['#FF3B5C', '#FF8A3D', '#FFC93D', '#00E5A0']

export default function RiskAnalysis() {
  const [analytics, setAnalytics] = useState(null)
  const [stats, setStats] = useState(null)
  const [model, setModel] = useState(null)

  useEffect(() => {
    getAnalytics().then(setAnalytics)
    getDashboard().then(setStats)
    getModelPerformance().then(setModel)
  }, [])

  if (!analytics || !stats) return <AppShell title="Risk Analysis"><div className="text-ink-500">Loading...</div></AppShell>

  return (
    <AppShell title="Risk Analysis" subtitle="Distribution of risk across the correlation engine">
      {model && !model.error && (
        <div className="glass-panel p-6 mb-6 border-neon-purple/30">
          <div className="flex items-center gap-2 mb-4">
            <LuBrainCircuit className="w-5 h-5 text-neon-purple" />
            <h3 className="font-display font-semibold">ML Model Performance</h3>
            <span className="text-xs text-ink-700 font-mono ml-auto">{model.model}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricBox label="Precision" value={`${(model.precision * 100).toFixed(0)}%`} />
            <MetricBox label="Recall" value={`${(model.recall * 100).toFixed(0)}%`} />
            <MetricBox label="F1 Score" value={model.f1_score.toFixed(2)} />
            <MetricBox label="True Positives" value={model.true_positives} accent="low" />
            <MetricBox label="Attack Scenarios" value={model.attack_scenarios} accent="purple" />
          </div>
          <p className="text-xs text-ink-500 mt-4 leading-relaxed">
            Evaluated against {model.attack_scenarios} deliberately injected account-takeover scenarios in the seeded dataset —
            the hybrid engine caught {model.true_positives} of {model.attack_scenarios} ({(model.recall * 100).toFixed(0)}% recall),
            prioritizing catching real fraud over minimizing false alarms.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel p-6 lg:col-span-1 flex flex-col items-center">
          <h3 className="font-display font-semibold mb-4 self-start">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={analytics.risk_distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {analytics.risk_distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#10151F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {analytics.risk_distribution.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-ink-500">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Threat Categories</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.threat_categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#8A93A6" fontSize={11} />
              <YAxis stroke="#8A93A6" fontSize={11} />
              <Tooltip contentStyle={{ background: '#10151F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Bar dataKey="value" fill="#2F6BFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <GaugeCard label="Average Risk Score" value={stats.avg_risk_score} max={100} color="#FF8A3D" />
        <GaugeCard label="AI Confidence" value={stats.ai_confidence} max={100} color="#00D9FF" />
        <GaugeCard label="False Positive Rate" value={analytics.false_positive_rate} max={100} color="#00E5A0" />
        <GaugeCard label="High Risk Users" value={stats.high_risk_users} max={stats.total_transactions} color="#8B5CF6" isCount />
      </div>
    </AppShell>
  )
}

function MetricBox({ label, value, accent = 'blue' }) {
  const colors = { blue: 'text-neon-blue', purple: 'text-neon-purple', low: 'text-signal-low' }
  return (
    <div className="glass-card p-4 text-center">
      <div className="text-[10px] text-ink-500 mb-1.5 uppercase tracking-wider">{label}</div>
      <div className={`font-display text-xl font-bold ${colors[accent] || 'text-ink-100'}`}>{value}</div>
    </div>
  )
}

function GaugeCard({ label, value, max, color, isCount }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="glass-card p-5">
      <div className="text-xs text-ink-500 mb-3">{label}</div>
      <div className="font-display text-2xl font-bold mb-3">{value}{!isCount && '%'}</div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
