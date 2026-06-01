import { Outlet, NavLink } from 'react-router';
import { LayoutDashboard, Package, BarChart3, ShieldCheck, Snowflake, FileText, Gauge, Code, Settings } from 'lucide-react';

export default function Layout() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/shipments', icon: Package, label: 'Active Shipments' },
    { to: '/analytics', icon: FileText, label: 'Blockchain Ledger Audits' },
    { to: '/metrics', icon: Gauge, label: 'Node & Sensor Metrics' },
    { to: '/contracts', icon: Code, label: 'Smart Contract Rules' },
    { to: '/settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-border flex flex-col">
        {/* Logo with Cold-Seal Branding */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <div className="flex items-center justify-center relative">
                  <ShieldCheck className="w-5 h-5 text-white absolute" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' }} />
                  <Snowflake className="w-3 h-3 text-white/80 absolute bottom-0 right-0" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Cold-Seal</h1>
              <p className="text-xs text-muted-foreground">Cold Chain Monitor</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-900">System Status</span>
            </div>
            <p className="text-xs text-emerald-700">All systems operational</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
