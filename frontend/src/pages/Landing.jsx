import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LuShieldHalf, LuRadar, LuNetwork, LuAtom, LuBotMessageSquare, LuArrowRight,
  LuFingerprint, LuGlobe, LuGauge, LuArrowLeftRight, LuLock, LuZap,
} from 'react-icons/lu'

const features = [
  { icon: LuNetwork, title: 'Unified Telemetry Fusion', desc: 'Cyber events and transactional behaviour, correlated in real time inside one engine — not two silos analyzed apart.' },
  { icon: LuGauge, title: 'Explainable Risk Scoring', desc: 'Every risk score comes with a plain-language reason: which signals fired, and why they matter together.' },
  { icon: LuBotMessageSquare, title: 'AI Security Assistant', desc: 'Ask "Why was this flagged?" or "Show today\'s biggest threats" and get grounded, contextual answers.' },
  { icon: LuAtom, title: 'Quantum Risk Readiness', desc: 'Track which systems still rely on RSA/ECC and need migration before harvest-now-decrypt-later attacks mature.' },
  { icon: LuGlobe, title: 'Global Attack Visualization', desc: 'See login geography, impossible travel, and VPN exit nodes plotted live across a world risk map.' },
  { icon: LuZap, title: 'Live Attack Simulation', desc: 'Trigger a simulated account-takeover chain and watch the correlation engine detect it end-to-end.' },
]

const steps = [
  { n: '01', title: 'Ingest', desc: 'Login events, device fingerprints, VPN flags, and transaction records stream into a single data plane.' },
  { n: '02', title: 'Correlate', desc: 'The engine cross-references recent telemetry against each transaction — geography, device, timing, amount.' },
  { n: '03', title: 'Score & Explain', desc: 'A weighted risk score and confidence level are generated, with every contributing signal named.' },
  { n: '04', title: 'Act', desc: 'Analysts get prioritized alerts, an AI assistant for investigation, and one-click escalation.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-void-900 overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-void-900/60 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LuShieldHalf className="w-6 h-6 text-neon-blue" />
            <span className="font-display font-bold text-lg">QuantumShield AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-ink-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </div>
          <button onClick={() => navigate('/login')} className="btn-primary !py-2.5 !px-5 text-sm">
            Launch Console
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
        <AnimatedGrid />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-xs font-mono text-neon-cyan mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            One anomaly is noise.
            <br />
            <span className="bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Five, correlated, is fraud.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-lg text-ink-300 max-w-2xl mx-auto"
          >
            QuantumShield AI fuses cybersecurity telemetry with transactional behaviour into a
            single AI-driven correlation engine — turning failed logins, VPN hops, and a ₹3.5L transfer
            into one explainable risk score, not three disconnected alerts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2">
              Launch the Console <LuArrowRight className="w-4 h-4" />
            </button>
            <a href="#how-it-works" className="btn-ghost">See How It Works</a>
          </motion.div>

          <CorrelationThread />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Capabilities" title="A fusion center, not a dashboard" />
          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-neon-blue" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-28 px-6 border-t border-white/[0.06] bg-void-950/40">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Pipeline" title="From raw event to explained verdict" />
          <div className="grid md:grid-cols-4 gap-6 mt-14 relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent" />
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center font-display font-bold text-neon-cyan mb-5 relative z-10">
                  {s.n}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Architecture" title="Two data planes, one intelligence layer" />
          <div className="mt-14 glass-panel p-10">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <ArchNode icon={LuNetwork} label="Cybersecurity Telemetry" items={['Logins & Failed Logins', 'Device / Browser / OS', 'VPN & Geo-location', 'MFA & Session Data']} />
              <div className="flex flex-col items-center gap-3 text-center">
                <LuArrowRight className="w-6 h-6 text-neon-blue rotate-90 md:rotate-0" />
                <div className="glass-card px-6 py-5 shadow-glow-purple border-neon-purple/30">
                  <LuFingerprint className="w-7 h-7 text-neon-purple mx-auto mb-2" />
                  <div className="font-display font-semibold">AI Correlation Engine</div>
                  <div className="text-xs text-ink-500 mt-1">Risk Score · Confidence · Category</div>
                </div>
                <LuArrowRight className="w-6 h-6 text-neon-purple rotate-90 md:rotate-0" />
              </div>
              <ArchNode icon={LuArrowLeftRight} label="Transactional Behaviour" items={['UPI / NEFT / RTGS', 'Large Transfers', 'International Payments', 'Merchant & ATM Activity']} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <LuLock className="w-10 h-10 text-neon-blue mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Step into the Security Operations Center
          </h2>
          <p className="text-ink-500 mb-8">
            Live dashboards, 280+ correlated banking records, and an AI assistant — ready to explore.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Enter QuantumShield AI
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-ink-500 text-sm">
            <LuShieldHalf className="w-4 h-4" /> QuantumShield AI — Built for Bank of Maharashtra FINSPARK'26
          </div>
          <div className="text-xs text-ink-700 font-mono">Prototype build · Simulated data for demonstration purposes</div>
        </div>
      </footer>
    </div>
  )
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="max-w-2xl">
      <div className="section-label mb-3">{eyebrow}</div>
      <h2 className="font-display text-3xl md:text-4xl font-bold">{title}</h2>
    </div>
  )
}

function ArchNode({ icon: Icon, label, items }) {
  return (
    <div className="glass-panel p-6">
      <Icon className="w-6 h-6 text-neon-cyan mb-3" />
      <div className="font-display font-semibold mb-3">{label}</div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it} className="text-sm text-ink-500 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-neon-blue" /> {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(47,107,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(47,107,255,0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)',
        }}
      />
    </div>
  )
}

// Signature element: the "Correlation Thread" — visually links a cyber
// event chain to a transaction to a resulting risk verdict, embodying the
// product's core innovation directly in the hero.
function CorrelationThread() {
  const nodes = [
    { label: 'Failed Login', tone: 'text-ink-300' },
    { label: 'VPN Detected', tone: 'text-neon-cyan' },
    { label: 'New Device', tone: 'text-neon-cyan' },
    { label: 'Foreign IP', tone: 'text-signal-medium' },
    { label: '₹3,50,000 Transfer', tone: 'text-signal-high' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="mt-20 glass-panel p-6 md:p-8 max-w-3xl mx-auto"
    >
      <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs md:text-sm">
        {nodes.map((n, i) => (
          <span key={n.label} className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] ${n.tone}`}>
              {n.label}
            </span>
            {i < nodes.length - 1 && <span className="text-neon-blue/50">→</span>}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-6">
        <span className="text-ink-500 text-sm">AI Correlation Verdict</span>
        <LuArrowRight className="w-3.5 h-3.5 text-ink-700" />
        <span className="badge-critical">Risk Score 97% · Account Takeover</span>
      </div>
    </motion.div>
  )
}
