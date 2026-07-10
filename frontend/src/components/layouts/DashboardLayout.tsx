import { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Plane,
  Bell,
  Settings,
  User,
  LogOut,
  Building2,
  Users
} from "lucide-react";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const getAgencySidebar = (): SidebarItem[] => [
  { icon: LayoutDashboard, label: "Dashboard", href: "/agency" },
  { icon: FileText, label: "Visa Services", href: "/agency/visas" },
  { icon: Plane, label: "Air Ticket Booking", href: "/agency/tickets" },
  { icon: FileText, label: "My Requests", href: "/agency/requests" },
  { icon: Bell, label: "Notifications", href: "/agency/notifications" },
  { icon: User, label: "Profile", href: "/agency/profile" },
  { icon: Settings, label: "Settings", href: "/agency/settings" },
];

const getAdminSidebar = (): SidebarItem[] => [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Building2, label: "Agencies", href: "/admin/agencies" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: FileText, label: "Visa Requests", href: "/admin/visas" },
  { icon: Plane, label: "Ticket Requests", href: "/admin/tickets" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications" },
  { icon: Settings, label: "System Settings", href: "/admin/settings" },
];

interface DashboardLayoutProps {
  children: ReactNode;
  role: "AGENCY" | "ADMIN" | "CUSTOMER";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const location = useLocation();
  const items = role === "ADMIN" ? getAdminSidebar() : getAgencySidebar(); // Simplified for Customer

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Al-Rabb Tours Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-sunrise bg-clip-text text-transparent leading-tight">
                Al-Rabb Tours
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Enterprise Platform</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-6">
          {items.map((item) => {
            const isActive = location.pathname.startsWith(item.href) && 
                             (item.href !== `/${role.toLowerCase()}` || location.pathname === `/${role.toLowerCase()}`);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-map-pattern relative">
        <div className="absolute inset-0 bg-background/90 z-0"></div>
        <div className="relative z-10 p-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
