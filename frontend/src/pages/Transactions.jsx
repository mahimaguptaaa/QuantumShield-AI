import { useEffect, useState } from 'react'
import AppShell from '../layouts/AppShell.jsx'
import RiskBadge, { StatusBadge } from '../components/RiskBadge.jsx'
import { getTransactions, explainTransaction } from '../services/api.js'
import { LuSearch, LuChevronLeft, LuChevronRight, LuX } from 'react-icons/lu'

export default function Transactions() {
  const [data, setData] = useState({ items: [], total: 0 })
  const [search, setSearch] = useState('')
  const [threatLevel, setThreatLevel] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [loadingExplain, setLoadingExplain] = useState(false)
  const pageSize = 12

  const load = async () => {
    const res = await getTransactions({
      search: search || undefined,
      threat_level: threatLevel || undefined,
      status: status || undefined,
      page, page_size: pageSize,
      sort_by: 'risk_score', order: 'desc',
    })
    setData(res)
  }

  useEffect(() => { load() }, [search, threatLevel, status, page])

  const openExplain = async (txn) => {
    setSelected(txn)
    setExplanation(null)
    setLoadingExplain(true)
    try {
      const res = await explainTransaction(txn.id)
      setExplanation(res)
    } finally {
      setLoadingExplain(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(data.total / pageSize))

  return (
    <AppShell title="Transactions" subtitle={`${data.total} records · AI-correlated risk scoring`}>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex-1 min-w-[220px]">
          <LuSearch className="w-4 h-4 text-ink-500" />
          <input
            placeholder="Search user, account, IP, country..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="bg-transparent outline-none text-sm w-full text-ink-100 placeholder:text-ink-700"
          />
        </div>
        <select value={threatLevel} onChange={(e) => { setThreatLevel(e.target.value); setPage(1) }} className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-ink-300">
          <option value="">All Levels</option>
          <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-ink-300">
          <option value="">All Statuses</option>
          <option>Blocked</option><option>Flagged</option><option>Under Review</option><option>Cleared</option>
        </select>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-ink-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 font-medium">User</th>
                <th className="px-5 py-3.5 font-medium">Account</th>
                <th className="px-5 py-3.5 font-medium">Amount</th>
                <th className="px-5 py-3.5 font-medium">Country</th>
                <th className="px-5 py-3.5 font-medium">Device</th>
                <th className="px-5 py-3.5 font-medium">IP</th>
                <th className="px-5 py-3.5 font-medium">Risk</th>
                <th className="px-5 py-3.5 font-medium">Level</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => openExplain(t)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-ink-100">{t.user}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-ink-500">{t.account}</td>
                  <td className="px-5 py-3.5 font-mono text-ink-300">₹{t.amount.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-ink-500">{t.country}</td>
                  <td className="px-5 py-3.5 text-ink-500 text-xs">{t.device}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-ink-700">{t.ip_address}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-ink-300">{t.risk_score}</td>
                  <td className="px-5 py-3.5"><RiskBadge level={t.threat_level} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-3.5 text-xs text-ink-700 font-mono">{new Date(t.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
          <span className="text-xs text-ink-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] disabled:opacity-30">
              <LuChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] disabled:opacity-30">
              <LuChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setSelected(null)}>
          <div className="glass-panel p-6 max-w-lg w-full shadow-glow" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Why was this flagged?</h3>
              <button onClick={() => setSelected(null)}><LuX className="w-4 h-4 text-ink-500" /></button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <RiskBadge level={selected.threat_level} />
              <span className="font-mono text-sm text-ink-300">Risk {selected.risk_score}/100</span>
              {explanation?.ml_anomaly_score !== undefined && (
                <span className="font-mono text-xs text-neon-cyan">ML {explanation.ml_anomaly_score}</span>
              )}
              <span className="text-xs text-ink-500">{selected.threat_category}</span>
            </div>
            {loadingExplain ? (
              <div className="space-y-2">
                <div className="h-3 bg-white/[0.06] rounded animate-pulse w-full" />
                <div className="h-3 bg-white/[0.06] rounded animate-pulse w-5/6" />
                <div className="h-3 bg-white/[0.06] rounded animate-pulse w-2/3" />
              </div>
            ) : (
              <>
                <p className="text-sm text-ink-300 leading-relaxed mb-4">{explanation?.explanation}</p>
                {explanation?.signals?.length > 0 && (
                  <div className="space-y-1.5">
                    {explanation.signals.map((s, i) => (
                      <div key={i} className="text-xs text-ink-500 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-neon-blue mt-1.5 shrink-0" /> {s}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
