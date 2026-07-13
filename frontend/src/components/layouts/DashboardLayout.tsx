import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { NotificationBell } from '@/components/ui/NotificationBell';
import {
  LayoutDashboard, FileText, Plane, Settings, User,
  LogOut, Building2, Users, ClipboardList, Shield
} from 'lucide-react';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const getAgencySidebar = (): SidebarItem[] => [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/agency' },
  { icon: FileText, label: 'Group Visa', href: '/agency/group-visa' },
  { icon: Shield, label: 'Individual Visa', href: '/agency/individual-visa' },
  { icon: Plane, label: 'Air Ticket Booking', href: '/agency/air-ticket' },
  { icon: ClipboardList, label: 'My Requests', href: '/agency/requests' },
  { icon: User, label: 'Profile', href: '/agency/profile' },
];

const getCustomerSidebar = (): SidebarItem[] => [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/customer' },
  { icon: Plane, label: 'Book Air Ticket', href: '/customer/book-ticket' },
  { icon: ClipboardList, label: 'My Requests', href: '/customer/requests' },
  { icon: User, label: 'Profile', href: '/customer/profile' },
];

const getAdminSidebar = (): SidebarItem[] => [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Building2, label: 'Agencies', href: '/admin/agencies' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: FileText, label: 'Visa Requests', href: '/admin/visas' },
  { icon: Plane, label: 'Ticket Requests', href: '/admin/tickets' },
  { icon: ClipboardList, label: 'All Requests', href: '/admin/requests' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'AGENCY' | 'ADMIN' | 'CUSTOMER';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const items = role === 'ADMIN'
    ? getAdminSidebar()
    : role === 'CUSTOMER'
    ? getCustomerSidebar()
    : getAgencySidebar();

  const basePath = role === 'ADMIN' ? '/admin' : role === 'CUSTOMER' ? '/customer' : '/agency';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gradient-to-b from-[#FF7A00] to-[#FF4500] text-foreground overflow-hidden font-sans relative">
      {/* Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex inset-y-0 left-0 z-40 w-[280px] flex-col bg-transparent text-white relative shrink-0">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Al-Rabb Tours Logo" className="w-10 h-10 object-contain drop-shadow-sm brightness-0 invert" />
            <div>
              <h1 className="text-xl font-bold font-heading leading-tight tracking-tight text-white">Al-Rabb Tours</h1>
              <p className="text-xs text-white/70 font-medium tracking-wide">ENTERPRISE</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== basePath && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                )}
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 pb-8 space-y-4">
          <div className="flex items-center justify-between px-2 text-white">
            {user && (
              <p className="text-xs font-medium text-white/80 truncate pr-2" title={user.email}>{user.email}</p>
            )}
            <NotificationBell />
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 px-6 text-white shrink-0 z-20">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain brightness-0 invert drop-shadow-sm" />
          <h1 className="text-lg font-bold font-heading tracking-tight">Al-Rabb</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          {user && (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm backdrop-blur-md border border-white/30 shadow-sm">
              {user.email.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area (The Tuck) */}
      <main className="flex-1 overflow-y-auto bg-background rounded-t-[32px] md:rounded-t-none md:rounded-l-[32px] md:my-4 md:mr-4 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] md:shadow-[-8px_0_30px_rgba(0,0,0,0.1)] transition-all duration-300 relative z-10 flex flex-col pb-24 md:pb-0">
        <div className="flex-1 p-6 md:p-10 relative">
          {children}
        </div>
      </main>

      {/* Bottom Navbar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around items-center p-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {items.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.href ||
              (item.href !== basePath && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center p-2 rounded-xl transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center p-2 rounded-xl transition-all text-destructive"
        >
          <LogOut className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Logout</span>
        </button>
      </nav>
    </div>
  );
}
