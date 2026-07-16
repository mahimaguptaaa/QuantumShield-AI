import { LuSearch, LuBell, LuChevronDown } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, subtitle }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-void-900/70 backdrop-blur-xl">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] w-72">
          <LuSearch className="w-4 h-4 text-ink-500" />
          <input
            placeholder="Search users, accounts, IPs..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-ink-700 text-ink-100"
          />
        </div>

        <button className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-neon-blue/40 transition-colors">
          <LuBell className="w-4 h-4 text-ink-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-signal-critical" />
        </button>

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/[0.03] transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold">
            SA
          </div>
          <span className="text-sm text-ink-300 hidden sm:block">SOC Analyst</span>
          <LuChevronDown className="w-3.5 h-3.5 text-ink-500" />
        </button>
      </div>
    </header>
  )
}
