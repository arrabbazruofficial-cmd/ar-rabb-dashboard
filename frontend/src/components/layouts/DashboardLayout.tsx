import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { NotificationBell } from '@/components/ui/NotificationBell';
import {
  LayoutDashboard, FileText, Plane, Bell, Settings, User,
  LogOut, Building2, Users, ClipboardList, BarChart3, Shield, ScrollText,
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
  { icon: Bell, label: 'Notifications', href: '/agency/notifications' },
  { icon: User, label: 'Profile', href: '/agency/profile' },
];

const getCustomerSidebar = (): SidebarItem[] => [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/customer' },
  { icon: Plane, label: 'Book Air Ticket', href: '/customer/book-ticket' },
  { icon: ClipboardList, label: 'My Requests', href: '/customer/requests' },
  { icon: Bell, label: 'Notifications', href: '/customer/notifications' },
  { icon: User, label: 'Profile', href: '/customer/profile' },
];

const getAdminSidebar = (): SidebarItem[] => [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Building2, label: 'Agencies', href: '/admin/agencies' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: FileText, label: 'Visa Requests', href: '/admin/visas' },
  { icon: Plane, label: 'Ticket Requests', href: '/admin/tickets' },
  { icon: ClipboardList, label: 'All Requests', href: '/admin/requests' },
  { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: ScrollText, label: 'Audit Logs', href: '/admin/audit' },
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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Al-Rabb Tours Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-sunrise bg-clip-text text-transparent leading-tight">Al-Rabb Tours</h1>
              <p className="text-xs text-muted-foreground font-medium">Enterprise Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== basePath && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between px-3">
            {user && (
              <p className="text-xs text-muted-foreground truncate" title={user.email}>{user.email}</p>
            )}
            <NotificationBell />
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-map-pattern relative">
        <div className="absolute inset-0 bg-background/90 z-0"></div>
        <div className="relative z-10 p-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
