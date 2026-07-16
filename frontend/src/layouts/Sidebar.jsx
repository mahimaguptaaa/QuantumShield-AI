import { NavLink } from 'react-router-dom'
import {
  LuLayoutDashboard, LuRadar, LuArrowLeftRight, LuNetwork, LuGauge,
  LuHistory, LuGlobe, LuChartBar, LuAtom, LuBotMessageSquare, LuSettings, LuShieldHalf, LuGitBranch,
} from 'react-icons/lu'

const links = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { to: '/app/threat-monitor', label: 'Threat Monitor', icon: LuRadar },
  { to: '/app/transactions', label: 'Transactions', icon: LuArrowLeftRight },
  { to: '/app/cyber-events', label: 'Cyber Events', icon: LuNetwork },
  { to: '/app/risk-analysis', label: 'Risk Analysis', icon: LuGauge },
  { to: '/app/correlation-graph', label: 'Correlation Graph', icon: LuGitBranch },
  { to: '/app/threat-timeline', label: 'Threat Timeline', icon: LuHistory },
  { to: '/app/world-map', label: 'World Map', icon: LuGlobe },
  { to: '/app/analytics', label: 'Analytics', icon: LuChartBar },
  { to: '/app/quantum-security', label: 'Quantum Security', icon: LuAtom },
  { to: '/app/ai-assistant', label: 'AI Assistant', icon: LuBotMessageSquare },
  { to: '/app/settings', label: 'Settings', icon: LuSettings },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col border-r border-white/[0.06] bg-void-950/80 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="relative">
          <LuShieldHalf className="w-7 h-7 text-neon-blue" />
          <div className="absolute inset-0 blur-md bg-neon-blue/40 -z-10" />
        </div>
        <div>
          <div className="font-display font-bold text-base leading-none">QuantumShield</div>
          <div className="text-[10px] font-mono tracking-widest text-neon-cyan/70 mt-0.5">AI FUSION CENTER</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/10 text-white border border-neon-blue/30 shadow-glow'
                  : 'text-ink-500 hover:text-ink-100 hover:bg-white/[0.03]'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border border-white/[0.06]">
        <div className="text-[10px] font-mono text-neon-cyan/70 uppercase tracking-widest mb-1">System Status</div>
        <div className="flex items-center gap-2 text-xs text-ink-300">
          <span className="w-2 h-2 rounded-full bg-signal-low animate-pulse-slow" />
          All engines operational
        </div>
      </div>
    </aside>
  )
}
