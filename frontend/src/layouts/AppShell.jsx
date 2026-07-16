import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-void-900">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
