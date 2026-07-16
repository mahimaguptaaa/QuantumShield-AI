import { useEffect, useState } from 'react'
import AppShell from '../layouts/AppShell.jsx'
import { getAnalytics } from '../services/api.js'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

const PALETTE = ['#2F6BFF', '#8B5CF6', '#00D9FF', '#FF8A3D', '#00E5A0', '#FFC93D', '#FF3B5C']

export default function Analytics() {
  const [a, setA] = useState(null)
  useEffect(() => { getAnalytics().then(setA) }, [])
  if (!a) return <AppShell title="Analytics"><div className="text-ink-500">Loading...</div></AppShell>

  return (
    <AppShell title="Analytics" subtitle="Cross-sectional view of fraud, devices, and behaviour">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartPanel title="Fraud by Country">
          <BarChart data={a.fraud_by_country}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#8A93A6" fontSize={11} />
            <YAxis stroke="#8A93A6" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#FF3B5C" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartPanel>

        <ChartPanel title="Hourly Threat Volume">
          <LineChart data={a.hourly_threats}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" stroke="#8A93A6" fontSize={11} />
            <YAxis stroke="#8A93A6" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke="#00D9FF" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartPanel>

        <ChartPanel title="Device Usage">
          <PieChart>
            <Pie data={a.device_usage} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {a.device_usage.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ChartPanel>

        <ChartPanel title="Transaction Types">
          <BarChart data={a.transaction_types} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#8A93A6" fontSize={11} />
            <YAxis type="category" dataKey="name" stroke="#8A93A6" fontSize={11} width={110} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartPanel>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartPanel title="Browser Usage">
          <PieChart>
            <Pie data={a.browser_usage} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {a.browser_usage.map((_, i) => <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ChartPanel>

        <ChartPanel title="Threat Categories">
          <BarChart data={a.threat_categories}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#8A93A6" fontSize={10} />
            <YAxis stroke="#8A93A6" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#00E5A0" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartPanel>
      </div>

      <div className="glass-card p-5 mt-6 flex items-center justify-between">
        <span className="text-sm text-ink-300">False Positive Rate (auto-cleared transactions)</span>
        <span className="font-display text-xl font-bold text-signal-low">{a.false_positive_rate}%</span>
      </div>
    </AppShell>
  )
}

const tooltipStyle = { background: '#10151F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }

function ChartPanel({ title, children }) {
  return (
    <div className="glass-panel p-6">
      <h3 className="font-display font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}
