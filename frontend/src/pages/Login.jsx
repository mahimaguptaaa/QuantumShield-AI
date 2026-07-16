import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LuShieldHalf, LuMail, LuLock, LuArrowRight, LuFingerprint } from 'react-icons/lu'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('analyst@bankofmaharashtra.demo')
  const [password, setPassword] = useState('QuantumShield@2026')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      navigate('/app/dashboard')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-void-900 flex items-center justify-center px-6 relative overflow-hidden">
      <AmbientBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-panel p-8 md:p-10 shadow-glow">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <LuShieldHalf className="w-10 h-10 text-neon-blue" />
              <div className="absolute inset-0 blur-xl bg-neon-blue/50 -z-10" />
            </div>
            <h1 className="font-display text-2xl font-bold">QuantumShield AI</h1>
            <p className="text-sm text-ink-500 mt-1">Secure access to the Cyber Fusion Center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-ink-500 font-medium mb-1.5 block">Email</label>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus-within:border-neon-blue/50 transition-colors">
                <LuMail className="w-4 h-4 text-ink-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full text-ink-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-ink-500 font-medium mb-1.5 block">Password</label>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus-within:border-neon-blue/50 transition-colors">
                <LuLock className="w-4 h-4 text-ink-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full text-ink-100"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <LuArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-ink-500 mb-2">
              <LuFingerprint className="w-3.5 h-3.5" /> Demo credentials pre-filled — just sign in
            </div>
            <div className="text-[11px] font-mono text-ink-700 bg-white/[0.02] rounded-lg p-3 leading-relaxed">
              analyst@bankofmaharashtra.demo<br />QuantumShield@2026
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-ink-700 mt-6">
         
        </p>
      </motion.div>
    </div>
  )
}

function AmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-neon-blue/10 blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-neon-purple/10 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(47,107,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(47,107,255,0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}
