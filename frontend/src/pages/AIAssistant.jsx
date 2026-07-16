import { useState, useRef, useEffect } from 'react'
import AppShell from '../layouts/AppShell.jsx'
import { sendChatMessage } from '../services/api.js'
import { LuSend, LuBotMessageSquare, LuUser } from 'react-icons/lu'

const SUGGESTIONS = [
  'Show today\'s biggest threats',
  'How many frauds today?',
  'Explain quantum threats',
  'Summarize overall risk',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi, I'm the QuantumShield AI Security Assistant. Ask me about threats, transactions, or specific users." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input
    if (!msg.trim()) return
    setMessages((m) => [...m, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)
    try {
      const res = await sendChatMessage(msg)
      setMessages((m) => [...m, { role: 'assistant', text: res.reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'I ran into an issue reaching the AI service. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="AI Assistant" subtitle="Natural-language investigation across all telemetry">
      <div className="glass-panel flex flex-col h-[75vh]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shrink-0">
                  <LuBotMessageSquare className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/10 border border-neon-blue/20' : 'bg-white/[0.03] border border-white/[0.06]'
              }`}>
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                  <LuUser className="w-4 h-4 text-ink-500" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shrink-0">
                <LuBotMessageSquare className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-ink-300 hover:border-neon-blue/40">
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about a threat, user, or trend..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] outline-none text-sm focus:border-neon-blue/50"
            />
            <button onClick={() => send()} className="btn-primary !py-3 !px-4">
              <LuSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
