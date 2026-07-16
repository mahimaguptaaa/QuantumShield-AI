import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ThreatMonitor from './pages/ThreatMonitor.jsx'
import Transactions from './pages/Transactions.jsx'
import CyberEvents from './pages/CyberEvents.jsx'
import RiskAnalysis from './pages/RiskAnalysis.jsx'
import ThreatTimeline from './pages/ThreatTimeline.jsx'
import CorrelationGraph from './pages/CorrelationGraph.jsx'
import WorldMap from './pages/WorldMap.jsx'
import Analytics from './pages/Analytics.jsx'
import QuantumSecurity from './pages/QuantumSecurity.jsx'
import AIAssistant from './pages/AIAssistant.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app/dashboard" element={<Dashboard />} />
      <Route path="/app/threat-monitor" element={<ThreatMonitor />} />
      <Route path="/app/transactions" element={<Transactions />} />
      <Route path="/app/cyber-events" element={<CyberEvents />} />
      <Route path="/app/risk-analysis" element={<RiskAnalysis />} />
      <Route path="/app/threat-timeline" element={<ThreatTimeline />} />
      <Route path="/app/correlation-graph" element={<CorrelationGraph />} />
      <Route path="/app/world-map" element={<WorldMap />} />
      <Route path="/app/analytics" element={<Analytics />} />
      <Route path="/app/quantum-security" element={<QuantumSecurity />} />
      <Route path="/app/ai-assistant" element={<AIAssistant />} />
      <Route path="/app/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
