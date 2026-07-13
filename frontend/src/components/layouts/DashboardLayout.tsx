import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { NotificationBell } from '@/components/ui/NotificationBell';
import {
  LayoutDashboard, FileText, Plane, Settings, User,
  LogOut, Building2, Users, ClipboardList, Shield, Menu, X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen w-full bg-gradient-to-b from-[#855300] to-[#5a3800] text-foreground overflow-hidden font-sans">
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 shadow-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[280px] flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 bg-transparent text-white",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
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
                onClick={() => setMobileMenuOpen(false)}
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

      {/* Main Content Area (The Tuck) */}
      <main className="flex-1 overflow-y-auto bg-background md:rounded-l-[32px] md:my-4 md:mr-4 md:shadow-[-8px_0_30px_rgba(0,0,0,0.1)] transition-all duration-300 relative z-10 flex flex-col">
        <div className="flex-1 p-6 md:p-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
