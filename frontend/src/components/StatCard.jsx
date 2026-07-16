import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, suffix, accent = 'blue', delay = 0 }) {
  const accents = {
    blue: 'from-neon-blue/20 to-transparent text-neon-blue',
    purple: 'from-neon-purple/20 to-transparent text-neon-purple',
    critical: 'from-signal-critical/20 to-transparent text-signal-critical',
    high: 'from-signal-high/20 to-transparent text-signal-high',
    medium: 'from-signal-medium/20 to-transparent text-signal-medium',
    low: 'from-signal-low/20 to-transparent text-signal-low',
    cyan: 'from-neon-cyan/20 to-transparent text-neon-cyan',
  }
  const accentClasses = accents[accent] || accents.blue
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br blur-2xl ${accentClasses}`} />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-xs text-ink-500 font-medium mb-2">{label}</div>
          <div className="font-display text-2xl font-bold text-ink-100">
            {value}
            {suffix && <span className="text-sm text-ink-500 ml-1">{suffix}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-white/[0.04] ${accentClasses.split(' ').pop()}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
