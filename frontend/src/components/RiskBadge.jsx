export default function RiskBadge({ level }) {
  const map = {
    Critical: 'badge-critical',
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low',
  }
  return <span className={map[level] || 'badge-low'}>{level}</span>
}

export function StatusBadge({ status }) {
  const map = {
    Blocked: 'badge-critical',
    Flagged: 'badge-high',
    'Under Review': 'badge-medium',
    Cleared: 'badge-low',
  }
  return <span className={map[status] || 'badge-low'}>{status}</span>
}
